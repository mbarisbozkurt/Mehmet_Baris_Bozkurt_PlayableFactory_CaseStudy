"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeOwnerOrAdmin = exports.authorizeAdmin = exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const authenticate = async (req, res, next) => {
    try {
        const token = (0, jwt_utils_1.extractTokenFromHeader)(req.headers.authorization);
        const decoded = (0, jwt_utils_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
const authorizeAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
const authorizeOwnerOrAdmin = (req, res, next) => {
    const userId = req.params.userId || req.body.userId;
    if (req.user?.role !== 'admin' && req.user?.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
};
exports.authorizeOwnerOrAdmin = authorizeOwnerOrAdmin;
