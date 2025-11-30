import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { User, AuthPayload, UserPreferences, WidgetLayout } from '../types';

// In-memory storage (replace with database in production)
const users: Map<string, User> = new Map();
const preferences: Map<string, UserPreferences> = new Map();

const defaultLayout: WidgetLayout[] = [
  { i: 'analytics', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'social', x: 4, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'affiliate', x: 8, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
  { i: 'rss', x: 0, y: 3, w: 6, h: 4, minW: 3, minH: 2 },
  { i: 'ai', x: 6, y: 3, w: 6, h: 4, minW: 3, minH: 2 },
];

export class UserService {
  async createUser(email: string, password: string, name: string): Promise<User> {
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: this.generateId(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(user.id, user);

    // Create default preferences
    const userPrefs: UserPreferences = {
      userId: user.id,
      theme: 'system',
      dashboardLayout: defaultLayout,
      notifications: true,
    };
    preferences.set(user.id, userPrefs);

    return user;
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  generateToken(user: User): string {
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
    };

    const options: SignOptions = {
      expiresIn: config.jwt.expiresIn,
    };

    return jwt.sign(payload, config.jwt.secret, options);
  }

  getUserById(id: string): User | undefined {
    return users.get(id);
  }

  getUserPreferences(userId: string): UserPreferences | undefined {
    return preferences.get(userId);
  }

  updateUserPreferences(userId: string, updates: Partial<UserPreferences>): UserPreferences | null {
    const existing = preferences.get(userId);
    if (!existing) {
      return null;
    }

    const updated: UserPreferences = {
      ...existing,
      ...updates,
      userId, // Ensure userId can't be changed
    };

    preferences.set(userId, updated);
    return updated;
  }

  updateDashboardLayout(userId: string, layout: WidgetLayout[]): UserPreferences | null {
    return this.updateUserPreferences(userId, { dashboardLayout: layout });
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const userService = new UserService();
