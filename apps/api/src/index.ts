import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB, DatabaseStatus } from './config/db';
import { loadRuntimeConfig, RuntimeConfig } from './config/runtime';
import { createCorsOptions } from './config/cors';
import { errorHandler } from './middleware/errors';
import { createApiLimiter, createLoginLimiter, createSubmissionLimiter, resolveTrustProxy } from './middleware/rateLimits';
import { safeLogger } from './utils/safeLogger';
import { isCvUploadRequest, PUBLIC_UPLOAD_FOLDERS, uploadsRoot } from './utils/cvFiles';

import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import serviceRoutes from './routes/services';
import partnerRoutes from './routes/partners';
import teamRoutes from './routes/team';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import messageRoutes from './routes/messages';
import settingsRoutes from './routes/settings';
import uploadRoutes from './routes/upload';
import statsRoutes from './routes/stats';
import pageContentRoutes from './routes/pageContent';
import successStoryRoutes from './routes/successStories';
import projectCategoryRoutes from './routes/projectCategories';
import sitemapRoutes from './routes/sitemap';

dotenv.config();

const defaultDatabaseStatus: DatabaseStatus = {
  mode: 'unavailable',
  ready: false,
  isNewDatabase: false,
};

export function createApp(
  databaseStatus: DatabaseStatus = defaultDatabaseStatus,
  runtimeConfig: RuntimeConfig = loadRuntimeConfig()
) {
  const app = express();
  // The API runs behind nginx on the same machine. Trusting only the local proxy
  // lets req.ip be the real visitor IP, so each visitor gets their own rate limit.
  app.set('trust proxy', resolveTrustProxy());
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(cors(createCorsOptions(runtimeConfig)));
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && !runtimeConfig.allowedOrigins.includes(origin)) {
      res.status(403).json({ message: 'Origin not allowed', code: 'CORS_ORIGIN_DENIED' });
      return;
    }
    next();
  });

  // Applicant CVs are personal data: the public /uploads route never serves them, however the
  // path is spelled. The dashboard downloads them through GET /api/applications/:id/cv instead.
  app.use('/uploads', (req, res, next) => {
    if (!isCvUploadRequest(req.path)) {
      next();
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(404).json({ message: 'Not found' });
  });

  // Uploaded files are served before the rate limiter: viewing images must not use up
  // the request budget. Image/video names are unique, so browsers may cache them for a week.
  // Only these folders are public, so nothing else under uploads/ can be reached by any path.
  for (const folder of PUBLIC_UPLOAD_FOLDERS) {
    app.use(`/uploads/${folder}`, express.static(path.join(uploadsRoot, folder), {
      maxAge: '7d',
      immutable: true,
    }));
  }

  // The sitemap is one cheap query; crawlers fetch it via the public site (nginx proxy).
  app.use('/sitemap.xml', sitemapRoutes);

  app.use(createApiLimiter());
  app.use('/api/auth/login', createLoginLimiter());
  app.use(['/api/messages/submit', '/api/applications/submit'], createSubmissionLimiter());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/partners', partnerRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/content', pageContentRoutes);
  app.use('/api/success-stories', successStoryRoutes);
  app.use('/api/project-categories', projectCategoryRoutes);

  app.get('/health', (_req, res) => {
    // Checked on every request: the JSON "status" turns "degraded" when the database drops
    // after startup (the HTTP code stays 200 by contract, so monitors should check the body).
    const databaseUp = databaseStatus.ready && (databaseStatus.isConnected ? databaseStatus.isConnected() : true);
    const status = databaseUp ? 'ok' : 'degraded';
    res.json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        api: 'ok',
        database: databaseUp ? 'ok' : 'unavailable',
      },
      mode: runtimeConfig.nodeEnv,
      database: {
        mode: databaseStatus.mode,
      },
    });
  });

  app.use(errorHandler);

  return app;
}

export async function startServer() {
  const runtimeConfig = loadRuntimeConfig();
  const databaseStatus = await connectDB();
  if (databaseStatus.ready && databaseStatus.mode === 'memory' && databaseStatus.isNewDatabase) {
    const { autoSeed } = await import('./autoSeed.js');
    await autoSeed();
  }

  const app = createApp(databaseStatus, runtimeConfig);

  app.listen(runtimeConfig.port, () => {
    if (runtimeConfig.nodeEnv === 'production') {
      safeLogger.info(`Fortune API running in production on port ${runtimeConfig.port}.`);
      return;
    }

    safeLogger.info(`Fortune API running on http://localhost:${runtimeConfig.port}`);
  });
}

if (require.main === module) {
  void startServer().catch((error) => {
    safeLogger.error('API startup failed.', error);
    process.exit(1);
  });
}

export default createApp;
