const connectToMongoDB = jest.fn(async () => {
  console.log("Mock MongoDB connected");
});

module.exports = {
  connectToMongoDB,
    Project: {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    },
    File: {
      find: jest.fn(),
      save: jest.fn()
    },
  };
  
