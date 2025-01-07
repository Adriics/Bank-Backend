import express from "express";
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
import { AppDataSource } from "../dataSourceConfig";

export function registerCardRoutes(app: express.Application) {
  const router = express.Router();

  // Initialize helpers with DataSource
  const cardHelper = new CardHelper(AppDataSource);
  const accountHelper = new AccountHelper(AppDataSource);
  const transactionHelper = new TransactionHelper(AppDataSource);
  const userHelper = new UserHelper(AppDataSource);

  // Initialize services with proper dependencies
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

  // Routes
  router.post("/", cardController.createCard);
  router.get("/:id", cardController.getCard);
  router.get("/user/:userId", cardController.getCardsByUser);
  router.post("/:id/payment", cardController.makePayment);
  router.post("/:id/pay-balance", cardController.payBalance);
  router.get("/:id/statement", cardController.generateMonthlyStatement);
  router.delete("/:id", cardController.deleteCard);
  router.post("/:id/add-funds", cardController.addFunds);

  app.use("/api/cards", router);
}
