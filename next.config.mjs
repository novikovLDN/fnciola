/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Заголовки безопасности (см. §6 ТЗ). HTTPS/TLS обеспечивается на уровне прокси.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
