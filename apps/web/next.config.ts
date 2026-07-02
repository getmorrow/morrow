import type { NextConfig } from "next";

function withoutTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function appRewrites(sourcePrefix: string, destinationBaseUrl?: string) {
  if (!destinationBaseUrl) return [];

  const destination = withoutTrailingSlash(destinationBaseUrl);

  return [
    {
      source: sourcePrefix,
      destination: `${destination}${sourcePrefix}`,
    },
    {
      source: `${sourcePrefix}/:path*`,
      destination: `${destination}${sourcePrefix}/:path*`,
    },
  ];
}

function legacyAppRedirects() {
  return [
    {
      source: "/deine-auszeit",
      destination: "/app/gast",
      permanent: false,
    },
    {
      source: "/deine-auszeit/:path*",
      destination: "/app/gast/deine-auszeit/:path*",
      permanent: false,
    },
    {
      source: "/owner",
      destination: "/app/eigentuemer",
      permanent: false,
    },
    {
      source: "/owner/:path*",
      destination: "/app/eigentuemer/:path*",
      permanent: false,
    },
    {
      source: "/app/guest",
      destination: "/app/gast",
      permanent: false,
    },
    {
      source: "/app/guest/:path*",
      destination: "/app/gast/:path*",
      permanent: false,
    },
    {
      source: "/app/owner",
      destination: "/app/eigentuemer",
      permanent: false,
    },
    {
      source: "/app/owner/:path*",
      destination: "/app/eigentuemer/:path*",
      permanent: false,
    },
  ];
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
  },
  transpilePackages: ["@morrow/ui", "@morrow/domain", "@morrow/supabase"],
  async redirects() {
    return legacyAppRedirects();
  },
  async rewrites() {
    return [
      ...appRewrites("/admin", process.env.MORROW_ADMIN_APP_URL),
      ...appRewrites("/app/gast", process.env.MORROW_GUEST_APP_URL),
      ...appRewrites("/app/eigentuemer", process.env.MORROW_OWNER_APP_URL),
    ];
  },
};

export default nextConfig;
