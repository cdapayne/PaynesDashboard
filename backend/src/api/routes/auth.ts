import { Router, Request, Response } from 'express';
import { userService } from '../../services';
import { authenticateToken, AuthenticatedRequest, authLimiter } from '../../middleware';
import { LoginRequest, RegisterRequest } from '../../types';

const router = Router();

// Register new user
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name }: RegisterRequest = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
      });
      return;
    }

    const user = await userService.createUser(email, password, name);
    const token = userService.generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
});

// Login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    const user = await userService.validateCredentials(email, password);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    const token = userService.generateToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

// Get current user
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = userService.getUserById(req.user!.userId);

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'User not found',
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

// Logout (client-side token removal, but we can track it server-side if needed)
router.post('/logout', authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
  // In a production app, you might want to invalidate the token server-side
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
