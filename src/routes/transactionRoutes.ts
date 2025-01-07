import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController";
import { AccountService } from "../services/AccountService";
import { AccountHelper } from "../helpers/AccountHelper";
import { TransactionHelper } from "../helpers/TransactionHelper";
import { check as authMiddleware } from "../middlewares/Auth";

export function registerTransactionRoutes(router: Router): void {
  const accountHelper = new AccountHelper();
  const transactionHelper = new TransactionHelper();
  const accountService = new AccountService(accountHelper, transactionHelper);
  const transactionController = new TransactionController(accountService);
}
