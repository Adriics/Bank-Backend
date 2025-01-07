import { Router } from "express";
import { CardController } from "../controllers/CardController";
import { CardService } from "../services/CardService";
import { CardHelper } from "../helpers/CardHelper";
import { AccountService } from "../services/AccountService";
import { AccountHelper } from "../helpers/AccountHelper";
import { TransactionHelper } from "../helpers/TransactionHelper";
import { UserService } from "../services/UserService";
import { UserHelper } from "../helpers/UserHelper";
import { CurrencyService } from "../services/CurrencyService";
import { ExchangeRateService } from "../services/ExchangeRateService";
import { AppDataSource } from //dataSourceConfig";

const router = Router();

const cardHelper = new CardHelper(AppDataSource);
const accountHelper = new AccountHelper(AppDataSource);
const transactionHelper = new TransactionHelper(AppDataSource);
const userHelper = new UserHelper(AppDataSource);

const exchangeRateService = new ExchangeRateService("EUR");
const currencyService = new CurrencyService();

const accountService = new AccountService(
  accountHelper,
  transactionHelper,
  AppDataSource,
  exchangeRateService
);
const userService = new UserService(userHelper, accountHelper);

const cardService = new CardService(
  cardHelper,
  accountService,
  transactionHelper,
  userService,
  currencyService
);
const cardController = new CardController(cardService);

router.post("/", cardController.createCard);

export default router;
