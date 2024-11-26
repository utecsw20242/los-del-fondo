const { Project } = require("../../DB/mongodb");
const db = require("../../DB/mysql");
const logger = require("../../utils/logger");

const MAX_DEPTH = 20;
const buildPopulateQuery = (depth) => {
  const finalDepth = Math.min(depth, MAX_DEPTH);
  let populateQuery = { path: "nestedProjects" };
  if (finalDepth > 1) {
    populateQuery.populate = buildPopulateQuery(finalDepth - 1);
  }
  return populateQuery;
};

exports.getProject = async (req, res) => {
  try {
    logger.info({ function: "projects/getProject", step: "Start" });

    const { userId } = req.params;
    const { status, depth } = req.query;

    logger.info({ id: userId });

    const requestedDepth = parseInt(depth, 10) || 1;
    const populateQuery = buildPopulateQuery(requestedDepth);
    const query = { userId };
    if (status) query.status = status;
    const projects = await Project.find(query)
      .populate(populateQuery)
      .populate("files");

    logger.info({ function: "projects/getProject", step: "End" });

    res.status(200).json({ projects });
  } catch (err) {
    const message = "Error retrieving projects";
    logger.error({
      message: message,
      error: err,
    });
    res.status(500).json({ message: message, err });
  }
};

exports.updateProject = async (req, res) => {
  try {
    logger.info({ function: "projects/updateProject", step: "Start" });
    const { id } = req.params;
    logger.info({ id: id });

    const updatedData = req.body;
    const updatedProject = await Project.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!updatedProject) {
      const message = "Project not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }
    const projects = await Project.find({ userId: updatedProject.userId })
      .populate("nestedProjects")
      .populate("files");

    logger.info({ function: "projects/updateProject", step: "End" });

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (err) {
    const message = "Error updating project";
    logger.error({
      message: message,
      error: err,
    });
    res.status(500).json({ message: message, err });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    logger.info({ function: "projects/deleteProject", step: "Start" });
    const { id } = req.params;
    logger.info({ id: id });

    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      const message = "Project not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: "Project not found" });
    }
    const projects = await Project.find({ userId: deletedProject.userId })
      .populate("nestedProjects")
      .populate("files");

    logger.info({ function: "projects/deleteProject", step: "End" });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    const message = "Error deleting project";
    logger.error({
      message: message,
      error: err,
    });
    res.status(500).json({ message: message, err });
  }
};

