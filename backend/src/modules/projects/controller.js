const { Project } = require('../../DB/mongodb');
const db = require('../../DB/mysql');

const MAX_DEPTH = 20;
const buildPopulateQuery = (depth) => {
  const finalDepth = Math.min(depth, MAX_DEPTH);
  let populateQuery = {path: 'nestedProjects'};
  if (finalDepth > 1) {
    populateQuery.populate = buildPopulateQuery(finalDepth - 1);
  }
  return populateQuery;
};

exports.getProject = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, depth} = req.query;

    const requestedDepth = parseInt(depth, 10) || 1;
    const populateQuery = buildPopulateQuery(requestedDepth);
    const query = { userId };
    if (status) query.status = status;
    const projects = await Project.find(query).populate(populateQuery).populate('files');
    res.status(200).json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving projects', err });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedProject = await Project.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
    const projects = await Project.find({ userId: updatedProject.userId }).populate('nestedProjects').populate('files');
    res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
  } catch (err) {
    res.status(500).json({ message: 'Error updating project', err });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) return res.status(404).json({ message: 'Project not found' });
    const projects = await Project.find({ userId: deletedProject.userId }).populate('nestedProjects').populate('files');
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project', err });
  }
};

exports.modifyNestedProject = async (req, res) => {
  try {
    const { parentProjectId } = req.params;
    const { name, surname, status } = req.body; 
    const { nestedProjectId } = req.body;

    const parentProject = await Project.findById(parentProjectId);
    if (!parentProject) {
      return res.status(404).json({ message: 'Parent project not found' });
    }

    const nestedProject = await Project.findById(nestedProjectId);
    if (!nestedProject) {
      return res.status(404).json({ message: 'Nested project not found' });
    }

    nestedProject.name = name || nestedProject.name;
    nestedProject.surname = surname || nestedProject.surname;
    nestedProject.status = status || nestedProject.status;
    await nestedProject.save();

    const projects = await Project.find({ userId: parentProject.userId }).populate('nestedProjects').populate('files'); 
    res.status(200).json({
      message: 'Nested project modified successfully',
      parentProject,
      nestedProject,
      projects,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error modifying nested project', err });
  }
};

exports.removeNestedProject = async (req, res) => {
  try {
    const { parentProjectId } = req.params;
    const { nestedProjectId } = req.body;

    const parentProject = await Project.findById(parentProjectId);
    if (!parentProject) {
      return res.status(404).json({ message: 'Parent project not found' });
    }

    if (!parentProject.nestedProjects.includes(nestedProjectId)) {
      return res.status(400).json({ message: 'Nested project not found in the parent project' });
    }

    const nestedProject = await Project.findById(nestedProjectId);
    if (!nestedProject) {
      return res.status(404).json({ message: 'Nested project not found' });
    }

    parentProject.nestedProjects = parentProject.nestedProjects.filter(
      nestedId => nestedId.toString() !== nestedProjectId
    );
    await parentProject.save();
    await Project.findByIdAndRemove(nestedProjectId);

    const projects = await Project.find({ userId: parentProject.userId }).populate('nestedProjects').populate('files');
    res.status(200).json({ message: 'Nested project removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing nested project', err });
  }
};

exports.updateProjectSurname = async (req, res) => {
  try {
    const { id } = req.params;
    const { surname } = req.body;
    if (!surname) {return res.status(400).json({ message: 'Surname is required' });}
    const updatedProject = await Project.findByIdAndUpdate(
      id,{ surname },{ new: true });
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projects = await Project.find({ userId: updatedProject.userId }).populate('nestedProjects').populate('files');
    res.status(200).json({
      message: 'Project surname updated successfully',
      projects,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating project surname', err });
  }
};

exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { status, latestStatusUpdate: Date.now() }, // Update status and the latest status update time
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const projects = await Project.find({ userId: updatedProject.userId }).populate('nestedProjects').populate('files');
    res.status(200).json({
      message: 'Project status updated successfully',
      projects,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating project status', err });
  }
};

exports.createOrNestProject = async (req, res) => {
  try {
    const { userId, name, surname, status, parentProjectId } = req.body;
    const userExists = await db.oneUser('users', userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (parentProjectId) {
      const parentProject = await Project.findById(parentProjectId);
      if (!parentProject) {
        return res.status(404).json({ message: 'Parent project not found' });
      }

      const newNestedProject = new Project({
        userId,
        name,
        surname,
        status,
        parentProjectId,
      });
      await newNestedProject.save();

      parentProject.nestedProjects.push(newNestedProject._id);
      await parentProject.save();

      const projects = await Project.find({ userId }).populate('nestedProjects').populate('files');
      return res.status(201).json({
        message: 'New nested project created and added successfully',
        parentProject,
        nestedProject: newNestedProject,
        projects,
      });
    }
    const newProject = new Project({ userId, name, surname, status });
    await newProject.save();
    const projects = await Project.find({ userId }).populate('nestedProjects').populate('files');
    res.status(201).json({ message: 'Project created successfully', project: newProject, projects });
  } catch (err) {
    res.status(500).json({ message: 'Error creating project', err });
  }
};