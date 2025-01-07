import { Router, Request, Response } from "express";
import { TransactionController } from "../controllers/TransactionController";
import { AccountService } from "../services/AccountService";
import { AccountHelper } from "../helpers/AccountHelper";
import { TransactionHelper } from "../helpers/TransactionHelper";
import { check as authMiddleware } from "../middlewares/Auth";
import dataSource from "../dataSourceServer";
import { ExchangeRateService } from "../services/ExchangeRateService";

export async function postWithdraw(router: Router): Promise<void> {
  const accountHelper = new AccountHelper();
  const transactionHelper = new TransactionHelper();
  const resolvedDataSource = await dataSource;
  const exchangeRateService = new ExchangeRateService(resolvedDataSource);
  const accountService = new AccountService(
    accountHelper,
    transactionHelper,
    resolvedDataSource,
    exchangeRateService
  );
  const transactionController = new TransactionController(accountService);

  router.post(
    "/api/withdraw",
    authMiddleware,
    async (req: Request, res: Response) => {
      await transactionController.withdraw(req, res);
    }
  );
}
