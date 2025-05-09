import { RequestHandler } from "express";

export const roleGuard = (
  allowedRoles: ("CUSTOMER" | "ORGANIZER")[]
): RequestHandler => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      res.status(403).json({
        status: "error",
        message: "Forbidden: insufficient role",
      });
      return;
    }
    next();
  };
};
