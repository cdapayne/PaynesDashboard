import { Router, Response } from 'express';
import { userService } from '../../services';
import { authenticateToken, AuthenticatedRequest } from '../../middleware';
import { WidgetLayout } from '../../types';

const router = Router();

// Get user preferences
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const preferences = userService.getUserPreferences(req.user!.userId);

  if (!preferences) {
    res.status(404).json({
      success: false,
      error: 'Preferences not found',
    });
    return;
  }

  res.json({
    success: true,
    data: preferences,
  });
});

// Update user preferences
router.put('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { theme, notifications } = req.body;

  const updates: { theme?: 'light' | 'dark' | 'system'; notifications?: boolean } = {};

  if (theme && ['light', 'dark', 'system'].includes(theme)) {
    updates.theme = theme;
  }

  if (typeof notifications === 'boolean') {
    updates.notifications = notifications;
  }

  const updated = userService.updateUserPreferences(req.user!.userId, updates);

  if (!updated) {
    res.status(404).json({
      success: false,
      error: 'Preferences not found',
    });
    return;
  }

  res.json({
    success: true,
    data: updated,
  });
});

// Update dashboard layout
router.put('/layout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { layout } = req.body;

  if (!Array.isArray(layout)) {
    res.status(400).json({
      success: false,
      error: 'Layout must be an array',
    });
    return;
  }

  // Validate layout items
  const isValidLayout = layout.every(
    (item: WidgetLayout) =>
      typeof item.i === 'string' &&
      typeof item.x === 'number' &&
      typeof item.y === 'number' &&
      typeof item.w === 'number' &&
      typeof item.h === 'number'
  );

  if (!isValidLayout) {
    res.status(400).json({
      success: false,
      error: 'Invalid layout format',
    });
    return;
  }

  const updated = userService.updateDashboardLayout(req.user!.userId, layout);

  if (!updated) {
    res.status(404).json({
      success: false,
      error: 'Preferences not found',
    });
    return;
  }

  res.json({
    success: true,
    data: updated,
  });
});

export default router;
