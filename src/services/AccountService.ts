import { Account, AccountType, Currency } from "../entities/Account";
import { AccountHelper } from "../helpers/AccountHelper";
import { TransactionHelper } from "../helpers/TransactionHelper";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../entities/Transaction";
import { v4 as uuidv4 } from "uuid";
import { DataSource, EntityManager } from "typeorm";
import { ExchangeRateService } from "./ExchangeRateService";

interface ExchangeRates {
  [key: string]: number;
}

export class AccountService {
  private exchangeRates: ExchangeRates = {
    EURUSD: 1.1,
    EURGBP: 0.85,
    EURJPY: 130,
    EURAUD: 1.6,
    USDEUR: 1 / 1.1,
    USDGBP: 0.85 / 1.1,
    USDJPY: 130 / 1.1,
    USDAUD: 1.6 / 1.1,
    GBPEUR: 1 / 0.85,
    GBPUSD: 1.1 / 0.85,
    GBPJPY: 130 / 0.85,
    GBPAUD: 1.6 / 0.85,
    JPYEUR: 1 / 130,
    JPYUSD: 1.1 / 130,
    JPYGBP: 0.85 / 130,
    JPYAUD: 1.6 / 130,
    AUDEUR: 1 / 1.6,
    AUDUSD: 1.1 / 1.6,
    AUDGBP: 0.85 / 1.6,
    AUDJPY: 130 / 1.6,
  };

  constructor(
    private readonly accountHelper: AccountHelper,
    private readonly transactionHelper: TransactionHelper,
    private readonly dataSource: DataSource,
    private readonly exchangeRateService: ExchangeRateService
  ) {}

  async createAccount(
    userId: string,
    type: AccountType,
    currency: Currency,
    initialBalance: number = 0,
    annualInterestRate: number = 0,
    dailyTransactionLimit: number = 1000
  ): Promise<Account> {
    if (
      isNaN(initialBalance) ||
      isNaN(annualInterestRate) ||
      isNaN(dailyTransactionLimit)
    ) {
      throw new Error("Invalid numeric values provided");
    }

    const id = uuidv4();
    const now = new Date();
    const account = new Account(
      id,
      userId,
      type,
      currency,
      Number(initialBalance.toFixed(2)),
      Number(initialBalance.toFixed(2)),
      now,
      now,
      Number(annualInterestRate.toFixed(2)),
      now,
      Number(dailyTransactionLimit.toFixed(2))
    );

    await this.accountHelper.create(account);
    return account;
  }

  async getAccountById(id: string): Promise<Account | null> {
    const account = await this.accountHelper.findById(id);
    if (account) {
      account.balance = Number(account.balance);
      account.averageDailyBalance = Number(account.averageDailyBalance);
      account.annualInterestRate = Number(account.annualInterestRate);
      account.dailyTransactionLimit = Number(account.dailyTransactionLimit);
    }
    return account;
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    const accounts = await this.accountHelper.findByUserId(userId);
    return accounts.map((account) => {
      account.balance = Number(account.balance);
      account.averageDailyBalance = Number(account.averageDailyBalance);
      account.annualInterestRate = Number(account.annualInterestRate);
      account.dailyTransactionLimit = Number(account.dailyTransactionLimit);
      return account;
    });
  }

  async updateBalance(id: string, newBalance: number): Promise<Account> {
    const account = await this.getAccountById(id);
    if (!account) {
      throw new Error("Account not found");
    }
    account.updateBalance(newBalance);
    await this.accountHelper.update(account);
    return account;
  }

