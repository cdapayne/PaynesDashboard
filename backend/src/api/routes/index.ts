import { Router } from 'express';
import authRoutes from './auth';
import preferencesRoutes from './preferences';
import widgetsRoutes from './widgets';
import aiRoutes from './ai';
import rssRoutes from './rss';

const router = Router();

router.use('/auth', authRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/widgets', widgetsRoutes);
router.use('/ai', aiRoutes);
router.use('/rss', rssRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
    },
  });
});

export default router;
