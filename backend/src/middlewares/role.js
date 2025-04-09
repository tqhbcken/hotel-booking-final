
const getRole = (allowedRoles) => {
    return (req, res, next) => {
        const role = req.user.role;
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: "Forbidden - You are not authorized to access this resource" });
        }
        next();
    }
}

module.exports = {
    getRole,
};
