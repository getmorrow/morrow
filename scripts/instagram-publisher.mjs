import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const planPath = path.join(root, "data/social/instagram-first-3-months-2026.json");

const DEFAULT_LOG = "data/social/instagram-post-log.json";
const DEFAULT_INSIGHT_METRICS = [
  "reach",
  "likes",
  "comments",
  "saved",
  "shares",
  "total_interactions",
];

function usage() {
  return `Usage:
  node scripts/instagram-publisher.mjs dry-run next
  node scripts/instagram-publisher.mjs dry-run 02
  node scripts/instagram-publisher.mjs post due
  node scripts/instagram-publisher.mjs insights
  node scripts/instagram-publisher.mjs assets next
  node scripts/instagram-publisher.mjs status`;
}

async function readTextIfExists(file) {
  try {
    return await fs.readFile(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

function parseEnv(text) {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const rawValue = line.slice(index + 1).trim();
        const value = rawValue.replace(/^['"]|['"]$/g, "");
        return [key, value];
      }),
  );
}

async function loadEnv() {
  const env = {
    ...parseEnv(await readTextIfExists(path.join(root, ".env"))),
    ...parseEnv(await readTextIfExists(path.join(root, ".env.local"))),
    ...process.env,
  };

  env.INSTAGRAM_API_HOST ||= "graph.instagram.com";
  env.INSTAGRAM_ASSET_PROVIDER ||= env.INSTAGRAM_ASSET_BASE_URL ? "static-url" : "supabase-storage";
  env.INSTAGRAM_STORAGE_BUCKET ||= "instagram-creatives";
  env.INSTAGRAM_SIGNED_URL_SECONDS ||= "86400";
  env.INSTAGRAM_PUBLISH_LOG ||= DEFAULT_LOG;
  return env;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

function localDateTime(date, time) {
  return new Date(`${date}T${time}:00+02:00`);
}

function daysBetween(a, b) {
  const day = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(b) - Date.parse(a)) / day);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function effectiveSchedule(post, posts, env) {
  if (!env.INSTAGRAM_LAUNCH_DATE) {
    return { date: post.date, time: post.time, shifted: false };
  }

  const firstDate = posts[0]?.date || post.date;
  const offset = daysBetween(firstDate, env.INSTAGRAM_LAUNCH_DATE);
  return {
    date: isoDate(addDays(new Date(`${post.date}T00:00:00Z`), offset)),
    time: post.time,
    shifted: true,
  };
}

function publicUrl(relativePath, env) {
  if (!env.INSTAGRAM_ASSET_BASE_URL) return "";
  const base = env.INSTAGRAM_ASSET_BASE_URL.replace(/\/$/, "");
  const publicPath = relativePath.replace(/^public\//, "");
  return `${base}/${publicPath}`;
}

function storageObjectPath(relativePath) {
  return relativePath.replace(/^public\/social\/instagram\//, "social/instagram/");
}

function supabaseClient(env) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase storage config: VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureStorageBucket(client, env) {
  const bucket = env.INSTAGRAM_STORAGE_BUCKET;
  const { error } = await client.storage.createBucket(bucket, { public: false });
  if (error && !/already exists|Duplicate/i.test(error.message)) {
    throw new Error(`Supabase bucket error: ${error.message}`);
  }
}

async function uploadAndSignAsset(assetPath, env) {
  const client = supabaseClient(env);
  await ensureStorageBucket(client, env);

  const fullPath = path.join(root, assetPath);
  const bytes = await fs.readFile(fullPath);
  const objectPath = storageObjectPath(assetPath);
  const bucket = env.INSTAGRAM_STORAGE_BUCKET;

  const { error: uploadError } = await client.storage.from(bucket).upload(objectPath, bytes, {
    contentType: "image/png",
    upsert: true,
  });
  if (uploadError) throw new Error(`Supabase upload error for ${assetPath}: ${uploadError.message}`);

  const expiresIn = Number(env.INSTAGRAM_SIGNED_URL_SECONDS || 86400);
  const { data, error: signedUrlError } = await client.storage.from(bucket).createSignedUrl(objectPath, expiresIn);
  if (signedUrlError) throw new Error(`Supabase signed URL error for ${assetPath}: ${signedUrlError.message}`);

  return {
    path: assetPath,
    storage: `supabase://${bucket}/${objectPath}`,
    url: data.signedUrl,
    signedUrlExpiresIn: expiresIn,
  };
}

async function assetDescriptor(assetPath, env, { sign = false } = {}) {
  if (env.INSTAGRAM_ASSET_PROVIDER === "supabase-storage") {
    if (sign) return uploadAndSignAsset(assetPath, env);
    return {
      path: assetPath,
      storage: `supabase://${env.INSTAGRAM_STORAGE_BUCKET}/${storageObjectPath(assetPath)}`,
      url: "",
    };
  }

  return {
    path: assetPath,
    url: publicUrl(assetPath, env),
  };
}

async function carouselSlidePaths(post) {
  const dir = path.join(root, "public/social/instagram/carousels", `morrow-instagram-${post.id}`);
  const files = await fs.readdir(dir);
  return files
    .filter((file) => file.endsWith(".png"))
    .sort()
    .map((file) => `public/social/instagram/carousels/morrow-instagram-${post.id}/${file}`);
}

async function postAssets(post, env, options = {}) {
  if (post.slides?.length) {
    const slides = await carouselSlidePaths(post);
    return Promise.all(slides.map((assetPath) => assetDescriptor(assetPath, env, options)));
  }

  const stillPath = `public/social/instagram/stills/morrow-instagram-${post.id}.png`;
  return [await assetDescriptor(stillPath, env, options)];
}

function graphBase(env) {
  const host = env.INSTAGRAM_API_HOST || "graph.instagram.com";
  const version = env.INSTAGRAM_API_VERSION ? `/${env.INSTAGRAM_API_VERSION.replace(/^\//, "")}` : "";
  return `https://${host}${version}`;
}

async function graphRequest(env, pathname, params) {
  const url = `${graphBase(env)}/${pathname.replace(/^\//, "")}`;
  const body = new URLSearchParams({
    ...params,
    access_token: env.INSTAGRAM_ACCESS_TOKEN,
  });

  const response = await fetch(url, { method: "POST", body });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.error) {
    const message = json.error?.message || response.statusText;
    throw new Error(`Meta API error on ${pathname}: ${message}`);
  }
  return json;
}

async function graphGet(env, pathname, params = {}) {
  const url = new URL(`${graphBase(env)}/${pathname.replace(/^\//, "")}`);
  for (const [key, value] of Object.entries({ ...params, access_token: env.INSTAGRAM_ACCESS_TOKEN })) {
    if (value) url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.error) {
    const message = json.error?.message || response.statusText;
    throw new Error(`Meta API error on ${pathname}: ${message}`);
  }
  return json;
}

function assertPublishEnv(env) {
  const missing = ["INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_PROFESSIONAL_ACCOUNT_ID"].filter((key) => !env[key]);
  if (env.INSTAGRAM_ASSET_PROVIDER === "static-url" && !env.INSTAGRAM_ASSET_BASE_URL) {
    missing.push("INSTAGRAM_ASSET_BASE_URL");
  }

  if (missing.length) {
    throw new Error(`Missing Instagram publish config: ${missing.join(", ")}`);
  }
}

function alreadyPublished(log, post) {
  return log.some((entry) => entry.postId === post.id && entry.status === "published");
}

function pickPost(posts, log, mode, env) {
  const unpublished = posts.filter((post) => !alreadyPublished(log, post));
  if (mode === "next") return unpublished[0];

  if (mode === "due") {
    const now = new Date();
    return unpublished.find((post) => {
      const schedule = effectiveSchedule(post, posts, env);
      return localDateTime(schedule.date, schedule.time) <= now;
    });
  }

  return posts.find((post) => post.id === mode || post.sourceId === mode);
}

async function summarizePost(post, posts, env) {
  const schedule = effectiveSchedule(post, posts, env);
  const assets = await postAssets(post, env);
  return {
    postId: post.id,
    schedule: `${schedule.date} ${schedule.time}${schedule.shifted ? " (Launch-Offset)" : ""}`,
    format: post.slides?.length ? "Carousel" : "Single Still",
    headline: post.headline,
    caption: post.caption,
    assets,
  };
}

async function publishPost(post, posts, env) {
  assertPublishEnv(env);
  const assets = await postAssets(post, env, { sign: true });
  const missingUrls = assets.filter((asset) => !asset.url);
  if (missingUrls.length) {
    throw new Error("Assets do not have fetchable URLs. Check INSTAGRAM_ASSET_PROVIDER.");
  }

  if (!post.slides?.length) {
    const container = await graphRequest(env, `${env.INSTAGRAM_PROFESSIONAL_ACCOUNT_ID}/media`, {
      image_url: assets[0].url,
      caption: post.caption,
      alt_text: post.headline,
    });
    const published = await graphRequest(env, `${env.INSTAGRAM_PROFESSIONAL_ACCOUNT_ID}/media_publish`, {
      creation_id: container.id,
    });
    return { creationId: container.id, mediaId: published.id, assets };
  }

  const childIds = [];
  for (const asset of assets) {
    const child = await graphRequest(env, `${env.INSTAGRAM_PROFESSIONAL_ACCOUNT_ID}/media`, {
      image_url: asset.url,
      is_carousel_item: "true",
      alt_text: post.headline,
    });
    childIds.push(child.id);
  }

  const container = await graphRequest(env, `${env.INSTAGRAM_PROFESSIONAL_ACCOUNT_ID}/media`, {
    media_type: "CAROUSEL",
    children: childIds.join(","),
    caption: post.caption,
  });
  const published = await graphRequest(env, `${env.INSTAGRAM_PROFESSIONAL_ACCOUNT_ID}/media_publish`, {
    creation_id: container.id,
  });
  return { creationId: container.id, childIds, mediaId: published.id, assets };
}

async function main() {
  const [command = "status", target = command === "dry-run" ? "next" : "due"] = process.argv.slice(2);
  const env = await loadEnv();
  const posts = await readJson(planPath, []);
  const logPath = path.join(root, env.INSTAGRAM_PUBLISH_LOG || DEFAULT_LOG);
  const log = await readJson(logPath, []);

  if (!posts.length) throw new Error("Instagram plan is empty.");

  if (command === "status") {
    const published = log.filter((entry) => entry.status === "published").length;
    const next = pickPost(posts, log, "next", env);
    const due = pickPost(posts, log, "due", env);
    console.log(`Plan: ${posts.length} posts`);
    console.log(`Published: ${published}`);
    console.log(`Next: ${next ? `${next.id} - ${next.headline}` : "none"}`);
    console.log(`Due: ${due ? `${due.id} - ${due.headline}` : "none"}`);
    return;
  }

  if (command === "dry-run") {
    const post = pickPost(posts, log, target, env);
    if (!post) {
      console.log(`No post found for "${target}".`);
      return;
    }
    console.log(JSON.stringify(await summarizePost(post, posts, env), null, 2));
    return;
  }

  if (command === "assets") {
    const post = pickPost(posts, log, target, env);
    if (!post) {
      console.log(`No post found for "${target}".`);
      return;
    }
    const assets = await postAssets(post, env, { sign: env.INSTAGRAM_ASSET_PROVIDER === "supabase-storage" });
    console.log(JSON.stringify({ postId: post.id, headline: post.headline, provider: env.INSTAGRAM_ASSET_PROVIDER, assets }, null, 2));
    return;
  }

  if (command === "post") {
    const post = pickPost(posts, log, target, env);
    if (!post) {
      console.log(`No unpublished post found for "${target}".`);
      return;
    }

    const schedule = effectiveSchedule(post, posts, env);
    const result = await publishPost(post, posts, env);
    const entry = {
      postId: post.id,
      status: "published",
      mediaId: result.mediaId,
      creationId: result.creationId,
      childIds: result.childIds || [],
      headline: post.headline,
      scheduledFor: `${schedule.date}T${schedule.time}:00+02:00`,
      publishedAt: new Date().toISOString(),
      assets: result.assets,
    };
    log.push(entry);
    await writeJson(logPath, log);
    console.log(JSON.stringify(entry, null, 2));
    return;
  }

  if (command === "insights") {
    if (!env.INSTAGRAM_ACCESS_TOKEN) throw new Error("Missing INSTAGRAM_ACCESS_TOKEN.");
    const published = log.filter((entry) => entry.status === "published" && entry.mediaId);
    const rows = [];
    for (const entry of published) {
      const metrics = env.INSTAGRAM_INSIGHT_METRICS || DEFAULT_INSIGHT_METRICS.join(",");
      const data = await graphGet(env, `${entry.mediaId}/insights`, { metric: metrics });
      rows.push({
        postId: entry.postId,
        mediaId: entry.mediaId,
        headline: entry.headline,
        metrics: Object.fromEntries((data.data || []).map((metric) => [metric.name, metric.values?.[0]?.value ?? null])),
      });
    }
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  throw new Error(usage());
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
