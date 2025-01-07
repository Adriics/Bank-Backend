import { DataSource, Between } from "typeorm";
import { Transaction } from "../entities/Transaction";
import { BaseHelper } from "./BaseHelper";

export class TransactionHelper extends BaseHelper {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async create(transaction: Transaction): Promise<Transaction> {
    return this.dataSource.getRepository(Transaction).save(transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.dataSource.getRepository(Transaction).findOneBy({ id });
  }

  async getCardTransactions(
    cardId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return this.dataSource.getRepository(Transaction).find({
      where: [
        { sourceCardId: cardId, createdAt: Between(startDate, endDate) },
        { destinationCardId: cardId, createdAt: Between(startDate, endDate) },
      ],
      order: {
        createdAt: "DESC",
      },
    });
  }
}
