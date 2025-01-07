import express from "express";
import { UserDeleteController } from "../controllers/UserDeleteController";
import { UserService } from "../services/UserService";
import { UserHelper } from "../helpers/UserHelper";
import { AccountHelper } from "../helpers/AccountHelper";
import { AppDataSource } from "../dataSourceConfig";

export function registerUserRoutes(app: express.Application) {
  const router = express.Router();

  // Initialize helpers with DataSource
  const userHelper = new UserHelper(AppDataSource);
  const accountHelper = new AccountHelper(AppDataSource);

  // Initialize UserService with proper dependencies
  const userService = new UserService(userHelper, accountHelper);

  // Initialize UserController
  const userController = new UserController(userService);

  // Define routes
  router.post("/", userController.createUser);
  router.get("/:id", userController.getUser);
  router.put("/:id", userController.updateUser);
  router.delete("/:id", userController.deleteUser);
  router.get("/", userController.getAllUsers);

  // Use the router
  app.use("/api/users", router);
}
