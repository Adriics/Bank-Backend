import { Currency } from "../entities/Currency";

export class CurrencyService {
  private currencies: Map<string, Currency>;

  constructor() {
    this.currencies = new Map();
    this.initializeCurrencies();
  }

  private initializeCurrencies(): void {
    this.addCurrency(new Currency("EUR", "Euro", 1));
    this.addCurrency(new Currency("USD", "US Dollar", 1.1));
    this.addCurrency(new Currency("GBP", "British Pound", 0.85));
    this.addCurrency(new Currency("JPY", "Japanese Yen", 130));
    this.addCurrency(new Currency("AUD", "Australian Dollar", 1.6));
  }

  addCurrency(currency: Currency): void {
    this.currencies.set(currency.code, currency);
  }

  getCurrency(code: string): Currency | undefined {
    return this.currencies.get(code);
  }

  convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number {
    const from = this.getCurrency(fromCurrency);
    const to = this.getCurrency(toCurrency);

    if (!from || !to) {
      throw new Error("Invalid currency code");
    }

    const amountInEUR = amount / from.exchangeRate;
    return Number((amountInEUR * to.exchangeRate).toFixed(2));
  }
}
