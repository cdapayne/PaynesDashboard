import { userService } from '../services/userService';

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';

      const user = await userService.createUser(email, password, name);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.password).not.toBe(password); // Should be hashed
      expect(user.id).toBeDefined();
    });

    it('should throw error for duplicate email', async () => {
      const email = 'duplicate@example.com';
      const password = 'password123';
      const name = 'Test User';

      await userService.createUser(email, password, name);

      await expect(
        userService.createUser(email, password, 'Another User')
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials', async () => {
      const email = 'validate@example.com';
      const password = 'password123';
      const name = 'Test User';

      await userService.createUser(email, password, name);
      const user = await userService.validateCredentials(email, password);

      expect(user).toBeDefined();
      expect(user?.email).toBe(email);
    });

    it('should return null for invalid credentials', async () => {
      const email = 'invalid@example.com';
      const password = 'password123';
      const name = 'Test User';

      await userService.createUser(email, password, name);
      const user = await userService.validateCredentials(email, 'wrongpassword');

      expect(user).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const email = 'token@example.com';
      const password = 'password123';
      const name = 'Test User';

      const user = await userService.createUser(email, password, name);
      const token = userService.generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format
    });
  });

  describe('getUserPreferences', () => {
    it('should return default preferences for new user', async () => {
      const email = 'prefs@example.com';
      const password = 'password123';
      const name = 'Test User';

      const user = await userService.createUser(email, password, name);
      const preferences = userService.getUserPreferences(user.id);

      expect(preferences).toBeDefined();
      expect(preferences?.theme).toBe('system');
      expect(preferences?.notifications).toBe(true);
      expect(preferences?.dashboardLayout).toBeDefined();
      expect(Array.isArray(preferences?.dashboardLayout)).toBe(true);
    });
  });
});
