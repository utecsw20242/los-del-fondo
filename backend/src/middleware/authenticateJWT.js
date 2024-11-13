const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if(!token) {
        return res.status(403).json({ message: 'Access denied, token missing' });
    }
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.log('JWT Error:', err);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateJWT;