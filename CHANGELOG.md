# Changelog

## [1.2.0] — 2026-06-18

### Added
- Landing page pública con hero, features, pricing ($30/mes o $19.99/mes anual)
- SEO dinámico por página (título + meta tags OG/Twitter)
- Sitemap.xml y robots.txt desde backend
- JWT refresh tokens con rotación automática
- Security headers (Helmet + CORS + rate limiting global)
- File upload validation (solo imágenes: JPG, PNG, WebP, GIF)
- Global error handler middleware
- Skeleton loading component
- EmptyState component
- .env.example con variables documentadas
- CHANGELOG.md

### Changed
- Frontend: Landing como página principal pública, Dashboard para autenticados
- Backend: auth middleware ahora exporta JWT_SECRET y generateRefreshToken
- Backend: multer config extraído a middleware/upload.js compartido
- Frontend: api.js interceptor con refresh token queue + retry
- Frontend: Login.jsx guarda refreshToken en localStorage
- Textos de español argentino a español neutro

### Security
- JWT_SECRET requiere variable de entorno en producción
- Rate limiting global en /api (200 req/15min)
- CORS configurado por entorno (origin específico en prod)
- Validación de tipo MIME y extensión en uploads
- Manejo de errores sin exponer stack traces en producción
