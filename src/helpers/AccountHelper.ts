import { DataSource } from "typeorm";
import { Account } from "../entities/Account";
import { BaseHelper } from "./BaseHelper";

export class AccountHelper extends BaseHelper {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async create(account: Account): Promise<Account> {
    return this.dataSource.getRepository(Account).save(account);
  }

  async findById(id: string): Promise<Account | null> {
    return this.dataSource.getRepository(Account).findOneBy({ id });
  }

  async findByUserId(userId: string): Promise<Account[]> {
    return this.dataSource.getRepository(Account).findBy({ userId });
  }

  async update(account: Account): Promise<Account> {
    return this.dataSource.getRepository(Account).save(account);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.getRepository(Account).delete(id);
  }
}
