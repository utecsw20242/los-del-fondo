const path = require("path");
const { ObjectId } = require('mongoose').Types;
const multer = require("multer");
const { File, Project } = require("../../DB/mongodb");
const fs = require("fs");
const { exec } = require('child_process');
const util = require('util'); 
const execPromise = util.promisify(exec);
const axios = require("axios");
const allowedTypes = /jpeg|jpg|png|gif|bmp|webp|tiff/;

const fileFilter = (req, file, cb) => {
  if(!file)return cb(new Error('No file uploaded'));

  const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (isValid) return cb(null, true);
  
  const error = new Error("Only image files (jpeg, jpg, png) are allowed");
  error.code = 'INVALID_FILE_TYPE';
  return cb(error);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { username } = req.user;

    if (!username) {
      const error = new Error("Username is required");
      error.code = 'USERNAME_REQUIRED';
      return cb(error);
    }
    const userDir = path.join(__dirname, "../../../uploads", username);
    try {
      fs.mkdirSync(userDir, { recursive: true });
      console.log(`creating user directory: ${userDir}`);
    } catch (err) {
      const error = new Error(`Error creating user directory: ${err.message}`);
      error.code = 'DIRECTORY_CREATION_FAILED';
      return cb(error);
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

exports.upload = multer({ storage, fileFilter });

exports.addFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }
    const { userId, projectId, surname } = req.body;
    let imagePath = req.file.path;

    const projectObjectId = new ObjectId(projectId);
    const project = await Project.findById(projectObjectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

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
      const response = await axios.post("http://127.0.0.1:8000/file/analyze", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      responseData = response.data;
    } catch (error) {
      console.error("Error al contactar con el servidor FastAPI: ", error);
      return res.status(500).json({ message: "Error contacting FastAPI server", error });
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
      image: imageUrl,  // En este caso la imagen base64 se guarda como URL, no como archivo codificado
      aiContent,
    });

    await newFile.save();
    await Project.findByIdAndUpdate(
      projectObjectId,
      { $push: { files: newFile._id } },
      { new: true }
    );

    const updateProject = await Project.findById(projectObjectId).populate('files');
    return res.status(201).json({ message: "File added successfully", file: newFile, project: updateProject });
  } catch (error) {
    console.log("Error al agregar archivo:", error);
    res.status(500).json({ message: "Error adding file", error });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: "File not found" });
    console.log(file);
    res.status(200).json({ file });
  } catch (err) {
    res.status(500).json({ message: "Error getting file", err });
  }
};

exports.updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { surname } = req.body;
    const updateData = {};

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
        const response = await axios.post("http://127.0.0.1:8000/file/analyze", data, {
          headers: { "Content-Type": "application/json" },
        });

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
        console.error("Error procesando imagen con FastAPI:", error.message);
        return res.status(500).json({
          message: "Error procesando imagen con FastAPI",
          error: error.message,
        });
      }
    }

    // Actualizar la información del archivo en la base de datos
    const updatedFile = await File.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedFile) {
      return res.status(404).json({ message: "File not found" });
    }

    res
      .status(200)
      .json({ message: "File updated successfully", file: updatedFile });
  } catch (error) {
    console.error("Error actualizando archivo:", error.message);
    res.status(500).json({ message: "Error actualizando archivo", error });
  }
};

exports.updateSurname = async (req, res) => {
  try {
    const { id } = req.params;
    const { surname } = req.body;
    if (!surname) return res.status(400).json({ message: "Surname is required" });
    const updateFile = await File.findByIdAndUpdate(id, { surname }, { new: true });
    if (!updateFile) return res.status(404).json({ message: "File not found" });
    res.status(200).json({ message: "Surname updated successfully", file: updateFile });
  } catch (err) {
    res.status(500).json({ message: "Error updating surname", error });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["deleted", "bookmarked", "archived", "default"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status" });
    }

    const updatedFile = await File.findByIdAndUpdate(
      id,
      { status, latestStatusUpdate: Date.now() },
      { new: true }
    );

    if (!updatedFile) return res.status(404).json({ message: "File not found" });

    res.status(200).json({ message: "Status updated successfully", file: updatedFile });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFile = await File.findByIdAndDelete(id);
    if (!deletedFile) return res.status(404).json({ message: "File not found" });
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting file", error });
  }
};
