const mongoose = require('mongoose');
require('dotenv').config();

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/los_del_fondo');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
    
};

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  surname: { type: String },
  status: { type: String, enum: ["deleted", "bookmarked", "archived", "default"], default: "default" },
  latestStatusUpdate: { type: Date, default: Date.now },
  nestedProjects: [{ type: mongoose.Types.ObjectId, ref: 'Project' }],
  files: [{ type: mongoose.Types.ObjectId, ref: 'File' }] 
});

const FileSchema = new Schema({
  userId: { type: String, required: true },
  projectId: { type: mongoose.Types.ObjectId, ref: 'Project' }, 
  name: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  surname: { type: String },
  status: { type: String, enum: ["deleted", "bookmarked", "archived", "default"], default: "default" },
  doorNumber: { type: Number },
  windowNumber: { type: Number },
  textNumber: { type: Number },
  image: { type: String },
  aiContent: { type: String },
  latestStatusUpdate: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', ProjectSchema);
const File = mongoose.model('File', FileSchema);

module.exports = { connectToMongoDB, Project, File};