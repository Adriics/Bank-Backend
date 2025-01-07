import { EntitySchema } from "typeorm";
import { Account, AccountType } from "../entities/Account";
import { Currency } from "../entities/Currency";

export const AccountSchema = new EntitySchema<Account>({
  name: "Account",
  target: Account,
  columns: {
    id: {
      type: String,
      primary: true,
      generated: "uuid",
    },
    userId: {
      type: String,
    },
    type: {
      type: String,
      enum: AccountType,
    },
    balance: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      createDate: true,
    },
  },
  relations: {
    currency: {
      type: "many-to-one",
      target: "Currency",
      joinColumn: true,
      eager: true,
    },
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
    },
  },
});
