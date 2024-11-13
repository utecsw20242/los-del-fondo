const express = require('express');
const router = express.Router();
const {
    upload, 
    addFile,
    getFileById, 
    updateFile, 
    updateSurname,
    updateStatus, 
    deleteFile 
} = require('./controller');

router.post('/:projectId/add', upload.single('image'), addFile);                
router.get('/:id', getFileById);             
router.put('/:id/surname', updateSurname);  
router.put('/:id/status', updateStatus);
router.put('/:id/update', upload.single('image', updateFile));           
router.delete('/:id', deleteFile);          

module.exports = router;