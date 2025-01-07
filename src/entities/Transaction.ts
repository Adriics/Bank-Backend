export enum TransactionType {
  PAYMENT = "PAYMENT",
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRANSFER = "TRANSFER",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export class Transaction {
  constructor(
    public id: string,
    public type: TransactionType,
    public amount: number,
    public sourceCardId: string | null,
    public destinationCardId: string | null,
    public description: string,
    public createdAt: Date,
    public status: TransactionStatus,
    public currency?: string
  ) {}
}
