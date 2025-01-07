import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserRole } from "../entities/User";

export class AdminController {
  constructor(private readonly userService: UserService) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, surname, role } = req.body;
      const newUser = await this.userService.register(
        name,
        email,
        password,
        surname,
        role as UserRole
      );
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({
        message: "Error creating user",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, surname, role } = req.body;
      const updatedUser = await this.userService.updateUser(id, {
        name,
        email,
        surname,
        role,
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        message: "Error updating user",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.userService.deactivateUser(id);
      res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({
        message: "Error deactivating user",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error getting all users:", error);
      res.status(500).json({
        message: "Error getting all users",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
