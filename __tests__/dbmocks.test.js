const mysqlMock = require('./mocks/mysqlMock');
const mongodbMock = require('./mocks/mongodbMock');

describe('MySQL Mock Tests', () => {
  it('should mock all MySQL methods', () => {
    expect(mysqlMock.query).toBeDefined();
    expect(mysqlMock.allUsers).toBeDefined();
    expect(mysqlMock.oneUser).toBeDefined();
    expect(mysqlMock.removeUser).toBeDefined();
    expect(mysqlMock.insertUser).toBeDefined();
    expect(mysqlMock.updateUser).toBeDefined();
    expect(mysqlMock.addUser).toBeDefined();
    expect(mysqlMock.loginUser).toBeDefined();
    expect(mysqlMock.checkEmailExists).toBeDefined();
    expect(mysqlMock.findUserByEmail).toBeDefined();

    // Simula un comportamiento para validar el mock
    mysqlMock.query.mockReturnValue('mock query response');
    expect(mysqlMock.query()).toBe('mock query response');
  });
});

describe('MongoDB Mock Tests', () => {
  it('should mock all MongoDB methods for Project', () => {
    expect(mongodbMock.Project.find).toBeDefined();
    expect(mongodbMock.Project.findOne).toBeDefined();
    expect(mongodbMock.Project.save).toBeDefined();

    // Simula un comportamiento para validar el mock
    mongodbMock.Project.find.mockReturnValue([{ name: 'Test Project' }]);
    expect(mongodbMock.Project.find()).toEqual([{ name: 'Test Project' }]);
  });

  it('should mock all MongoDB methods for File', () => {
    expect(mongodbMock.File.find).toBeDefined();
    expect(mongodbMock.File.save).toBeDefined();

    // Simula un comportamiento para validar el mock
    mongodbMock.File.find.mockReturnValue([{ name: 'Test File' }]);
    expect(mongodbMock.File.find()).toEqual([{ name: 'Test File' }]);
  });
});
