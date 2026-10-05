import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB, DatabaseStatus } from './config/db';
import { loadRuntimeConfig, RuntimeConfig } from './config/runtime';
import { createCorsOptions } from './config/cors';
import { errorHandler } from './middleware/errors';
import { safeLogger } from './utils/safeLogger';

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

  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
  app.use(limiter);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
    const status = databaseStatus.ready ? 'ok' : 'degraded';
    res.json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        api: 'ok',
        database: databaseStatus.ready ? 'ok' : 'unavailable',
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
