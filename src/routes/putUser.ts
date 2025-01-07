import { Router } from "express";
import { UserPutController } from "../controllers/UserPutController";
import { UserService } from "../services/UserService";
import { UserHelper } from "../helpers/UserHelper";
import { AccountHelper } from "../helpers/AccountHelper";
import { check as authMiddleware } from "../middlewares/Auth";

export function putUser(router: Router): void {
  const userHelper = new UserHelper();
  const accountHelper = new AccountHelper();
  const userService = new UserService(userHelper, accountHelper);
  const controller = new UserPutController(userService);

  router.put("/api/users/:id", authMiddleware, (req, res) =>
    controller.run(req, res)
  );
}
