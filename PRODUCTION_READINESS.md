# NawaMart Production Readiness

This repo now includes application-level guardrails for the 13 production layers, but several layers must be completed inside Railway, Vercel, MongoDB Atlas, Cloudinary, email, and monitoring providers.

## Status by Layer

| Layer | Repo status | Provider-side requirement |
| --- | --- | --- |
| Authentication & permissions | JWT auth, role guards, owner-only order access, protected uploads, socket auth | Rotate `JWT_SECRET`; keep it 32+ chars; add MFA for admin/provider accounts |
| Hosting & deployment | Railway and Vercel configs present | Connect production domains and enforce HTTPS |
| Cloud & compute | Railway health/readiness checks and two replicas configured | Use paid/non-sleeping Railway plan; set CPU/memory alerts |
| CI/CD & version control | GitHub Actions build/test workflow added | Protect `main`; require CI before merge/deploy |
| Security & RLS | App-level tenant filters and owner checks | MongoDB has no native RLS; use separate least-privileged DB user and never expose Mongo credentials/client SDK |
| Rate limiting | Global and auth-specific API rate limits | Add edge/WAF rate limits for expensive endpoints and uploads |
| Caching & CDN | Vercel immutable asset cache and static upload cache headers | Put uploads on Cloudinary/S3 CDN before serious traffic |
| Load balancing & scaling | Stateless API health checks and replicas | Use sticky sessions or Redis adapter before scaling Socket.io beyond one region |
| Error tracking & logs | Request IDs, structured production error logs | Add Sentry/Logtail/Datadog and alert on 5xx/error rate |
| Database hardening | Pool limits, query indexes in models | Enable Atlas backups/PITR, private networking/IP allowlist, slow query alerts |
| Availability & recovery | Graceful shutdown and readiness probe | Use Atlas replica set, tested restore drills, incident runbook |
| Input validation | Mongoose validation, request sanitization, ObjectId checks | Add schema validators for every write endpoint as the API grows |
| Analytics & operations | Existing admin dashboards, email service hooks | Add product analytics, background queue for email/jobs, failed-job retries |

## Required Production Environment

Backend:

- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `GOOGLE_CLIENT_ID`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- Optional: `RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_MAX`, `MONGODB_MAX_POOL_SIZE`

Frontend:

- `VITE_API_URL`
- `VITE_SOCKET_URL`
- `VITE_GOOGLE_CLIENT_ID`

## Launch Checklist

- Enable GitHub branch protection on `main`.
- Require the CI workflow to pass before deployment.
- Configure Railway health check to `/api/ready`.
- Use MongoDB Atlas automated backups and test a restore.
- Restrict MongoDB network access and create a least-privileged application user.
- Move local uploads to Cloudinary/S3-compatible persistent object storage before multi-replica production.
- Add Sentry or another error tracker for backend and frontend.
- Add uptime monitoring for `/api/health` and `/api/ready`.
- Create admin accounts manually; keep `/api/admin/seed` unavailable in production.
- Rotate all secrets after deployment setup.
