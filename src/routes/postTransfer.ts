import { Router, Request, Response } from "express";
import { TransactionController } from "../controllers/TransactionController";
import { AccountService } from "../services/AccountService";
import { AccountHelper } from "../helpers/AccountHelper";
import { TransactionHelper } from "../helpers/TransactionHelper";
import { check as authMiddleware } from "../middlewares/Auth";
import dataSource from "../dataSourceServer";
import { ExchangeRateService } from "../services/ExchangeRateService";
import { DataSource } from "typeorm";

export async function postTransfer(router: Router): Promise<void> {
  const accountHelper = new AccountHelper();
  const transactionHelper = new TransactionHelper();

  try {
    const resolvedDataSource: DataSource = await dataSource;
    const exchangeRateService = new ExchangeRateService(resolvedDataSource);
    const accountService = new AccountService(
      accountHelper,
      transactionHelper,
      resolvedDataSource,
      exchangeRateService
    );
    const transactionController = new TransactionController(accountService);

    router.post(
      "/api/transfer",
      authMiddleware,
      async (req: Request, res: Response) => {
        await transactionController.transfer(req, res);
      }
    );
  } catch (error) {
    console.error("Error initializing services:", error);
    throw error;
  }
}
