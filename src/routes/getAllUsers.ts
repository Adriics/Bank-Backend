import { Router } from "express";
import { UsersGetController } from "../controllers/UsersGetController";
import { UserService } from "../services/UserService";
import { UserHelper } from "../helpers/UserHelper";
import { AccountHelper } from "../helpers/AccountHelper";
import { AppDataSource } from "../dataSourceConfig";

const router = Router();

const userHelper = new UserHelper(AppDataSource);
const accountHelper = new AccountHelper(AppDataSource);
const userService = new UserService(userHelper, accountHelper);
const userController = new UsersGetController(userService);

router.get("/", userController.getAllUsers);

export default router;
