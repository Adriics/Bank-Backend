import { Router, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserHelper } from "../helpers/UserHelper";
import { UserPostLoginController } from "../controllers/UserPostLoginController";
import { AccountHelper } from "../helpers/AccountHelper";

export function postLogin(router: Router): void {
  const service = new UserService(new UserHelper(), new AccountHelper());
  const controller = new UserPostLoginController(service);

  router.post("/api/login", async (req: Request, res: Response) => {
    await controller.run(req, res);
  });
}
