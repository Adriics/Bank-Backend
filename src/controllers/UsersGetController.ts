import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UsersGetController {
  constructor(private userService: UserService) {}

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while fetching users",
      });
    }
  };
}
