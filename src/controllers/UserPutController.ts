import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserRole } from "../entities/User";

export class UserPutController {
  constructor(private readonly userService: UserService) {}

  async run(req: Request, res: Response): Promise<void> {
    const userIdToUpdate = req.params.id;
    const authenticatedUser = res.locals.user;
    const { name, surname, email } = req.body;

    console.log(`Received PUT request for user ID: ${userIdToUpdate}`);

    if (!authenticatedUser) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }

    // Verificar si el usuario está intentando actualizar su propia información o si es un administrador
    if (
      authenticatedUser.id !== userIdToUpdate &&
      authenticatedUser.role !== UserRole.ADMIN
    ) {
      res
        .status(403)
        .json({
          message: "No tienes permiso para actualizar esta información",
        });
      return;
    }

    try {
      const updatedUser = await this.userService.updateUser(userIdToUpdate, {
        name,
        surname,
        email,
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  }
}
