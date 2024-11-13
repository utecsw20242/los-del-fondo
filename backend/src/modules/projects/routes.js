const express = require('express');
const authenticateJWT = require('../../middleware/authenticateJWT');
const router = express.Router();
const {  
    getProject, 
    updateProject, 
    deleteProject, 
    modifyNestedProject,
    removeNestedProject,
    updateProjectSurname,
    updateProjectStatus,
    createOrNestProject
} = require('./controller');

router.use(authenticateJWT);
router.get('/:userId', getProject);                       
router.put('/:id', updateProject);                
router.delete('/:id', deleteProject);

router.put('/:parentProjectId/nest-mod', modifyNestedProject);
router.delete('/:parentProjectId/nest-del', removeNestedProject); 

router.put('/:id/update-surname', updateProjectSurname);
router.put('/:id/update-status', updateProjectStatus);
router.post('/new-project', createOrNestProject);

module.exports = router;