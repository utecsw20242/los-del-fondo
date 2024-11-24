const request = require('../backend/node_modules/supertest');
const app = require("../backend/src/app"); //Verificar

const bcrypt = require('../backend/node_modules/bcryptjs');
const jwt = require('../backend/node_modules/jsonwebtoken');

const mock_mysql = require('./mocks/mysqlMock');
const mock_mongodb = require('./mocks/mongodbMock');

// jest.mock('../backend/src/DB/mysql', () => mock_mysql); 
// jest.mock('../backend/src/DB/mongodb', () => mock_mongodb); 


describe('Users API', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpia los mocks después de cada prueba
    });
    jest.mock('../backend/src/DB/mysql', () => mock_mysql); 

    describe('POST /users', () => {
        it('should create a new user in MySQL and MongoDB', async () => {
            const newUser = {
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
            };

            const hashedPassword = await bcrypt.hash(newUser.password, 10);

            // Mock de MySQL
            mock_mysql.addUser.mockResolvedValue({
                user: {
                    id: '12345',
                    username: 'testuser',
                    email: 'test@example.com',
                    password: hashedPassword,
                },
            });

            // Mock de MongoDB
            mock_mongodb.__mocks__.mockSave.mockResolvedValue(); // Simula que `save` fue exitoso

            const response = await request(app).post('/users').send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('username', 'testuser');

            // Verifica que los mocks fueron llamados
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
            mock_mysql.allUsers.mockResolvedValue([{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }]);

            const response = await request(app).get('/users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.any(Array));
            expect(response.body.length).toBe(2);
            expect(mock_mysql.allUsers).toHaveBeenCalledWith('users');
        });
    });

    describe('GET /users/:id', () => {
        it('should fetch a specific user by ID', async () => {
            const userId = '12345';

            // Mock de MySQL
            mock_mysql.oneUser.mockResolvedValue({
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
            expect(mock_mysql.oneUser).toHaveBeenCalledWith('users', userId);
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
            mock_mysql.checkEmailExists.mockResolvedValue(true);

            const response = await request(app)
                .post('/users/verify-email')
                .send({ email });

            expect(response.status).toBe(200);
            expect(response.body).toBe('Email exists. You will receive an email confirmation.');
            expect(mock_mysql.checkEmailExists).toHaveBeenCalledWith(email);
        });

        it('should return 404 if the email does not exist', async () => {
            const email = 'nonexistent@example.com';

            // Mock de MySQL
            mock_mysql.checkEmailExists.mockResolvedValue(false);

            const response = await request(app)
                .post('/users/verify-email')
                .send({ email });

            expect(response.status).toBe(404);
            expect(response.body).toBe('No account found with that email.');
            expect(mock_mysql.checkEmailExists).toHaveBeenCalledWith(email);
        });
    });

    describe('DELETE /users', () => {
        it('should delete a user', async () => {
            const userId = '12345';

            // Mock de MySQL
            mock_mysql.removeUser.mockResolvedValue({ affectedRows: 1 });

            const response = await request(app)
                .delete('/users')
                .send({ id: userId });

            expect(response.status).toBe(200);
            expect(response.body).toBe('User was removed');
            expect(mock_mysql.removeUser).toHaveBeenCalledWith('users', userId);
        });

        it('should handle user not found during deletion', async () => {
            const userId = 'nonexistentUserId';

            // Mock de MySQL
            mock_mysql.removeUser.mockResolvedValue({ affectedRows: 0 });

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
            mock_mysql.oneUser.mockResolvedValue({
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
            expect(mock_mysql.oneUser).toHaveBeenCalledWith('users', username);
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
