const withPWA = require("@ducanh2912/next-pwa").default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

module.exports = withPWA({
  dest: "public",
  // cacheOnFrontEndNav caches whatever HTML a client-side navigation (i.e.
  // router.push, which uses history.pushState) receives, keyed by the
  // pushed URL, and never re-fetches once an entry exists. If a nav to an
  // auth-gated route ever completes before the session cookie propagates,
  // the resulting (possibly redirected-to-login) response gets cached
  // permanently under that route's URL and is replayed on any later
  // network hiccup, regardless of the runtimeCaching rule below — this
  // was the actual cause of the Android login loop, so both flags stay off.
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  revalidateAfterOffline: true,
  disable: process.env.NODE_ENV === "development",
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        // Auth-gated routes must never be served from the SW cache: a
        // pre-login prefetch of /admin or /cleaner gets redirected to
        // /login by middleware, and caching that redirect causes an
        // infinite login loop after a successful sign-in. The prefix list
        // is inlined (not a closed-over reference) because Workbox
        // serializes this function via toString() into the generated
        // sw.js, where outer-scope identifiers wouldn't exist.
        urlPattern: ({ url, sameOrigin }) =>
          sameOrigin &&
          ["/login", "/admin", "/cleaner", "/set-password"].some((prefix) =>
            url.pathname.startsWith(prefix)
          ),
        handler: "NetworkOnly",
      },
    ],
  },
})(nextConfig);
