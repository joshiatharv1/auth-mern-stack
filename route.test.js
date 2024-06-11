import request from 'supertest';
import app, { closeServer } from './app.js';
import { Sequelize } from 'sequelize';
import UserModel from './Models/user.js';
import dbConfig from './Config/databaseCon.js';
let sequelize;
  let User;
  beforeAll(async () => {
    sequelize = new Sequelize(
      dbConfig.DB,
      dbConfig.USER,
      dbConfig.PASSWORD,
      {
        host: dbConfig.HOST,
        dialect: 'mysql'
      }
    );

    User = UserModel(sequelize, Sequelize.DataTypes);

    try {
      await sequelize.sync({ force: true });
      console.log('Database synchronization completed');
    } catch (error) {
      console.error('Error synchronizing the database:', error);
    }
  });


  describe('User Registration Endpoint', () => {
    it('Should successfully register a new user', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe@example.com',
        password: 'password123'
      };
      const postResponse = await request(app)
        .post('/v2/user')
        .send(userData);
      expect(postResponse.status).toBe(201);
      await User.update({ isVerified: true }, { where: { username: userData.username } });
 
  
      const authHeader = Buffer.from(`${userData.username}:${userData.password}`).toString('base64');
      const authToken = `Basic ${authHeader}`;
  
      const getResponse = await request(app)
        .get('/v2/user/self')
        .set('Authorization', authToken);
      expect(getResponse.status).toBe(200);
    });
  });
  
  describe('Update User Details (PUT /v2/user/self)', () => {
    it('Should update user details successfully', async () => {
      // Register a new user
      const userData = {
        first_name: 'abc',
        last_name: 'def',
        username: 'def@example.com',
        password: 'password123'
      };
      const postResponse = await request(app)
        .post('/v2/user')
        .send(userData);
      expect(postResponse.status).toBe(201);
  
      // Authenticate with the original password
      const authHeader = Buffer.from(`${userData.username}:${userData.password}`).toString('base64');
      const authToken = `Basic ${authHeader}`;
  
      // Get the initial user details
      const initialUserResponse = await request(app)
        .get('/v2/user/self')
        .set('Authorization', authToken);
      expect(initialUserResponse.status).toBe(200);
  
      // Update user details
      const updatedUserData = {
        first_name: 'Atharv',
        last_name: 'Joshi',
        password: 'atharv123'
      };
      const updatedResponse = await request(app)
        .put('/v2/user/self')
        .set('Authorization', authToken)
        .send(updatedUserData);
      expect(updatedResponse.status).toBe(204);
  
      // Re-authenticate with the new password
      const newAuthHeader = Buffer.from(`${userData.username}:${updatedUserData.password}`).toString('base64');
      const newAuthToken = `Basic ${newAuthHeader}`;
  
      // Get the updated user details
      const updatedUserResponse = await request(app)
        .get('/v2/user/self')
        .set('Authorization', newAuthToken);
      expect(updatedUserResponse.status).toBe(200);
    });
  });

  afterAll(async () => {
    try {
      await sequelize.close();
      console.log('Database connection closed');
      closeServer();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  });