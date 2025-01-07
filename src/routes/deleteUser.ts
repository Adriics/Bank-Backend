import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { UserHelper } from "../helpers/UserHelper";
import { AccountHelper } from "../helpers/AccountHelper";
import { AppDataSource } from "../dataSourceConfig";

const router = Router();

const userHelper = new UserHelper(AppDataSource);
const accountHelper = new AccountHelper(AppDataSource);
const userService = new UserService(userHelper, accountHelper);
const userController = new UserController(userService);

router.delete("/:id", userController.deleteUser);

export default router;