exports.modifyNestedProject = async (req, res) => {
  try {
    logger.info({ function: "projects/modifyNestedProject", step: "Start" });
    const { parentProjectId } = req.params;
    const { name, surname, status } = req.body;
    const { nestedProjectId } = req.body;
    logger.info({
      parentProjectId: parentProjectId,
      name: name,
      surname: surname,
      status: status,
    });

    const parentProject = await Project.findById(parentProjectId);
    if (!parentProject) {
      const message = "Parent project not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }

    const nestedProject = await Project.findById(nestedProjectId);
    if (!nestedProject) {
      const message = "Nested project not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }

    nestedProject.name = name || nestedProject.name;
    nestedProject.surname = surname || nestedProject.surname;
    nestedProject.status = status || nestedProject.status;
    await nestedProject.save();

    const projects = await Project.find({ userId: parentProject.userId })
      .populate("nestedProjects")
      .populate("files");

    logger.info({ function: "projects/modifyNestedProject", step: "End" });

    res.status(200).json({
      message: "Nested project modified successfully",
      parentProject,
      nestedProject,
      projects,
    });
  } catch (err) {
    const message = "Error modifying nested project";
    logger.error({
      message: message,
      error: err,
    });
    res.status(500).json({ message: message, err });
  }
};

exports.removeNestedProject = async (req, res) => {
  try {
    logger.info({ function: "projects/removeNestedProject", step: "Start" });
    const { parentProjectId } = req.params;
    const { nestedProjectId } = req.body;
    logger.info({
      parentProjectId: parentProjectId,
      nestedProjectId: nestedProjectId,
    });

    const parentProject = await Project.findById(parentProjectId);
    if (!parentProject) {
      const message = "Parent project not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }

    if (!parentProject.nestedProjects.includes(nestedProjectId)) {
      const message = "Nested project not found in the parent project";
      logger.error({
        message: message,
      });
      return res.status(400).json({ message: message });
    }

    const nestedProject = await Project.findById(nestedProjectId);
    if (!nestedProject) {
      const message = "Nested project not found";
      logger.error({
        message: message,
      });

      return res.status(404).json({ message: message });
    }

    parentProject.nestedProjects = parentProject.nestedProjects.filter(
      (nestedId) => nestedId.toString() !== nestedProjectId,
    );
    await parentProject.save();
    await Project.findByIdAndRemove(nestedProjectId);

    const projects = await Project.find({ userId: parentProject.userId })
      .populate("nestedProjects")
      .populate("files");
    logger.info({ function: "projects/removeNestedProject", step: "End" });

    res.status(200).json({ message: "Nested project removed successfully" });
  } catch (err) {
    const message = "Error removing nested project";
    logger.error({
      message: message,
      error: err,
    });

    console.error(err);
    res.status(500).json({ message: message, err });
  }
};

exports.updateProjectSurname = async (req, res) => {
  try {
    logger.info({ function: "projects/updateNestedProject", step: "Start" });
    const { id } = req.params;
    const { surname } = req.body;

    logger.info({ id: id, surname: surname });

    if (!surname) {
      const message = "Surname is required";
      logger.error({
        message: message,
      });
      return res.status(400).json({ message: message });
    }
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { surname },
      { new: true },
    );
    if (!updatedProject) {
      const message = "Project not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }

    const projects = await Project.find({ userId: updatedProject.userId })
      .populate("nestedProjects")
      .populate("files");

    logger.info({ function: "projects/updateNestedProject", step: "End" });

    res.status(200).json({
      message: "Project surname updated successfully",
      projects,
    });
  } catch (err) {
    const message = "Error updating project surname";
    logger.error({
      message: message,
      error: err,
    });
    res.status(500).json({ message: message, err });
  }
};

exports.updateProjectStatus = async (req, res) => {
  try {
    logger.info({ function: "projects/updateProjectStatus", step: "Start" });
    const { id } = req.params;
    const { status } = req.body;

    logger.info({ id: id, status: status });

    if (!status) {
      const message = "Status is required";
      logger.error({
        message: message,
      });
      return res.status(400).json({ message: message });
    }
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { status, latestStatusUpdate: Date.now() }, // Update status and the latest status update time
      { new: true },
    );
    if (!updatedProject) {
      const message = "Project not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }
    const projects = await Project.find({ userId: updatedProject.userId })
      .populate("nestedProjects")
      .populate("files");

    logger.info({ function: "projects/updateProjectStatus", step: "End" });

    res.status(200).json({
      message: "Project status updated successfully",
      projects,
    });
  } catch (err) {
    const message = "Error updating project status";
    logger.error({
      message: message,
      error: err,
    });
    res.status(500).json({ message: message, err });
  }
};

exports.createOrNestProject = async (req, res) => {
  try {
    logger.info({ function: "projectscreateOrNestProject", step: "Start" });
    const { userId, name, surname, status, parentProjectId } = req.body;

    logger.info({
      userId: userId,
      name: name,
      surname: surname,
      status: status,
      parentProjectId: parentProjectId,
    });

    const userExists = await db.oneUser("users", userId);
    if (!userExists) {
      const message = "User not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }

    if (parentProjectId) {
      const parentProject = await Project.findById(parentProjectId);
      if (!parentProject) {
        const message = "Parent project not found";
        logger.error({
          message: message,
        });
        return res.status(404).json({ message: message });
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

      const projects = await Project.find({ userId })
        .populate("nestedProjects")
        .populate("files");

      logger.info({ function: "projectscreateOrNestProject", step: "End" });

      return res.status(201).json({
        message: "New nested project created and added successfully",
        parentProject,
        nestedProject: newNestedProject,
        projects,
      });
    }
    const newProject = new Project({ userId, name, surname, status });
    await newProject.save();
    const projects = await Project.find({ userId })
      .populate("nestedProjects")
      .populate("files");

    logger.info({ function: "projectscreateOrNestProject", step: "End" });

    res.status(201).json({
      message: "Project created successfully",
      project: newProject,
      projects,
    });
  } catch (err) {
    const message = "Error creating project";
    logger.error({
      message: message,
      error: err,
    });
    res.status(500).json({ message: message, err });
  }
};
