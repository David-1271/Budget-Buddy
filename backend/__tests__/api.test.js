const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../testServer.js'); // Use the test server file
const User = require('../models/User');

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/budget_buddy_test';
process.env.JWT_SECRET = 'test_secret_key';

describe('Budget Buddy API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    // Clean up test database and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Authentication Endpoints', () => {
    it('should register a new user', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
    });

    it('should login an existing user', async () => {
      const userData = {
        email: 'testuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should fail login with incorrect credentials', async () => {
      const userData = {
        email: 'testuser@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(userData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Budget Endpoints', () => {
    let authToken;
    let testUserId;

    beforeAll(async () => {
      // Create and login a test user
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'budgettest@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'budgettest@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
      testUserId = loginResponse.body.user.id;
    });

    it('should create a new budget', async () => {
      const budgetData = {
        category: 'Food & Dining',
        amount: 500,
        period: 'monthly'
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(201);

      expect(response.body.category).toBe(budgetData.category);
      expect(response.body.amount).toBe(budgetData.amount);
    });

    it('should get all budgets for the user', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Transaction Endpoints', () => {
    let authToken;

    beforeAll(async () => {
      // Create and login a test user
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'transactiontest@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'transactiontest@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('should create a new transaction', async () => {
      const transactionData = {
        date: new Date().toISOString(),
        description: 'Test transaction',
        category: 'Food & Dining',
        amount: 50,
        type: 'expense'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.description).toBe(transactionData.description);
      expect(response.body.category).toBe(transactionData.category);
      expect(response.body.amount).toBe(transactionData.amount);
    });

    it('should get all transactions for the user', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Profile Endpoints', () => {
    let authToken;
    let testUser;

    beforeAll(async () => {
      // Create and login a test user
      const userData = {
        firstName: 'Test',
        lastName: 'Profile',
        email: 'profiletest@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profiletest@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
      testUser = loginResponse.body.user;
    });

    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body._id).toBe(testUser.id);
      expect(response.body.firstName).toBe(testUser.firstName);
      expect(response.body.lastName).toBe(testUser.lastName);
    });

    it('should update user profile', async () => {
      const updatedProfile = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'This is a test bio'
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedProfile)
        .expect(200);

      expect(response.body.firstName).toBe(updatedProfile.firstName);
      expect(response.body.lastName).toBe(updatedProfile.lastName);
      expect(response.body.profile.bio).toBe(updatedProfile.bio);
    });
  });
});