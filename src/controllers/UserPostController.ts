import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserRole } from "../entities/User";

export class UserPostController {
  constructor(private readonly service: UserService) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, surname, role } = req.body;

      console.log("Register request received:", {
        name,
        email,
        surname,
        role,
      });

      const user = await this.service.register(
        name,
        email,
        password,
        surname,
        role ? UserRole[role as keyof typeof UserRole] : undefined
      );

      res.status(201).json(user);
    } catch (error) {
      console.error("Error in user registration:", error);
      res.status(500).json({
        message: "Error en el registro de usuario",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
