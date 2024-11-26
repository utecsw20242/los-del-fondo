const path = require("path");
const { ObjectId } = require("mongoose").Types;
const multer = require("multer");
const { File, Project } = require("../../DB/mongodb");
const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");
const axios = require("axios");
const execPromise = util.promisify(exec);
const allowedTypes = /jpeg|jpg|png|gif|bmp|webp|tiff/;
const logger = require("../../utils/logger");

const fileFilter = (req, file, cb) => {
  if (!file) return cb(new Error("No file uploaded"));

  const isValid =
    allowedTypes.test(file.mimetype) &&
    allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (isValid) return cb(null, true);

  const error = new Error("Only image files (jpeg, jpg, png) are allowed");
  error.code = "INVALID_FILE_TYPE";
  return cb(error);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { username } = req.user;

    if (!username) {
      const error = new Error("Username is required");
      error.code = "USERNAME_REQUIRED";
      return cb(error);
    }
    const userDir = path.join(__dirname, "../../../uploads", username);
    try {
      fs.mkdirSync(userDir, { recursive: true });
      console.log(`creating user directory: ${userDir}`);
    } catch (err) {
      const error = new Error(`Error creating user directory: ${err.message}`);
      error.code = "DIRECTORY_CREATION_FAILED";
      return cb(error);
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

exports.upload = multer({ storage, fileFilter });

exports.addFile = async (req, res) => {
  try {
    logger.info({ function: "files/addFile", step: "Start" });
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }
    const { userId, projectId, surname } = req.body;
    let imagePath = req.file.path;

    const projectObjectId = new ObjectId(projectId);
    const project = await Project.findById(projectObjectId);
    if (!project) {
      logger.error({
        message: "Error when searching project",
        projectId: projectId,
      });
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // En lugar de ejecutar el script de Python, hacemos una solicitud HTTP al servidor FastAPI
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Enviamos la imagen al servidor FastAPI para que procese la imagen y devuelva la respuesta
    const data = {
      coded_file: base64Image,
    };

    let responseData = {};

    try {
      // Aquí hacemos la solicitud POST al servidor FastAPI
      const response = await axios.post(
        "http://127.0.0.1:8000/file/analyze",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      responseData = response.data;
    } catch (error) {
      const message = "Error contacting FastAPI server";
      logger.error({
        message: message,
        error: stderr,
      });
      console.error("Error al contactar con el servidor FastAPI: ", error);
      return res.status(500).json({ message: message, error });
    }

    const { matches, annotated_image_coded } = responseData;
    const doorNumber = matches.doors || 0;
    const windowNumber = matches.windows || 0;
    const textNumber = matches.texts || 0;
    const aiContent = JSON.stringify(matches);

    const imageUrl = `/uploads/${req.user.username}/${req.file.filename}`;

    const newFile = new File({
      userId,
      projectId: projectObjectId,
      name: req.file.filename,
      surname,
      doorNumber,
      windowNumber,
      textNumber,
      image: imageUrl, // En este caso la imagen base64 se guarda como URL, no como archivo codificado
      aiContent,
    });

    await newFile.save();
    await Project.findByIdAndUpdate(
      projectObjectId,
      { $push: { files: newFile._id } },
      { new: true }
    );

    const updateProject = await Project.findById(projectObjectId).populate(
      "files"
    );

    logger.info({ function: "files/addFile", step: "End" });

    return res.status(201).json({
      message: "File added successfully",
      file: newFile,
      project: updateProject,
    });
  } catch (error) {
    const message = "Error adding file";
    logger.error({
      message: message,
      error: error,
    });
    console.log("Error adding file:", error);
    res.status(500).json({ message: message, error });
  }
};

exports.getFileById = async (req, res) => {
  try {
    logger.info({ function: "files/getFileById", step: "Start" });
    const { id } = req.params;
    console.log(id);
    logger.info({ id: id });
    const file = await File.findById(id);
    if (!file) {
      const message = "File not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }
    console.log(file);
    logger.info({ function: "files/getFileById", step: "End" });
    res.status(200).json({ file });
  } catch (err) {
    const message = "Error getting file";
    logger.error({
      message: message,
    });
    res.status(500).json({ message: message, err });
  }
};

exports.updateFile = async (req, res) => {
  try {
    logger.info({ function: "files/UpdateFIle", step: "Start" });
    const { id } = req.params;
    const { surname } = req.body;
    const updateData = {};
    logger.info({ id: id, surname: surname });

    if (surname) {
      updateData.surname = surname;
    }

    if (req.file) {
      const imagePath = req.file.path;

      // Leer la imagen en base64 para enviarla al servidor de FastAPI
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");
      const data = { coded_file: base64Image };

      try {
        // Llamada al servidor de FastAPI
        const response = await axios.post(
          "http://127.0.0.1:8000/file/analyze",
          data,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        // Extraer los datos de la respuesta
        const responseData = response.data;
        const annotatedImage = responseData.annotated_file;

        updateData.doorNumber = responseData.doors || 0;
        updateData.windowNumber = responseData.windows || 0;
        updateData.textNumber = responseData.texts || 0;

        // Guardar la imagen anotada en el sistema de archivos (opcional)
        const annotatedBuffer = Buffer.from(annotatedImage, "base64");
        const annotatedImagePath = imagePath.replace(
          /(\.[\w\d_-]+)$/i,
          "-annotated$1"
        );
        fs.writeFileSync(annotatedImagePath, annotatedBuffer);

        // Actualizar el path de la imagen anotada
        updateData.image = annotatedImagePath;
        updateData.aiContent = JSON.stringify({
          doors: updateData.doorNumber,
          windows: updateData.windowNumber,
          texts: updateData.textNumber,
        });
      } catch (error) {
        const message = "Error procesando imagen con FastAPI";
        logger.error({
          message: message,
          error: stderr,
        });
        console.error("Error procesando imagen con FastAPI:", stderr);
        return res.status(500).json({
          message: message,
          error: stderr,
        });
      }
    }

    // Actualizar la información del archivo en la base de datos
    const updatedFile = await File.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedFile) {
      const message = "File not found";
      logger.error({
        message: message,
      });

      return res.status(404).json({ message: message });
    }

    logger.info({ function: "files/updateFile", step: "End" });
    res
      .status(200)
      .json({ message: "File updated successfully", file: updatedFile });
  } catch (error) {
    const message = "Error updating file";
    logger.error({
      message: message,
      error: error,
    });
    res.status(500).json({ message: message, error });
  }
};

exports.updateSurname = async (req, res) => {
  try {
    logger.info({ function: "files/updateSurname", step: "Start" });
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

    const updateFile = await File.findByIdAndUpdate(
      id,
      { surname },
      { new: true }
    );
    if (!updateFile) {
      const message = "File not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }

    logger.info({ function: "files/updateSurname", step: "End" });
    res
      .status(200)
      .json({ message: "Surname updated successfully", file: updateFile });
  } catch (err) {
    const message = "Error updating surname";
    logger.error({
      message: message,
      error: err,
    });
    res.status(500).json({ message: message, error });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    logger.info({ function: "files/updateStatus", step: "Start" });

    const { id } = req.params;
    const { status } = req.body;
    logger.info({ id: id, status: status });

    const validStatuses = ["deleted", "bookmarked", "archived", "default"];
    if (!status || !validStatuses.includes(status)) {
      const message = "Invalid or missing status";
      logger.error({
        message: message,
      });
      return res.status(400).json({ message: message });
    }

    const updatedFile = await File.findByIdAndUpdate(
      id,
      { status, latestStatusUpdate: Date.now() },
      { new: true }
    );

    if (!updatedFile) {
      const message = "File not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }

    logger.info({ function: "files/updateStatus", step: "End" });
    res
      .status(200)
      .json({ message: "Status updated successfully", file: updatedFile });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    logger.info({ function: "files/deleteFile", step: "Start" });

    const { id } = req.params;
    logger.info({ id: id });

    const deletedFile = await File.findByIdAndDelete(id);
    if (!deletedFile) {
      const message = "File not found";
      logger.error({
        message: message,
      });
      return res.status(404).json({ message: message });
    }

    logger.info({ function: "files/deleteFile", step: "End" });

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    const message = "Error deleting file";
    logger.error({
      message: message,
      error: error,
    });
    res.status(500).json({ message: message, error });
  }
};
