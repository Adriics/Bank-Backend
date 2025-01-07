import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserRole } from "../entities/User";

export class UserGetController {
  constructor(private readonly userService: UserService) {}

  async run(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const authenticatedUser = res.locals.user;

    if (!authenticatedUser) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }

    // Verificar si el usuario está intentando acceder a su propia información o si es un administrador
    if (
      authenticatedUser.id !== userId &&
      authenticatedUser.role !== UserRole.ADMIN
    ) {
      res
        .status(403)
        .json({ message: "No tienes permiso para acceder a esta información" });
      return;
    }

    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
