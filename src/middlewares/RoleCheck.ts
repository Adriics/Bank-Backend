// src/middlewares/RoleCheck.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../entities/UserRole";

export class RoleCheckMiddleware {
  check(allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const token = req.headers.authorization?.replace("Bearer ", "");

        if (!token) {
          res.status(401).json({ message: "No se proporcionó token" });
          return;
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "tu_clave_secreta_aqui"
        ) as {
          id: string;
          email: string;
          role: UserRole;
        };

        if (!allowedRoles.includes(decoded.role)) {
          res.status(403).json({ message: "Permisos insuficientes" });
          return;
        }

        res.locals.userId = decoded.id;
        res.locals.userEmail = decoded.email;
        res.locals.userRole = decoded.role;
        next();
      } catch (error) {
        res.status(401).json({ message: "Token inválido" });
        return;
      }
    };
  }
}
