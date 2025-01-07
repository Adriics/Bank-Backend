import { Router } from "express";
import { AccountController } from "../controllers/AccountController";
import { AccountService } from "../services/AccountService";
import { AccountHelper } from "../helpers/AccountHelper";
import { TransactionHelper } from "../helpers/TransactionHelper";
import { check as authMiddleware } from "../middlewares/Auth";
import dataSource from "../dataSourceServer";
import { ExchangeRateService } from "../services/ExchangeRateService";

export async function registerAccountRoutes(router: Router): Promise<void> {
  const accountHelper = new AccountHelper();
  const transactionHelper = new TransactionHelper();

  try {
    const resolvedDataSource = await dataSource;
    const exchangeRateService = new ExchangeRateService(resolvedDataSource);
    const accountService = new AccountService(
      accountHelper,
      transactionHelper,
      resolvedDataSource,
      exchangeRateService
    );
    const accountController = new AccountController(accountService);

    router.post("/api/accounts", authMiddleware, (req, res) =>
      accountController.createAccount(req, res)
    );
    router.get("/api/accounts/:id", authMiddleware, (req, res) =>
      accountController.getAccount(req, res)
    );
    router.get("/api/user/accounts", authMiddleware, (req, res) =>
      accountController.getUserAccounts(req, res)
    );
    router.put("/api/accounts/:id", authMiddleware, (req, res) =>
      accountController.updateAccount(req, res)
    );
    router.delete("/api/accounts/:id", authMiddleware, (req, res) =>
      accountController.deleteAccount(req, res)
    );
    router.post("/api/transfer", authMiddleware, (req, res) =>
      accountController.transfer(req, res)
    );
  } catch (error) {
    console.error("Error al registrar las rutas de cuentas:", error);
  }
}
