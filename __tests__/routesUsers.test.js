const mock_mysql = require('./mocks/mysqlMock');
const mock_mongodb = require('./mocks/mongodbMock');

jest.setTimeout(10000); 
jest.mock('../backend/src/DB/mysql', () => mock_mysql); 
jest.mock('../backend/src/DB/mongodb', () => mock_mongodb); 
jest.setTimeout(10000); 

const request = require('../backend/node_modules/supertest');
const app = require("../backend/src/app"); //Verificar

const bcrypt = require('../backend/node_modules/bcryptjs');
const mongoose = require('../backend/node_modules/mongoose');


describe('Users API', () => {

    afterEach(() => {
        jest.clearAllMocks(); // Limpia los mocks después de cada prueba
    });

    jest.mock('../backend/src/DB/mysql', () => mock_mysql); 
    jest.mock('../backend/src/DB/mysql', () => mock_mongodb); 
    jest.mock('../backend/src/middleware/authenticateJWT', () => (req, res, next) => {
        req.user = { id: 'mockedUserId' }; // Simula un usuario autenticado
        next();
      });

    describe('GET /api/users', () => {
        it('should fetch all users from MySQL', async () => {
            // Actualización: Ahora la data mockeada incluye más campos
            mock_mysql.allUsers.mockResolvedValue([
                { id: '1', first_name: 'John', last_name: 'Doe', username: 'user1', email: 'user1@example.com', age: 30, phone_number: '1234567890' },
                { id: '2', first_name: 'Jane', last_name: 'Smith', username: 'user2', email: 'user2@example.com', age: 28, phone_number: '9876543210' }
            ]);
            const response = await request(app).get('/api/users');
            expect(response.status).toBe(200);
            expect(response.body.body).toEqual(expect.any(Array));
            expect(response.body.body.length).toBe(2);
            expect(response.body.body[0]).toHaveProperty('id');
            expect(response.body.body[0]).toHaveProperty('first_name');
            expect(response.body.body[0]).toHaveProperty('last_name');
            expect(response.body.body[0]).toHaveProperty('username');
            expect(response.body.body[0]).toHaveProperty('email');
            expect(mock_mysql.allUsers).toHaveBeenCalledWith('users');
        });
    });

    describe('POST /users', () => {
        it('should create a new user in MySQL and MongoDB', async () => {
            const newUser = {
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                age: 25,
                phone_number: '5555555555',
                auth_provider: 'local',
            };

            const hashedPassword = await bcrypt.hash(newUser.password, 10);

            // Mock de MySQL
            mock_mysql.addUser.mockResolvedValue({
                user: {
                    id: '12345',
                    ...newUser,
                    password: hashedPassword,
                },
            });

            // Mock de MongoDB
            mock_mongodb.Project.save.mockResolvedValue({
                userId: '12345',
                name: 'Main Project',
                surname: "surname",
                status: 'default',
            });

            const response = await request(app).post('/api/users').send(newUser);

            expect(response.status).toBe(201);
            expect(response.body.body).toHaveProperty('token');
            expect(response.body.body.user).toHaveProperty('username', 'testuser');
            expect(mock_mysql.addUser).toHaveBeenCalledWith('users', expect.any(Object));
            expect(mock_mongodb.Project).toHaveBeenCalledWith(expect.objectContaining({
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
            mock_mysql.findUserByEmail.mockResolvedValue({
                id: '12345',
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPassword,
                first_name: 'Test',
                last_name: 'User',
                age: 25,
                phone_number: '5555555555',
            });

            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true); // Simula la verificación de contraseña

            const response = await request(app).post('/api/users/login').send(userLogin);

            expect(response.status).toBe(200);
            expect(response.body.body).toHaveProperty('token');
            expect(response.body.body.user).toHaveProperty('username', 'testuser');
        });
    });

    describe('GET /users/:id', () => {
        it('should fetch a specific user by ID', async () => {
            const userId = '12345';

            // Mock de MySQL
            mock_mysql.oneUser.mockResolvedValue({
                id: userId,
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser',
                email: 'test@example.com',
                age: 25,
                phone_number: '5555555555',
            });

            const response = await request(app)
                .get(`/api/users/${userId}`)
                .set('Authorization', 'Bearer valid.jwt.token');

            expect(response.status).toBe(200);
            expect(response.body.body).toEqual({
                id: userId,
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser',
                email: 'test@example.com',
                age: 25,
                phone_number: '5555555555',
            });
            expect(mock_mysql.oneUser).toHaveBeenCalledWith('users', userId);
        });

        it('should return 403 if the user ID does not match the logged-in user', async () => {
            const userId = 'differentUserId';

            const response = await request(app)
                .get(`/api/users/${userId}`)
                .set('Authorization', 'Bearer valid.jwt.token');

            expect(response.status).toBe(403);
            expect(response.body.body).toEqual({ message: 'Forbidden' });
        });
    });

    describe('POST /users/verify-email', () => {
        it('should verify if an email exists', async () => {
            const email = 'test@example.com';

            // Mock de MySQL
            mock_mysql.checkEmailExists.mockResolvedValue(true);

            const response = await request(app)
                .post('/api/users/verify-email')
                .send({ email });

            expect(response.status).toBe(200);
            expect(response.body.body).toBe('Email exists. You will receive an email confirmation.');
            expect(mock_mysql.checkEmailExists).toHaveBeenCalledWith(email);
        });

        it('should return 404 if the email does not exist', async () => {
            const email = 'nonexistent@example.com';

            // Mock de MySQL
            mock_mysql.checkEmailExists.mockResolvedValue(false);

            const response = await request(app)
                .post('/api/users/verify-email')
                .send({ email });

            expect(response.status).toBe(404);
            expect(response.body.body).toBe('No account found with that email.');
            expect(mock_mysql.checkEmailExists).toHaveBeenCalledWith(email);
        });
    });

    describe('DELETE /users', () => {
        it('should delete a user', async () => {
            const userId = '12345';

            // Mock de MySQL
            mock_mysql.removeUser.mockResolvedValue({ affectedRows: 1 });

            const response = await request(app)
                .delete('/api/users')
                .send({ id: userId });

            expect(response.status).toBe(200);
            expect(response.body.body).toBe('User was removed');
            expect(mock_mysql.removeUser).toHaveBeenCalledWith('users', userId);
        });
    });

    describe('GET /users/:username', () => {
        it('should fetch a specific user by username', async () => {
            const username = 'testuser';

            // Mock de MySQL
            mock_mysql.oneUser.mockResolvedValue({
                id: '12345',
                username: username,
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                age: 25,
                phone_number: '5555555555',
            });

            const response = await request(app)
                .get(`/api/users/${username}`)
                .set('Authorization', 'Bearer valid.jwt.token');

            expect(response.status).toBe(200);
            expect(response.body.body).toEqual({
                id: '12345',
                username: username,
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                age: 25,
                phone_number: '5555555555',
            });
            expect(mock_mysql.oneUser).toHaveBeenCalledWith('users', username);
        });

        it('should return 403 if the username does not match the logged-in user', async () => {
            const username = 'otheruser';

            const response = await request(app)
                .get(`/api/users/${username}`)
                .set('Authorization', 'Bearer valid.jwt.token');

            expect(response.status).toBe(403);
        });
    });
});

