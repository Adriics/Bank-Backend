import { Account } from "./Account";
import { Currency } from "./Currency";

const MAX_OVERPAYMENT = 500;

export enum CardType {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT",
}

export class Card {
  constructor(
    public id: string,
    public userId: string,
    public accountId: string,
    public type: CardType,
    public number: string,
    public expirationDate: Date,
    public cvv: string,
    public creditLimit: number | null,
    public balance: number | null,
    public lastInterestCalculationDate: Date,
    public monthlyInterestRate: number,
    public currency: Currency,
    public account?: Account
  ) {
    this.creditLimit = creditLimit !== undefined ? Number(creditLimit) : null;
    this.balance =
      balance !== undefined
        ? Number(balance)
        : this.type === CardType.CREDIT
        ? 0
        : null;
    this.lastInterestCalculationDate =
      lastInterestCalculationDate || new Date();
    this.monthlyInterestRate = monthlyInterestRate || 2; // Default to 2% monthly interest rate

    if (this.type === CardType.DEBIT) {
      this.creditLimit = null;
      this.balance = null;
    }

    this.validateCardState();
  }

  private validateCardState(): void {
    if (this.type === CardType.CREDIT) {
      if (this.creditLimit === null || this.balance === null) {
        throw new Error(
          "Credit card must have both creditLimit and balance defined"
        );
      }
      if (this.balance > this.creditLimit) {
        throw new Error("Balance cannot exceed credit limit");
      }
    }
  }

  calculateInterest(currentDate: Date): number {
    if (
      this.type === CardType.CREDIT &&
      this.balance !== null &&
      this.balance > 0 &&
      this.lastInterestCalculationDate
    ) {
      const daysSinceLastCalculation = Math.floor(
        (currentDate.getTime() - this.lastInterestCalculationDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const dailyInterestRate = this.monthlyInterestRate / 30; // Assuming 30 days in a month
      const interest =
        this.balance * (dailyInterestRate / 100) * daysSinceLastCalculation;
      return Number(interest.toFixed(2));
    }
    return 0;
  }

  applyPayment(amount: number): void {
    if (this.type === CardType.CREDIT && this.balance !== null) {
      const newBalance = Number((this.balance - amount).toFixed(2));
      if (newBalance < -MAX_OVERPAYMENT) {
        throw new Error(
          `El pago excede el límite de sobrepago permitido de ${MAX_OVERPAYMENT}`
        );
      }
      this.balance = newBalance;
    }
  }

  makeCharge(amount: number): void {
    if (
      this.type === CardType.CREDIT &&
      this.balance !== null &&
      this.creditLimit !== null
    ) {
      const newBalance = Number(this.balance) + Number(amount);
      if (newBalance > this.creditLimit) {
        throw new Error("Transaction would exceed credit limit");
      }
      this.balance = Number(newBalance.toFixed(2));
    }
    this.validateCardState();
  }

  applyInterest(currentDate: Date): void {
    if (
      this.type === CardType.CREDIT &&
      this.balance !== null &&
      this.balance > 0
    ) {
      const interest = this.calculateInterest(currentDate);
      this.balance = Number(this.balance) + Number(interest);
      this.balance = Number(this.balance.toFixed(2));
      this.lastInterestCalculationDate = currentDate;
    }
  }
}
