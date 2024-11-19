// const request = require('supertest');
const app = require("../backend/src/app"); //Verificar
// const mysqlMock = require('../  mocks/mysqlMock');
// const mongodbMock = require('../mocks/mongodbMock');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// jest.mock('../backend/src/DB/mysql', () => mysqlMock); 
// jest.mock('../backend/src/DB/mongodb', () => mongodbMock); 

jest.mock("../backend/src/DB/mongodb", () => {
    const mongodbMock = require("./mocks/mongodbMock");
    return mongodbMock;
  });
  jest.mock("../backend/src/DB/mysql", () => {
    const mysqlMock = require("./mocks/mysqlMock");
    return mysqlMock;
  });

describe('Users API', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpia los mocks después de cada prueba
    });

    describe('POST /users', () => {
        it('should create a new user in MySQL and MongoDB', async () => {
            const newUser = {
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
            };

            const hashedPassword = await bcrypt.hash(newUser.password, 10);

            // Mock de MySQL
            mysqlMock.addUser.mockResolvedValue({
                user: {
                    id: '12345',
                    username: 'testuser',
                    email: 'test@example.com',
                    password: hashedPassword,
                },
            });

            // Mock de MongoDB
            mongodbMock.__mocks__.mockSave.mockResolvedValue(); // Simula que `save` fue exitoso

            const response = await request(app).post('/users').send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('username', 'testuser');

            // Verifica que los mocks fueron llamados
            expect(mysqlMock.addUser).toHaveBeenCalledWith('users', expect.any(Object));
            expect(mongodbMock.Project).toHaveBeenCalledWith(expect.objectContaining({
                userId: '12345',
                name: 'Main Project',
                status: 'default',
            }));
        });
    });

    describe('POST /users/login', () => {
        it('should log in a user successfully', async () => {
            const userLogin = {
                email: 'test@example.com',
                password: 'password123',
            };

            const hashedPassword = await bcrypt.hash(userLogin.password, 10);

            // Mock de MySQL
            mysqlMock.findUserByEmail.mockResolvedValue({
                id: '12345',
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPassword,
            });

            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true); // Simula la verificación de contraseña

            const response = await request(app).post('/users/login').send(userLogin);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('username', 'testuser');
        });
    });

    describe('GET /users', () => {
        it('should fetch all users from MySQL', async () => {
            mysqlMock.allUsers.mockResolvedValue([{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }]);

            const response = await request(app).get('/users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.any(Array));
            expect(response.body.length).toBe(2);
            expect(mysqlMock.allUsers).toHaveBeenCalledWith('users');
        });
    });

    describe('GET /users/:id', () => {
        it('should fetch a specific user by ID', async () => {
            const userId = '12345';

            // Mock de MySQL
            mysqlMock.oneUser.mockResolvedValue({
                id: userId,
                username: 'testuser',
                email: 'test@example.com',
            });

            const response = await request(app)
                .get(`/users/${userId}`)
                .set('Authorization', 'Bearer valid.jwt.token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: userId,
                username: 'testuser',
                email: 'test@example.com',
            });
            expect(mysqlMock.oneUser).toHaveBeenCalledWith('users', userId);
        });

        it('should return 403 if the user ID does not match the logged-in user', async () => {
            const userId = 'differentUserId';

            const response = await request(app)
                .get(`/users/${userId}`)
                .set('Authorization', 'Bearer valid.jwt.token');

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: 'Forbidden' });
        });
    });

    describe('POST /users/verify-email', () => {
        it('should verify if an email exists', async () => {
            const email = 'test@example.com';

            // Mock de MySQL
            mysqlMock.checkEmailExists.mockResolvedValue(true);

            const response = await request(app)
                .post('/users/verify-email')
                .send({ email });

            expect(response.status).toBe(200);
            expect(response.body).toBe('Email exists. You will receive an email confirmation.');
            expect(mysqlMock.checkEmailExists).toHaveBeenCalledWith(email);
        });

        it('should return 404 if the email does not exist', async () => {
            const email = 'nonexistent@example.com';

            // Mock de MySQL
            mysqlMock.checkEmailExists.mockResolvedValue(false);

            const response = await request(app)
                .post('/users/verify-email')
                .send({ email });

            expect(response.status).toBe(404);
            expect(response.body).toBe('No account found with that email.');
            expect(mysqlMock.checkEmailExists).toHaveBeenCalledWith(email);
        });
    });

    describe('DELETE /users', () => {
        it('should delete a user', async () => {
            const userId = '12345';

            // Mock de MySQL
            mysqlMock.removeUser.mockResolvedValue({ affectedRows: 1 });

            const response = await request(app)
                .delete('/users')
                .send({ id: userId });

            expect(response.status).toBe(200);
            expect(response.body).toBe('User was removed');
            expect(mysqlMock.removeUser).toHaveBeenCalledWith('users', userId);
        });

        it('should handle user not found during deletion', async () => {
            const userId = 'nonexistentUserId';

            // Mock de MySQL
            mysqlMock.removeUser.mockResolvedValue({ affectedRows: 0 });

            const response = await request(app)
                .delete('/users')
                .send({ id: userId });

            expect(response.status).toBe(404);
            expect(response.body).toBe('User not found');
        });
    });

    describe('GET /users/:username', () => {
        it('should fetch a specific user by username', async () => {
            const username = 'testuser';

            // Mock de MySQL
            mysqlMock.oneUser.mockResolvedValue({
                id: '12345',
                username: username,
                email: 'test@example.com',
            });

            const response = await request(app)
                .get(`/users/${username}`)
                .set('Authorization', 'Bearer valid.jwt.token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: '12345',
                username: username,
                email: 'test@example.com',
            });
            expect(mysqlMock.oneUser).toHaveBeenCalledWith('users', username);
        });

        it('should return 403 if the username does not match the logged-in user', async () => {
            const username = 'otheruser';

            const response = await request(app)
                .get(`/users/${username}`)
                .set('Authorization', 'Bearer valid.jwt.token');

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: 'Forbidden' });
        });
    });


});
