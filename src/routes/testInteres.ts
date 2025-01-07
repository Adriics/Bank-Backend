import { Router, Request, Response } from "express";
import { AccountService } from "../services/AccountService";
import { AccountHelper } from "../helpers/AccountHelper";
import { TransactionHelper } from "../helpers/TransactionHelper";
import { check as authMiddleware } from "../middlewares/Auth";
import { AccountType, Currency } from "../entities/Account";
import dataSource from "../dataSourceServer";
import { ExchangeRateService } from "../services/ExchangeRateService";

export async function testInterest(router: Router): Promise<void> {
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

  router.post(
    "/api/test-interest",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { userId, initialBalance, annualInterestRate, months } = req.body;

        if (
          !userId ||
          initialBalance === undefined ||
          annualInterestRate === undefined ||
          months === undefined
        ) {
          res.status(400).json({ message: "Faltan parámetros requeridos" });
          return;
        }

        console.log(
          `Creating test account with: userId=${userId}, initialBalance=${initialBalance}, annualInterestRate=${annualInterestRate}, months=${months}`
        );

        const testAccount = await accountService.createAccount(
          userId,
          AccountType.SAVINGS,
          Currency.EUR,
          Number(initialBalance),
          Number(annualInterestRate)
        );

        console.log(`Test account created: ${JSON.stringify(testAccount)}`);

        for (let i = 0; i < months; i++) {
          console.log(`Applying interest for month ${i + 1}`);
          await accountService.applyMonthlyInterest();
          const updatedAccount = await accountService.getAccountById(
            testAccount.id
          );
          console.log(
            `Account after month ${i + 1}: ${JSON.stringify(updatedAccount)}`
          );
        }

        const finalAccount = await accountService.getAccountById(
          testAccount.id
        );

        if (!finalAccount) {
          res
            .status(404)
            .json({ message: "No se pudo encontrar la cuenta actualizada" });
          return;
        }

        console.log(`Final account state: ${JSON.stringify(finalAccount)}`);

        res.json({
          message: "Prueba de interés completada",
          accountId: testAccount.id,
          originalBalance: initialBalance,
          newBalance: Number(finalAccount.balance).toFixed(2),
          interestApplied: (
            Number(finalAccount.balance) - Number(initialBalance)
          ).toFixed(2),
          monthsSimulated: months,
        });
      } catch (error) {
        console.error("Error en la prueba de interés:", error);
        res
          .status(500)
          .json({
            message: "Error al realizar la prueba de interés",
            error: (error as Error).message,
          });
      }
    }
  );
}
