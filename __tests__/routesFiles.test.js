const request = require('../backend/node_modules/supertest');
const app = require("../backend/src/app"); //Verificar

const bcrypt = require('../backend/node_modules/bcryptjs');
const jwt = require('../backend/node_modules/jsonwebtoken');

const mock_mysql = require('./mocks/mysqlMock');
const mock_mongodb = require('./mocks/mongodbMock');

// // jest.mock('../backend/src/DB/mysql', () => mock_mysql); 
// // jest.mock('../backend/src/DB/mongodb', () => mock_mongodb); 



describe("Files Routes", () => {
    jest.mock('../backend/src/DB/mongodb', () => mock_mongodb); 
    jest.mock('../backend/src/middleware/authenticateJWT', () => (req, res, next) => {
        req.user = { id: 'mockedUserId' }; // Simula un usuario autenticado
        next();
      });
    describe("POST /:projectId/add", () => {
        it("should upload and add a file successfully", async () => {
            mock_mongodb.Project.findById.mockResolvedValue({ id: "projectId " });
            mock_mongodb.File.create.mockResolvedValue({
                id: "fileId",
                surname: "Test File",
                projectId: "projectId",
            });

            const response = await request(app)
                .post("/files/projectId/add")
                .attach("image", "__tests__/mocks/testImage.png") // Subir imagen de prueba (no olvidar)
                .field("surname", "Test File")
                .field("userId", "userId");

            expect(response.status).toBe(201);
            expect(response.body.file.surname).toBe("Test File");
            expect(mock_mongodb.Project.findById).toHaveBeenCalled();
            expect(mock_mongodb.File.create).toHaveBeenCalled();
        });

        it("should return 404 if project is not found", async () => {
            mock_mongodb.Project.findById.mockResolvedValue(null);

            const response = await request(app)
                .post("/files/projectId/add")
                .attach("image", "__tests__/mocks/testImage.png")
                .field("surname", "Test File")
                .field("userId", "userId");

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Project not found");
        });

        it("should return 400 if no file is uploaded", async () => {
            const response = await request(app)
                .post("/files/projectId/add")
                .field("surname", "Test File")
                .field("userId", "userId");

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Please upload an image");
        });
    });

    describe("GET /:id", () => {
        it("should return the file details by ID", async () => {
            mock_mongodb.File.findById.mockResolvedValue({ id: "fileId", surname: "Test File" });

            const response = await request(app).get("/files/fileId");

            expect(response.status).toBe(200);
            expect(response.body.file.surname).toBe("Test File");
            expect(mock_mongodb.File.findById).toHaveBeenCalledWith("fileId");
        });

        it("should return 404 if file is not found", async () => {
            mock_mongodb.File.findById.mockResolvedValue(null);

            const response = await request(app).get("/files/fileId");

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("File not found");
        });
    });

    describe("PUT /:id/surname", () => {
        it("should update the file surname successfully", async () => {
            mock_mongodb.File.findByIdAndUpdate.mockResolvedValue({
                id: "fileId",
                surname: "Updated Surname",
            });

            const response = await request(app)
                .put("/files/fileId/surname")
                .send({ surname: "Updated Surname" });

            expect(response.status).toBe(200);
            expect(response.body.file.surname).toBe("Updated Surname");
        });

        it("should return 400 if surname is not provided", async () => {
            const response = await request(app).put("/files/fileId/surname").send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Surname is required");
        });
    });

    describe("PUT /:id/status", () => {
        it("should update the file status successfully", async () => {
            mock_mongodb.File.findByIdAndUpdate.mockResolvedValue({
                id: "fileId",
                status: "archived",
            });

            const response = await request(app)
                .put("/files/fileId/status")
                .send({ status: "archived" });

            expect(response.status).toBe(200);
            expect(response.body.file.status).toBe("archived");
        });

        it("should return 400 if status is invalid", async () => {
            const response = await request(app)
                .put("/files/fileId/status")
                .send({ status: "invalidStatus" });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Invalid or missing status");
        });
    });

    describe("PUT /:id/update", () => {
        it("should update the file with new data", async () => {
            mock_mongodb.File.findByIdAndUpdate.mockResolvedValue({
                id: "fileId",
                surname: "Updated Surname",
                doorNumber: 2,
                windowNumber: 3,
                textNumber: 4,
            });

            const response = await request(app)
                .put("/files/fileId/update")
                .attach("image", "__tests__/mocks/testImage.png")
                .field("surname", "Updated Surname");

            expect(response.status).toBe(200);
            expect(response.body.file.surname).toBe("Updated Surname");
        });

        it("should return 404 if file is not found", async () => {
            mock_mongodb.File.findByIdAndUpdate.mockResolvedValue(null);

            const response = await request(app)
                .put("/files/fileId/update")
                .attach("image", "__test__/mocks/testImage.png")
                .field("surname", "Updated Surname");

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("File not found");
        });
    });

    describe("DELETE /:id", () => {
        it("should delete the file successfully", async () => {
            mock_mongodb.File.findByIdAndDelete.mockResolvedValue({ id: "fileId" });

            const response = await request(app).delete("/files/fileId");

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("File deleted successfully");
        });

        it("should return 404 if file is not found", async () => {
            mock_mongodb.File.findByIdAndDelete.mockResolvedValue(null);

            const response = await request(app).delete("/files/fileId");

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("File not found");
        });
    });
});