  async deleteAccount(id: string): Promise<void> {
    const account = await this.getAccountById(id);
    if (!account) {
      throw new Error("Account not found");
    }

    if (account.balance !== 0) {
      throw new Error("Cannot delete account with non-zero balance");
    }

    const pendingTransactions =
      await this.transactionHelper.getPendingTransactions(id);
    if (pendingTransactions.length > 0) {
      throw new Error("Cannot delete account with pending transactions");
    }

    await this.accountHelper.delete(id);
  }

  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string
  ): Promise<{
    transaction: Transaction;
    updatedBalances: { fromAccount: string; toAccount: string };
  }> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      console.log(
        `Starting transfer from ${fromAccountId} to ${toAccountId} of amount ${amount}`
      );

      const fromAccount = await this.getAccountForUpdate(
        transactionalEntityManager,
        fromAccountId
      );
      const toAccount = await this.getAccountForUpdate(
        transactionalEntityManager,
        toAccountId
      );

      if (!fromAccount || !toAccount) {
        throw new Error("One or both accounts not found");
      }

      const fromBalance = Number(fromAccount.balance);
      const toBalance = Number(toAccount.balance);

      console.log(`From account balance before transfer: ${fromBalance}`);
      console.log(`To account balance before transfer: ${toBalance}`);

      if (fromBalance < amount) {
        throw new Error("Insufficient funds");
      }

      const todayTransactions =
        await this.transactionHelper.getTodayTransactionsAmount(fromAccountId);
      if (todayTransactions + amount > fromAccount.dailyTransactionLimit) {
        throw new Error("Daily transaction limit exceeded");
      }

      let convertedAmount = amount;
      if (fromAccount.currency !== toAccount.currency) {
        const exchangeRate = await this.exchangeRateService.getExchangeRate(
          fromAccount.currency,
          toAccount.currency
        );
        convertedAmount = Number((amount * exchangeRate).toFixed(2));
      }

      const newFromBalance = Number((fromBalance - amount).toFixed(2));
      const newToBalance = Number((toBalance + convertedAmount).toFixed(2));

      fromAccount.balance = newFromBalance;
      toAccount.balance = newToBalance;

      await transactionalEntityManager.save(fromAccount);
      await transactionalEntityManager.save(toAccount);

      console.log(`From account balance after save: ${fromAccount.balance}`);
      console.log(`To account balance after save: ${toAccount.balance}`);

      const transaction = new Transaction(
        uuidv4(),
        TransactionType.TRANSFER,
        amount,
        fromAccountId,
        toAccountId,
        description,
        new Date(),
        TransactionStatus.COMPLETED
      );

      await transactionalEntityManager.save(transaction);

      console.log(`Transaction created: ${JSON.stringify(transaction)}`);

      return {
        transaction,
        updatedBalances: {
          fromAccount: fromAccount.balance.toFixed(2),
          toAccount: toAccount.balance.toFixed(2),
        },
      };
    });
  }

  private getExchangeRate(
    fromCurrency: Currency,
    toCurrency: Currency
  ): number {
    if (fromCurrency === toCurrency) return 1;
    const key = `${fromCurrency}${toCurrency}` as keyof ExchangeRates;
    const rate = this.exchangeRates[key];
    if (!rate) {
      throw new Error(
        `Exchange rate not found for ${fromCurrency} to ${toCurrency}`
      );
    }
    return rate;
  }

  private async getAccountForUpdate(
    manager: EntityManager,
    accountId: string
  ): Promise<Account | null> {
    return manager.findOne(Account, {
      where: { id: accountId },
      lock: { mode: "pessimistic_write" },
    });
  }

  async deposit(
    accountId: string,
    amount: number,
    description: string
  ): Promise<Transaction> {
    const account = await this.getAccountById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    const newBalance = Number((Number(account.balance) + amount).toFixed(2));
    account.balance = newBalance;
    await this.accountHelper.update(account);

    const transaction = new Transaction(
      uuidv4(),
      TransactionType.DEPOSIT,
      amount,
      null,
      accountId,
      description,
      new Date(),
      TransactionStatus.COMPLETED
    );

    await this.transactionHelper.create(transaction);

    return transaction;
  }

  async withdraw(
    accountId: string,
    amount: number,
    description: string
  ): Promise<Transaction> {
    const account = await this.getAccountById(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    const currentBalance = Number(account.balance);
    if (currentBalance < amount) {
      throw new Error("Insufficient funds");
    }

    const todayTransactions =
      await this.transactionHelper.getTodayTransactionsAmount(accountId);
    if (todayTransactions + amount > account.dailyTransactionLimit) {
      throw new Error("Daily transaction limit exceeded");
    }

    const newBalance = Number((currentBalance - amount).toFixed(2));
    account.balance = newBalance;
    await this.accountHelper.update(account);

    const transaction = new Transaction(
      uuidv4(),
      TransactionType.WITHDRAWAL,
      amount,
      accountId,
      null,
      description,
      new Date(),
      TransactionStatus.COMPLETED
    );

    await this.transactionHelper.create(transaction);

    return transaction;
  }

  async applyMonthlyInterest(): Promise<void> {
    const savingsAccounts = await this.accountHelper.findByType(
      AccountType.SAVINGS
    );
    console.log(`Found ${savingsAccounts.length} savings accounts`);
    const currentDate = new Date();

    for (const account of savingsAccounts) {
      console.log(`Processing account ${account.id}`);
      console.log(
        `Initial balance: ${account.balance}, Average Daily Balance: ${account.averageDailyBalance}`
      );
      account.balance = Number(account.balance);
      account.averageDailyBalance = Number(account.averageDailyBalance);
      account.annualInterestRate = Number(account.annualInterestRate);
      const interest = account.calculateMonthlyInterest();
      console.log(`Calculated interest: ${interest}`);
      account.applyMonthlyInterest(currentDate);
      console.log(
        `Final balance: ${account.balance}, New Average Daily Balance: ${account.averageDailyBalance}`
      );
      await this.accountHelper.update(account);
    }
  }
}
