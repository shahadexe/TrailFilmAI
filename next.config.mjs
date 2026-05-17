/** @type {import('next').NextConfig} */

// TODO: tighten to specific Supabase project hostname after confirming project ref.
// Current wildcard permits any *.supabase.co subdomain for next/image optimization,
// which allows the image proxy to be used for content from any Supabase project.
// Replace with the exact project hostname derived from NEXT_PUBLIC_SUPABASE_URL:
//   hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
// This requires NEXT_PUBLIC_SUPABASE_URL to be available at build time (it is, via .env.local).
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '**.supabase.co'

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
      },
    ],
  },
};

export default nextConfig;
