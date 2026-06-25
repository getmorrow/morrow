import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@morrow/ui", "@morrow/domain", "@morrow/supabase"],
};

export default nextConfig;
