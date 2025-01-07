import { Currency } from "./Currency";
import { User } from "./User";

export enum AccountType {
  SAVINGS = "SAVINGS",
  CURRENT = "CURRENT",
}

export class Account {
  constructor(
    public id: string,
    public userId: string,
    public type: AccountType,
    public balance: number,
    public currency: Currency,
    public createdAt: Date,
    public user?: User
  ) {}
}
