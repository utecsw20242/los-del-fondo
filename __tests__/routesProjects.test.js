const mock_mysql = require('./mocks/mysqlMock');
const mock_mongodb = require('./mocks/mongodbMock');

jest.setTimeout(10000); 

jest.mock('../backend/src/DB/mysql', () => mock_mysql); 
jest.mock('../backend/src/DB/mongodb', () => mock_mongodb); 
jest.setTimeout(10000); 


const request = require('../backend/node_modules/supertest');
const app = require("../backend/src/app"); //Verificar

const bcrypt = require('../backend/node_modules/bcryptjs');
const jwt = require('../backend/node_modules/jsonwebtoken');

const mongoose = require('../backend/node_modules/mongoose');

  
  describe('Projects API Routes', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    jest.mock('../backend/src/DB/mysql', () => mock_mysql); 
    jest.mock('../backend/src/DB/mongodb', () => mock_mongodb); 

    describe('GET /:userId', () => {
      it('should retrieve projects for a user', async () => {
        const mockedProjects = [{ id: 'project1', name: 'Test Project' }];
        mock_mongodb.Project.find.mockResolvedValue(mockedProjects);
  
        const response = await request(app).get('/api/projects/mockedUserId?depth=2&status=active');
        expect(response.status).toBe(200);
        expect(response.body.projects).toEqual(mockedProjects);
        expect(mock_mongodb.Project.find).toHaveBeenCalledWith({
          userId: 'mockedUserId',
          status: 'active',
        });
      });
  
      it('should return 500 if an error occurs', async () => {
        mock_mongodb.Project.find.mockRejectedValue(new Error('DB error'));
  
        const response = await request(app).get('api/projects/mockedUserId');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error retrieving projects');
      });
    });
  
    describe('PUT /:id', () => {
      it('should update a project successfully', async () => {
        const updatedProject = { id: 'project1', name: 'Updated Project' };
        mock_mongodb.Project.findByIdAndUpdate.mockResolvedValue(updatedProject);
  
        const response = await request(app)
          .put('/api/projects/project1')
          .send({ name: 'Updated Project' });
        expect(response.status).toBe(200);
        expect(response.body.project).toEqual(updatedProject);
      });
  
      it('should return 404 if the project is not found', async () => {
        mock_mongodb.Project.findByIdAndUpdate.mockResolvedValue(null);
  
        const response = await request(app)
          .put('/api/projects/project1')
          .send({ name: 'Updated Project' });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Project not found');
      });
    });
  
    describe('POST /new-project', () => {
      it('should create a new project', async () => {
        mock_mysql.oneUser.mockResolvedValue(true); // Simula que el usuario existe
        const newProject = { id: 'newProject', name: 'Test Project' };
       
  
        const response = await request(app).post('/api/projects/new-project').send({
          userId: 'mockedUserId',
          name: 'Test Project',
        });
        expect(response.status).toBe(201);
        expect(response.body.project).toEqual(newProject);
      });
  
      it('should return 404 if the user does not exist', async () => {
        mock_mysql.oneUser.mockResolvedValue(null);
  
        const response = await request(app).post('/api/projects/new-project').send({
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
        mock_mongodb.Project.findByIdAndDelete.mockResolvedValue(deletedProject);
  
        const response = await request(app).delete('/api/projects/project1');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Project deleted successfully');
      });
  
      it('should return 404 if the project is not found', async () => {
        mock_mongodb.Project.findByIdAndDelete.mockResolvedValue(null);
  
        const response = await request(app).delete('/api/projects/project1');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Project not found');
      });
    });
    
    describe('PUT /:parentProjectId/nest-mod', () => {
        it('should modify a nested project successfully', async () => {
            const parentProject = { id: 'parentProjectId', name: 'Parent Project' };
            const nestedProject = { id: 'nestedProjectId', name: 'Nested Project' };
            mock_mongodb.Project.findById
                .mockResolvedValueOnce(parentProject) // Simula encontrar el proyecto padre
                .mockResolvedValueOnce(nestedProject); // Simula encontrar el proyecto anidado
            mock_mongodb.Project.find.mockResolvedValue([parentProject, nestedProject]); // Simula devolver todos los proyectos
    
            const response = await request(app)
                .put('/api/projects/parentProjectId/nest-mod')
                .send({ nestedProjectId: 'nestedProjectId', name: 'Updated Nested Project' });
    
            expect(response.status).toBe(200);
            expect(response.body.nestedProject.name).toBe('Updated Nested Project');
            expect(mock_mongodb.Project.findById).toHaveBeenCalledTimes(2);
        });
    
        it('should return 404 if the parent project is not found', async () => {
            mock_mongodb.Project.findById.mockResolvedValueOnce(null); // No encuentra el proyecto padre
    
            const response = await request(app)
                .put('/api/projects/parentProjectId/nest-mod')
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
            mock_mongodb.Project.findById
                .mockResolvedValueOnce(parentProject) 
                .mockResolvedValueOnce(nestedProject); 
    
            const response = await request(app)
                .delete('/api/projects/parentProjectId/nest-del')
                .send({ nestedProjectId: 'nestedProjectId' });
    
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Nested project removed successfully');
            expect(mock_mongodb.Project.findById).toHaveBeenCalledTimes(2);
        });
    
        it('should return 400 if the nested project is not part of the parent project', async () => {
            const parentProject = { id: 'parentProjectId', nestedProjects: [] };
            mock_mongodb.Project.findById.mockResolvedValueOnce(parentProject); 
    
            const response = await request(app)
                .delete('/api/projects/parentProjectId/nest-del')
                .send({ nestedProjectId: 'nestedProjectId' });
    
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Nested project not found in the parent project');
        });
    });
    
    describe('PUT /:id/update-surname', () => {
        it('should update the project surname successfully', async () => {
            const updatedProject = { id: 'projectId', surname: 'Updated Surname' };
            mock_mongodb.Project.findByIdAndUpdate.mockResolvedValue(updatedProject);
    
            const response = await request(app)
                .put('/api/projects/projectId/update-surname')
                .send({ surname: 'Updated Surname' });
    
            expect(response.status).toBe(200);
            expect(response.body.projects[0].surname).toBe('Updated Surname');
        });
    
        it('should return 400 if surname is not provided', async () => {
            const response = await request(app)
                .put('/api/projects/projectId/update-surname')
                .send({});
    
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Surname is required');
        });
    });
    
    describe('PUT /:id/update-status', () => {
        it('should update the project status successfully', async () => {
            const updatedProject = { id: 'projectId', status: 'completed' };
            mock_mongodb.Project.findByIdAndUpdate.mockResolvedValue(updatedProject);
    
            const response = await request(app)
                .put('/api/projects/projectId/update-status')
                .send({ status: 'completed' });
    
            expect(response.status).toBe(200);
            expect(response.body.projects[0].status).toBe('completed');
        });
    
        it('should return 400 if status is not provided', async () => {
            const response = await request(app)
                .put('/api/projects/projectId/update-status')
                .send({});
    
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Status is required');
        });
    });
    
  });
