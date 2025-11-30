import { Router } from 'express';
import authRoutes from './auth';
import preferencesRoutes from './preferences';
import widgetsRoutes from './widgets';

const router = Router();

router.use('/auth', authRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/widgets', widgetsRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

export default router;
