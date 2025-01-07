import { EntitySchema } from "typeorm";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../entities/Transaction";

export const TransactionSchema = new EntitySchema<Transaction>({
  name: "Transaction",
  target: Transaction,
  columns: {
    id: {
      type: String,
      primary: true,
      generated: "uuid",
    },
    type: {
      type: String,
      enum: TransactionType,
    },
    amount: {
      type: Number,
    },
    sourceCardId: {
      type: String,
      nullable: true,
    },
    destinationCardId: {
      type: String,
      nullable: true,
    },
    description: {
      type: String,
    },
    createdAt: {
      type: Date,
      createDate: true,
    },
    status: {
      type: String,
      enum: TransactionStatus,
    },
    currency: {
      type: String,
      nullable: true,
    },
  },
});
