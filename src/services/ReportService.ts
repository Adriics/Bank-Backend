import { AccountHelper } from "../helpers/AccountHelper";
import { TransactionHelper } from "../helpers/TransactionHelper";
import { Transaction } from "../entities/Transaction";

export class ReportService {
  constructor(
    private readonly accountHelper: AccountHelper,
    private readonly transactionHelper: TransactionHelper
  ) {}

  async generateGlobalReport(): Promise<{
    totalAccounts: number;
    totalBalance: number;
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
  }> {
    const accounts = await this.accountHelper.findAll();
    const transactions = await this.transactionHelper.findAll();

    const totalAccounts = accounts.length;
    const totalBalance = accounts.reduce(
      (sum, account) => sum + Number(account.balance),
      0
    );
    const totalTransactions = transactions.length;
    const totalDeposits = transactions
      .filter((t) => t.type === "DEPOSIT")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalWithdrawals = transactions
      .filter((t) => t.type === "WITHDRAWAL")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalAccounts,
      totalBalance,
      totalTransactions,
      totalDeposits,
      totalWithdrawals,
    };
  }

  async getTransactionLogs(
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    return this.transactionHelper.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }
}
