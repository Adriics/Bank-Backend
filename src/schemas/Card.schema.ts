import { EntitySchema } from "typeorm";
import { Card, CardType } from "../entities/Card";
import { Account } from "../entities/Account";

export const cardSchema = new EntitySchema<Card>({
  name: "Card",
  target: Card,
  columns: {
    id: {
      type: String,
      primary: true,
    },
    userId: {
      type: String,
    },
    accountId: {
      type: String,
    },
    type: {
      type: "enum",
      enum: CardType,
    },
    number: {
      type: String,
    },
    expirationDate: {
      type: Date,
    },
    cvv: {
      type: String,
    },
    creditLimit: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    balance: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
  },
  relations: {
    account: {
      type: "many-to-one",
      target: "Account",
      joinColumn: {
        name: "accountId",
        referencedColumnName: "id",
      },
    },
  },
});
