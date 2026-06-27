import type { NextConfig } from "next";

function withoutTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function appRedirects(sourcePrefix: string, destinationBaseUrl?: string) {
  if (!destinationBaseUrl) return [];

  const destination = withoutTrailingSlash(destinationBaseUrl);

  return [
    {
      source: sourcePrefix,
      destination,
      permanent: false,
    },
    {
      source: `${sourcePrefix}/:path*`,
      destination: `${destination}/:path*`,
      permanent: false,
    },
  ];
}

function guestAppRedirects(destinationBaseUrl?: string) {
  if (!destinationBaseUrl) return [];

  const destination = withoutTrailingSlash(destinationBaseUrl);

  return [
    {
      source: "/deine-auszeit",
      destination,
      permanent: false,
    },
    {
      source: "/deine-auszeit/:path*",
      destination: `${destination}/deine-auszeit/:path*`,
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
    return [
      ...appRedirects("/admin", process.env.MORROW_ADMIN_APP_URL),
      ...guestAppRedirects(process.env.MORROW_GUEST_APP_URL),
      ...appRedirects("/owner", process.env.MORROW_OWNER_APP_URL),
      ...appRedirects("/app/eigentuemer", process.env.MORROW_OWNER_APP_URL),
    ];
  },
};

export default nextConfig;
