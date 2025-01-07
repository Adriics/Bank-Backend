import { Router } from "express";
import { AccountController } from "../controllers/AccountController";
import { AccountService } from "../services/AccountService";
import { AccountHelper } from "../helpers/AccountHelper";
import { TransactionHelper } from "../helpers/TransactionHelper";
import { ExchangeRateService } from "../services/ExchangeRateService";
import { AppDataSource } from "../dataSourceConfig";

const router = Router();

const accountHelper = new AccountHelper(AppDataSource);
const transactionHelper = new TransactionHelper(AppDataSource);
const exchangeRateService = new ExchangeRateService("EUR");
const accountService = new AccountService(
  accountHelper,
  transactionHelper,
  AppDataSource,
  exchangeRateService
);
const accountController = new AccountController(accountService);

router.post("/", accountController.createAccount);

export default router;
