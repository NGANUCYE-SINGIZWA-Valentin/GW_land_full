// src/middleware/role.middleware.js
// Restricts a route to specific roles. Must be used AFTER `authenticate`,
// since it reads req.user which authenticate sets.
//
// Usage on a route:
//   router.delete('/listings/:id', authenticate, authorize('admin', 'sub_admin'), controllerFn)

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
}

module.exports = authorize;
