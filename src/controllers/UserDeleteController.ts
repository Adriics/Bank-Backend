import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserRole } from "../entities/User";

export class UserDeleteController {
  constructor(private readonly userService: UserService) {}

  async run(req: Request, res: Response): Promise<void> {
    const userIdToDelete = req.params.id;
    const authenticatedUser = res.locals.user;

    if (!authenticatedUser) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }

    // Verificar si el usuario está intentando eliminar su propia cuenta o si es un administrador
    if (
      authenticatedUser.id !== userIdToDelete &&
      authenticatedUser.role !== UserRole.ADMIN
    ) {
      res
        .status(403)
        .json({ message: "No tienes permiso para eliminar esta cuenta" });
      return;
    }

    try {
      await this.userService.deleteUser(userIdToDelete);
      res.status(200).json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  }
}
