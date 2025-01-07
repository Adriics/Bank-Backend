import { Request, Response } from "express";
import { AccountService } from "../services/AccountService";
import { UserRole } from "../entities/User";
import { TransactionType } from "../entities/Transaction";

export class TransactionController {
  constructor(private readonly accountService: AccountService) {}

  async transfer(req: Request, res: Response): Promise<void> {
    try {
      const { fromAccountId, toAccountId, amount, description } = req.body;
      const userId = res.locals.user.id;
      const userRole = res.locals.user.role;

      if (
        typeof fromAccountId !== "string" ||
        typeof toAccountId !== "string" ||
        typeof amount !== "number" ||
        typeof description !== "string"
      ) {
        res.status(400).json({ message: "Invalid input data" });
        return;
      }

      // Verificar que la cuenta de origen pertenece al usuario actual
      const fromAccount = await this.accountService.getAccountById(
        fromAccountId
      );
      if (
        !fromAccount ||
        (fromAccount.userId !== userId && userRole !== UserRole.ADMIN)
      ) {
        res
          .status(403)
          .json({
            message: "No tienes permiso para realizar esta transferencia",
          });
        return;
      }

      const result = await this.accountService.transfer(
        fromAccountId,
        toAccountId,
        amount,
        description
      );
      res.status(201).json(result);
    } catch (error) {
      console.error("Error en la transferencia:", error);
      res
        .status(500)
        .json({
          message: "Error al realizar la transferencia",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }

  async deposit(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, amount, description } = req.body;
      const userId = res.locals.user.id;
      const userRole = res.locals.user.role;

      if (
        typeof accountId !== "string" ||
        typeof amount !== "number" ||
        typeof description !== "string"
      ) {
        res.status(400).json({ message: "Invalid input data" });
        return;
      }

      // Verificar que la cuenta pertenece al usuario actual
      const account = await this.accountService.getAccountById(accountId);
      if (
        !account ||
        (account.userId !== userId && userRole !== UserRole.ADMIN)
      ) {
        res
          .status(403)
          .json({ message: "No tienes permiso para realizar este depósito" });
        return;
      }

      const transaction = await this.accountService.deposit(
        accountId,
        amount,
        description
      );
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error en el depósito:", error);
      res
        .status(500)
        .json({
          message: "Error al realizar el depósito",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }

  async withdraw(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, amount, description } = req.body;
      const userId = res.locals.user.id;
      const userRole = res.locals.user.role;

      if (
        typeof accountId !== "string" ||
        typeof amount !== "number" ||
        typeof description !== "string"
      ) {
        res.status(400).json({ message: "Invalid input data" });
        return;
      }

      // Verificar que la cuenta pertenece al usuario actual
      const account = await this.accountService.getAccountById(accountId);
      if (
        !account ||
        (account.userId !== userId && userRole !== UserRole.ADMIN)
      ) {
        res
          .status(403)
          .json({ message: "No tienes permiso para realizar este retiro" });
        return;
      }

      const transaction = await this.accountService.withdraw(
        accountId,
        amount,
        description
      );
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error en el retiro:", error);
      res
        .status(500)
        .json({
          message: "Error al realizar el retiro",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }

  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { type, amount, fromAccountId, toAccountId, description } =
        req.body;
      const userId = res.locals.user.id;
      const userRole = res.locals.user.role;

      if (!Object.values(TransactionType).includes(type)) {
        res.status(400).json({ message: "Invalid transaction type" });
        return;
      }

      if (typeof amount !== "number" || amount <= 0) {
        res.status(400).json({ message: "Invalid amount" });
        return;
      }

      let transaction;

      switch (type) {
        case TransactionType.TRANSFER:
          if (!fromAccountId || !toAccountId) {
            res
              .status(400)
              .json({
                message:
                  "Both fromAccountId and toAccountId are required for transfers",
              });
            return;
          }
          transaction = await this.accountService.transfer(
            fromAccountId,
            toAccountId,
            amount,
            description
          );
          break;
        case TransactionType.DEPOSIT:
          if (!toAccountId) {
            res
              .status(400)
              .json({ message: "toAccountId is required for deposits" });
            return;
          }
          transaction = await this.accountService.deposit(
            toAccountId,
            amount,
            description
          );
          break;
        case TransactionType.WITHDRAWAL:
          if (!fromAccountId) {
            res
              .status(400)
              .json({ message: "fromAccountId is required for withdrawals" });
            return;
          }
          transaction = await this.accountService.withdraw(
            fromAccountId,
            amount,
            description
          );
          break;
        default:
          res.status(400).json({ message: "Invalid transaction type" });
          return;
      }

      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res
        .status(500)
        .json({
          message: "Error creating transaction",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }
}
