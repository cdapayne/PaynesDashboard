/**
 * Campaign Module Index
 * 
 * Export all campaign management classes and interfaces
 */

export {
  CampaignManager,
  defaultCampaignManager,
} from './CampaignManager.js';

export type {
  SocialConnector,
  CampaignStatus,
  ScheduleOptions,
  CreateCampaignOptions,
} from './CampaignManager.js';

export { OnlySocialConnector } from './OnlySocialConnector.js';
export type { OnlySocialAuthConfig } from './OnlySocialConnector.js';

export { PostlyConnector } from './PostlyConnector.js';
export type { PostlyAuthConfig } from './PostlyConnector.js';
