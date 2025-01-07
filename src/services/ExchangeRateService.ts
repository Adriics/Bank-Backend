import { Currency } from "../entities/Currency";

export class ExchangeRateService {
  private exchangeRates: Map<string, number>;

  constructor(baseCurrency: string = "EUR") {
    this.exchangeRates = new Map();
    this.initializeExchangeRates(baseCurrency);
  }

  private initializeExchangeRates(baseCurrency: string): void {
    // Fixed exchange rates as specified
    this.exchangeRates.set("EUR", 1);
    this.exchangeRates.set("USD", 1.1);
    this.exchangeRates.set("GBP", 0.85);
    this.exchangeRates.set("JPY", 130);
    this.exchangeRates.set("AUD", 1.6);
  }

  getExchangeRate(fromCurrency: string, toCurrency: string): number {
    const fromRate = this.exchangeRates.get(fromCurrency);
    const toRate = this.exchangeRates.get(toCurrency);

    if (!fromRate || !toRate) {
      throw new Error("Invalid currency code");
    }

    return toRate / fromRate;
  }

  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    return Number((amount * rate).toFixed(2));
  }
}
