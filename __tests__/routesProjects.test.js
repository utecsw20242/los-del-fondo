// const request = require('supertest');
const app = require("../backend/src/app");  //Verificar
// const mysqlMock = require('../  mocks/mysqlMock');
// const mongodbMock = require('../mocks/mongodbMock');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysqlMock = require('./mocks/mysqlMock');

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

jest.mock('../backend/src/middleware/authenticateJWT', () => (req, res, next) => {
    req.user = { id: 'mockedUserId' }; // Simula un usuario autenticado
    next();
  });
  
  describe('Projects API Routes', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe('GET /:userId', () => {
      it('should retrieve projects for a user', async () => {
        const mockedProjects = [{ id: 'project1', name: 'Test Project' }];
        mongodbMock.Project.find.mockResolvedValue(mockedProjects);
  
        const response = await request(app).get('/projects/mockedUserId?depth=2&status=active');
        expect(response.status).toBe(200);
        expect(response.body.projects).toEqual(mockedProjects);
        expect(mongodbMock.Project.find).toHaveBeenCalledWith({
          userId: 'mockedUserId',
          status: 'active',
        });
      });
  
      it('should return 500 if an error occurs', async () => {
        mongodbMock.Project.find.mockRejectedValue(new Error('DB error'));
  
        const response = await request(app).get('/projects/mockedUserId');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error retrieving projects');
      });
    });
  
    describe('PUT /:id', () => {
      it('should update a project successfully', async () => {
        const updatedProject = { id: 'project1', name: 'Updated Project' };
        mongodbMock.Project.findByIdAndUpdate.mockResolvedValue(updatedProject);
  
        const response = await request(app)
          .put('/projects/project1')
          .send({ name: 'Updated Project' });
        expect(response.status).toBe(200);
        expect(response.body.project).toEqual(updatedProject);
      });
  
      it('should return 404 if the project is not found', async () => {
        mongodbMock.Project.findByIdAndUpdate.mockResolvedValue(null);
  
        const response = await request(app)
          .put('/projects/project1')
          .send({ name: 'Updated Project' });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Project not found');
      });
    });
  
    describe('POST /new-project', () => {
      it('should create a new project', async () => {
        mysqlMock.oneUser.mockResolvedValue(true); // Simula que el usuario existe
        const newProject = { id: 'newProject', name: 'Test Project' };
        mongodbMock.Project.mockImplementation(() => ({
          save: jest.fn().mockResolvedValue(newProject),
        }));
  
        const response = await request(app).post('/projects/new-project').send({
          userId: 'mockedUserId',
          name: 'Test Project',
        });
        expect(response.status).toBe(201);
        expect(response.body.project).toEqual(newProject);
      });
  
      it('should return 404 if the user does not exist', async () => {
        mysqlMock.oneUser.mockResolvedValue(null);
  
        const response = await request(app).post('/projects/new-project').send({
          userId: 'mockedUserId',
          name: 'Test Project',
        });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
      });
    });
  
    describe('DELETE /:id', () => {
      it('should delete a project successfully', async () => {
        const deletedProject = { id: 'project1', name: 'Test Project' };
        mongodbMock.Project.findByIdAndDelete.mockResolvedValue(deletedProject);
  
        const response = await request(app).delete('/projects/project1');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Project deleted successfully');
      });
  
      it('should return 404 if the project is not found', async () => {
        mongodbMock.Project.findByIdAndDelete.mockResolvedValue(null);
  
        const response = await request(app).delete('/projects/project1');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Project not found');
      });
    });
    
    describe('PUT /:parentProjectId/nest-mod', () => {
        it('should modify a nested project successfully', async () => {
            const parentProject = { id: 'parentProjectId', name: 'Parent Project' };
            const nestedProject = { id: 'nestedProjectId', name: 'Nested Project' };
            mongodbMock.Project.findById
                .mockResolvedValueOnce(parentProject) // Simula encontrar el proyecto padre
                .mockResolvedValueOnce(nestedProject); // Simula encontrar el proyecto anidado
            mongodbMock.Project.find.mockResolvedValue([parentProject, nestedProject]); // Simula devolver todos los proyectos
    
            const response = await request(app)
                .put('/projects/parentProjectId/nest-mod')
                .send({ nestedProjectId: 'nestedProjectId', name: 'Updated Nested Project' });
    
            expect(response.status).toBe(200);
            expect(response.body.nestedProject.name).toBe('Updated Nested Project');
            expect(mongodbMock.Project.findById).toHaveBeenCalledTimes(2);
        });
    
        it('should return 404 if the parent project is not found', async () => {
            mongodbMock.Project.findById.mockResolvedValueOnce(null); // No encuentra el proyecto padre
    
            const response = await request(app)
                .put('/projects/parentProjectId/nest-mod')
                .send({ nestedProjectId: 'nestedProjectId', name: 'Updated Nested Project' });
    
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Parent project not found');
        });
    });
    
    describe('DELETE /:parentProjectId/nest-del', () => {
        it('should delete a nested project successfully', async () => {
            const parentProject = {
                id: 'parentProjectId',
                nestedProjects: ['nestedProjectId'],
            };
            const nestedProject = { id: 'nestedProjectId', name: 'Nested Project' };
            mongodbMock.Project.findById
                .mockResolvedValueOnce(parentProject) // Encuentra el proyecto padre
                .mockResolvedValueOnce(nestedProject); // Encuentra el proyecto anidado
    
            const response = await request(app)
                .delete('/projects/parentProjectId/nest-del')
                .send({ nestedProjectId: 'nestedProjectId' });
    
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Nested project removed successfully');
            expect(mongodbMock.Project.findById).toHaveBeenCalledTimes(2);
        });
    
        it('should return 400 if the nested project is not part of the parent project', async () => {
            const parentProject = { id: 'parentProjectId', nestedProjects: [] };
            mongodbMock.Project.findById.mockResolvedValueOnce(parentProject); // Encuentra el proyecto padre
    
            const response = await request(app)
                .delete('/projects/parentProjectId/nest-del')
                .send({ nestedProjectId: 'nestedProjectId' });
    
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Nested project not found in the parent project');
        });
    });
    
    describe('PUT /:id/update-surname', () => {
        it('should update the project surname successfully', async () => {
            const updatedProject = { id: 'projectId', surname: 'Updated Surname' };
            mongodbMock.Project.findByIdAndUpdate.mockResolvedValue(updatedProject);
    
            const response = await request(app)
                .put('/projects/projectId/update-surname')
                .send({ surname: 'Updated Surname' });
    
            expect(response.status).toBe(200);
            expect(response.body.projects[0].surname).toBe('Updated Surname');
        });
    
        it('should return 400 if surname is not provided', async () => {
            const response = await request(app)
                .put('/projects/projectId/update-surname')
                .send({});
    
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Surname is required');
        });
    });
    
    describe('PUT /:id/update-status', () => {
        it('should update the project status successfully', async () => {
            const updatedProject = { id: 'projectId', status: 'completed' };
            mongodbMock.Project.findByIdAndUpdate.mockResolvedValue(updatedProject);
    
            const response = await request(app)
                .put('/projects/projectId/update-status')
                .send({ status: 'completed' });
    
            expect(response.status).toBe(200);
            expect(response.body.projects[0].status).toBe('completed');
        });
    
        it('should return 400 if status is not provided', async () => {
            const response = await request(app)
                .put('/projects/projectId/update-status')
                .send({});
    
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Status is required');
        });
    });
    
  });