import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Account } from "./entities/Account";
import { AccountSchema } from "./schemas/Account.schema";
import { Card } from "./entities/Card";
import { TransactionSchema } from "./schemas/Transaction.schema";
import { Currency } from "./entities/Currency";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "bank_api",
  synchronize: true,
  logging: false,
  entities: [User, AccountSchema, Card, TransactionSchema, Currency],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
