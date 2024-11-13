const express = require('express');
const response = require('../../network/response');
const controller = require('./index');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const authenticateJWT = require('../../middleware/authenticateJWT');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'secretkey';
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
const validateUserInput = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.error(req, res, errors.array(), 400);
        }
        next();
    }
];
router.get('/',asyncHandler(async (req, res) => {
    const items = await controller.allUsers();
    response.success(req, res, items, 200);
}));
router.get('/:id', authenticateJWT, asyncHandler(async (req, res) => {
    const  id  = req.params.id;
    const  user = req.user;
    if (user.id !== id) return res.status(403).json({ message: 'Forbidden' });
    const items = await controller.oneUser(id);
    response.success(req, res, items, 200);
}));
router.get('/:username', authenticateJWT, asyncHandler(async (req, res) => {
    const {username} = req.params;
    const loggedInUser = req.user.username;
    if (loggedInUser !== username) return res.status(403).json({ message: 'Forbidden' });
    const items = await controller.oneUser(username);
    response.success(req, res, items, 200);
}));
router.delete('/', asyncHandler(async (req, res) => {
    await controller.removeUser(req.body);
    response.success(req, res, 'User was removed', 200);
}));
router.post('/', asyncHandler(async (req, res) => {
    const items = await controller.addUser(req.body);
    response.success(req, res, items, 201);
}));
router.post('/login', asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return response.error(req, res, errors.array(), 400);
    const { token, user } = await controller.loginUser(req.body);
    return response.success(req, res, { token, user }, 200);
}));
router.post('/verify-email', asyncHandler(async (req, res) => {
    const exists = await controller.checkEmailExists(req.body.email);
    if (exists) {
        response.success(req, res, 'Email exists. You will receive an email confirmation.', 200);
    } else {
        response.error(req, res, 'No account found with that email.', 404);
    }
}));
module.exports = router;