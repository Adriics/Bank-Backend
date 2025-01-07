import { Request, Response } from "express";
import { AccountService } from "../services/AccountService";
import { AccountType, Currency } from "../entities/Account";
import { UserRole } from "../entities/User";

export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const { type, currency, initialBalance } = req.body;
      const userId = res.locals.user.id;
      const userRole = res.locals.user.role;

      if (userRole !== UserRole.CLIENT) {
        res
          .status(403)
          .json({
            message: "Solo los clientes pueden crear cuentas bancarias",
          });
        return;
      }

      const account = await this.accountService.createAccount(
        userId,
        type as AccountType,
        currency as Currency,
        initialBalance
      );

      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating account:", error);
      res.status(500).json({ message: "Error al crear la cuenta" });
    }
  }

  async getAccount(req: Request, res: Response): Promise<void> {
    try {
      const accountId = req.params.id;
      const userId = res.locals.user.id;
      const userRole = res.locals.user.role;

      const account = await this.accountService.getAccountById(accountId);

      if (!account) {
        res.status(404).json({ message: "Cuenta no encontrada" });
        return;
      }

      if (account.userId !== userId && userRole !== UserRole.ADMIN) {
        res
          .status(403)
          .json({ message: "No tienes permiso para ver esta cuenta" });
        return;
      }

      res.status(200).json(account);
    } catch (error) {
      console.error("Error getting account:", error);
      res.status(500).json({ message: "Error al obtener la cuenta" });
    }
  }

  async getUserAccounts(req: Request, res: Response): Promise<void> {
    try {
      const userId = res.locals.user.id;
      const accounts = await this.accountService.getAccountsByUserId(userId);
      res.status(200).json(accounts);
    } catch (error) {
      console.error("Error getting user accounts:", error);
      res
        .status(500)
        .json({ message: "Error al obtener las cuentas del usuario" });
    }
  }

  async updateAccount(req: Request, res: Response): Promise<void> {
    try {
      const accountId = req.params.id;
      const { balance } = req.body;
      const userId = res.locals.user.id;
      const userRole = res.locals.user.role;

      const account = await this.accountService.getAccountById(accountId);

      if (!account) {
        res.status(404).json({ message: "Cuenta no encontrada" });
        return;
      }

      if (account.userId !== userId && userRole !== UserRole.ADMIN) {
        res
          .status(403)
          .json({ message: "No tienes permiso para actualizar esta cuenta" });
        return;
      }

      const updatedAccount = await this.accountService.updateBalance(
        accountId,
        balance
      );
      res.status(200).json(updatedAccount);
    } catch (error) {
      console.error("Error updating account:", error);
      res.status(500).json({ message: "Error al actualizar la cuenta" });
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const accountId = req.params.id;
      const userId = res.locals.user.id;
      const userRole = res.locals.user.role;

      const account = await this.accountService.getAccountById(accountId);

      if (!account) {
        res.status(404).json({ message: "Account not found" });
        return;
      }

      if (account.userId !== userId && userRole !== UserRole.ADMIN) {
        res
          .status(403)
          .json({
            message: "You don't have permission to delete this account",
          });
        return;
      }

      await this.accountService.deleteAccount(accountId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({
            message: "An unexpected error occurred while deleting the account",
          });
      }
    }
  }

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

      // Verify that the source account belongs to the current user
      const fromAccount = await this.accountService.getAccountById(
        fromAccountId
      );
      if (
        !fromAccount ||
        (fromAccount.userId !== userId && userRole !== UserRole.ADMIN)
      ) {
        res
          .status(403)
          .json({ message: "You don't have permission to make this transfer" });
        return;
      }

      const transaction = await this.accountService.transfer(
        fromAccountId,
        toAccountId,
        amount,
        description
      );

      // Get updated balances after the transfer
      const updatedFromAccount = await this.accountService.getAccountById(
        fromAccountId
      );
      const updatedToAccount = await this.accountService.getAccountById(
        toAccountId
      );

      res.status(201).json({
        transaction,
        updatedBalances: {
          fromAccount: updatedFromAccount?.balance,
          toAccount: updatedToAccount?.balance,
        },
      });
    } catch (error) {
      console.error("Error in transfer:", error);
      res
        .status(500)
        .json({
          message: "Error making transfer",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }
}
