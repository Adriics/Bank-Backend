import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../entities/User";

export function check(req: Request, res: Response, next: NextFunction): void {
  try {
    console.log("Headers recibidos:", req.headers);
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader);

    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.log("No se proporcionó token");
      res
        .status(401)
        .json({ message: "No se proporcionó token de autenticación" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error(
        "JWT_SECRET no está configurado en las variables de entorno"
      );
      res.status(500).json({ message: "Error de configuración del servidor" });
      return;
    }

    console.log("Intentando verificar el token");
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
      role: UserRole;
    };
    console.log("Token verificado exitosamente:", decoded);

    res.locals.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Error al verificar el token:", error);
    res.status(401).json({ message: "Token de autenticación inválido" });
  }
}
