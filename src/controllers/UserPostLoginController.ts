// src/controllers/LoginPostController.ts
import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserNotFound } from "../errors/UserNotFound";

export class UserPostLoginController {
  constructor(private readonly service: UserService) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log(`Intento de login para email: ${email}`);
      const token = await this.service.login(email, password);
      res.status(200).json({ ok: true, token });
    } catch (error) {
      console.error("Error detallado en el login:", error);
      if (error instanceof UserNotFound) {
        res.status(401).json({ ok: false, message: "Credenciales inválidas" });
      } else {
        res
          .status(500)
          .json({ ok: false, message: "Error interno del servidor" });
      }
    }
  }
}
