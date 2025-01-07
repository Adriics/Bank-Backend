import { EntitySchema } from "typeorm";
import { Currency } from "../entities/Account";

interface ExchangeRate {
  id: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  lastUpdated: Date;
}

export const exchangeRateSchema = new EntitySchema<ExchangeRate>({
  name: "ExchangeRate",
  columns: {
    id: {
      type: String,
      primary: true,
      generated: "uuid",
    },
    fromCurrency: {
      type: "enum",
      enum: Currency,
    },
    toCurrency: {
      type: "enum",
      enum: Currency,
    },
    rate: {
      type: "decimal",
      precision: 10,
      scale: 5,
    },
    lastUpdated: {
      type: Date,
    },
  },
});
