import { Router, Request, Response } from 'express';
import { aiService } from '../../integrations/ai';
import { authenticateToken, AuthenticatedRequest } from '../../middleware';

const router = Router();

// Check if AI service is configured
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      configured: aiService.isConfigured(),
      message: aiService.isConfigured() 
        ? 'OpenAI API is configured and ready' 
        : 'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.',
    },
  });
});

// Generate content
router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!aiService.isConfigured()) {
    res.status(503).json({
      success: false,
      error: 'OpenAI API not configured',
    });
    return;
  }

  const { type, context, tone, maxTokens } = req.body;

  if (!type || !context) {
    res.status(400).json({
      success: false,
      error: 'Type and context are required',
    });
    return;
  }

  const validTypes = ['app-description', 'release-notes', 'marketing-copy', 'social-post'];
  if (!validTypes.includes(type)) {
    res.status(400).json({
      success: false,
      error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
    });
    return;
  }

  try {
    const result = await aiService.generateContent({
      type,
      context,
      tone,
      maxTokens,
    });

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate content',
      });
      return;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Generate app description
router.post('/app-description', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!aiService.isConfigured()) {
    res.status(503).json({
      success: false,
      error: 'OpenAI API not configured',
    });
    return;
  }

  const { appName, features } = req.body;

  if (!appName || !features || !Array.isArray(features)) {
    res.status(400).json({
      success: false,
      error: 'appName and features array are required',
    });
    return;
  }

  try {
    const content = await aiService.generateAppDescription(appName, features);

    if (!content) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate app description',
      });
      return;
    }

    res.json({
      success: true,
      data: { content },
    });
  } catch (error) {
    console.error('AI app description error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Generate release notes
router.post('/release-notes', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!aiService.isConfigured()) {
    res.status(503).json({
      success: false,
      error: 'OpenAI API not configured',
    });
    return;
  }

  const { version, changes } = req.body;

  if (!version || !changes || !Array.isArray(changes)) {
    res.status(400).json({
      success: false,
      error: 'version and changes array are required',
    });
    return;
  }

  try {
    const content = await aiService.generateReleaseNotes(version, changes);

    if (!content) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate release notes',
      });
      return;
    }

    res.json({
      success: true,
      data: { content },
    });
  } catch (error) {
    console.error('AI release notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Generate social post
router.post('/social-post', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!aiService.isConfigured()) {
    res.status(503).json({
      success: false,
      error: 'OpenAI API not configured',
    });
    return;
  }

  const { topic, platform } = req.body;

  if (!topic || !platform) {
    res.status(400).json({
      success: false,
      error: 'topic and platform are required',
    });
    return;
  }

  try {
    const content = await aiService.generateSocialPost(topic, platform);

    if (!content) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate social post',
      });
      return;
    }

    res.json({
      success: true,
      data: { content },
    });
  } catch (error) {
    console.error('AI social post error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
