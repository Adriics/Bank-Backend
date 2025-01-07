import { v4 as uuidv4 } from "uuid";
import { Card, CardType } from "../entities/Card";
import { CardHelper } from "../helpers/CardHelper";
import { AccountService } from "./AccountService";
import { AccountType } from "../entities/Account";
import { TransactionHelper } from "../helpers/TransactionHelper";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../entities/Transaction";
import { UserService } from "./UserService";
import { UserRole } from "../entities/User";
import { CurrencyService } from "./CurrencyService";
import { Currency } from "../entities/Currency";

const MAX_OVERPAYMENT = 500;

export class CardService {
  constructor(
    private readonly cardHelper: CardHelper,
    private readonly accountService: AccountService,
    private readonly transactionHelper: TransactionHelper,
    private readonly userService: UserService,
    private readonly currencyService: CurrencyService
  ) {}

  async createCard(
    userId: string,
    accountId: string,
    type: CardType,
    currencyCode: string,
    creditLimit?: number | null,
    monthlyInterestRate?: number
  ): Promise<Card> {
    console.log(
      `CardService.createCard: userId=${userId}, accountId=${accountId}, type=${type}, currencyCode=${currencyCode}, creditLimit=${creditLimit}, monthlyInterestRate=${monthlyInterestRate}`
    );

    if (!userId) {
      throw new Error("userId es requerido");
    }

    if (!accountId) {
      throw new Error("accountId es requerido");
    }

    const account = await this.accountService.getAccountById(accountId);
    if (!account) {
      throw new Error("Cuenta no encontrada");
    }

    if (account.userId !== userId) {
      const creator = await this.userService.getUserById(userId);
      if (creator.role !== UserRole.ADMIN) {
        throw new Error(
          "La cuenta no pertenece al usuario y no tienes permisos de administrador"
        );
      }
    }

    if (type === CardType.DEBIT && account.type !== AccountType.CURRENT) {
      throw new Error(
        "Las tarjetas de débito solo pueden estar vinculadas a cuentas corrientes"
      );
    }

    if (
      type === CardType.CREDIT &&
      (creditLimit === undefined ||
        creditLimit === null ||
        isNaN(Number(creditLimit)) ||
        Number(creditLimit) <= 0)
    ) {
      throw new Error(
        "Se requiere un límite de crédito válido para tarjetas de crédito"
      );
    }

    const currency = this.currencyService.getCurrency(currencyCode);
    if (!currency) {
      throw new Error("Moneda no válida");
    }

    const card = new Card(
      uuidv4(),
      userId,
      accountId,
      type,
      this.generateCardNumber(),
      this.generateExpirationDate(),
      this.generateCVV(),
      type === CardType.CREDIT ? Number(creditLimit) : null,
      type === CardType.CREDIT ? 0 : null,
      new Date(),
      monthlyInterestRate || 2,
      currency,
      account
    );

    console.log(`Objeto de tarjeta creado:`, JSON.stringify(card, null, 2));

    try {
      await this.cardHelper.create(card);
      return card;
    } catch (error) {
      console.error(
        `Error al crear la tarjeta: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error instanceof Error
        ? error
        : new Error("Unknown error occurred while creating the card");
    }
  }

  async getCardById(id: string): Promise<Card | null> {
    return this.cardHelper.findById(id);
  }

  async getCardsByUserId(userId: string): Promise<Card[]> {
    return this.cardHelper.findByUserId(userId);
  }

  async makePayment(
    cardId: string,
    amount: number,
    description: string
  ): Promise<void> {
    console.log(
      `Starting payment with card: cardId=${cardId}, amount=${amount}, description=${description}`
    );

    const card = await this.cardHelper.findById(cardId);
    if (!card) {
      console.error(`Card not found: cardId=${cardId}`);
      throw new Error("Card not found");
    }

    console.log(`Card found: ${JSON.stringify(card)}`);

    let transactionType: TransactionType;
    if (card.type === CardType.DEBIT) {
      transactionType = TransactionType.WITHDRAWAL;
    } else if (card.type === CardType.CREDIT) {
      transactionType = TransactionType.PAYMENT;
    } else {
      throw new Error("Invalid card type");
    }

    if (card.type === CardType.DEBIT) {
      const account = await this.accountService.getAccountById(card.accountId);
      if (!account) {
        console.error(
          `Associated account not found: accountId=${card.accountId}`
        );
        throw new Error("Associated account not found");
      }
      if (account.balance < amount) {
        console.error(
          `Insufficient funds: balance=${account.balance}, amount=${amount}`
        );
        throw new Error("Insufficient funds");
      }
      await this.accountService.updateBalance(
        card.accountId,
        Number(account.balance) - Number(amount)
      );
      console.log(
        `Payment made with debit card: newBalance=${
          Number(account.balance) - Number(amount)
        }`
      );
    } else if (card.type === CardType.CREDIT) {
      try {
        if (card.balance === null || card.creditLimit === null) {
          throw new Error(
            "Invalid card state: balance or credit limit is null"
          );
        }
        const newBalance = Number(card.balance) + Number(amount);
        if (newBalance > card.creditLimit) {
          throw new Error("Transaction would exceed credit limit");
        }
        card.makeCharge(Number(amount));
        await this.cardHelper.update(card);
        console.log(
          `Payment made with credit card: new balance=${card.balance}`
        );
      } catch (error) {
        console.error(
          `Error making payment with credit card: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        throw error instanceof Error
          ? error
          : new Error("Unknown error occurred while making payment");
      }
    } else {
      throw new Error("Invalid card type");
    }

    const transaction = new Transaction(
      uuidv4(),
      transactionType,
      Number(amount),
      card.id,
      null,
      description,
      new Date(),
      TransactionStatus.COMPLETED
    );
    await this.transactionHelper.create(transaction);
    console.log(`Transaction created: ${JSON.stringify(transaction)}`);
  }

  async payBalance(
    cardId: string,
    amount: number,
    currencyCode: string
  ): Promise<{ message: string; overpayment?: number }> {
    const card = await this.getCardById(cardId);
    if (!card || card.type !== CardType.CREDIT || card.balance === null) {
      throw new Error("Invalid card for balance payment");
    }

    try {
      const amountInCardCurrency = this.currencyService.convertAmount(
        amount,
        currencyCode,
        card.currency.code
      );
      const currentBalance = Number(card.balance);
      let paymentToApply = amountInCardCurrency;
      let overpayment = 0;

      if (amountInCardCurrency > currentBalance) {
        paymentToApply = currentBalance;
        overpayment = Number(
          (amountInCardCurrency - currentBalance).toFixed(2)
        );
      }

      card.applyPayment(paymentToApply);
      await this.cardHelper.update(card);

      const transaction = new Transaction(
        uuidv4(),
        TransactionType.DEPOSIT,
        amountInCardCurrency,
        null,
        card.id,
        "Card balance payment",
        new Date(),
        TransactionStatus.COMPLETED
      );
      await this.transactionHelper.create(transaction);

      let message = `Payment of ${paymentToApply.toFixed(2)} ${
        card.currency.code
      } applied successfully.`;
      if (overpayment > 0) {
        message += ` Overpayment of ${overpayment.toFixed(2)} ${
          card.currency.code
        } will be returned to your account.`;
        await this.handleOverpayment(card.userId, overpayment);
      }

      return {
        message,
        overpayment: overpayment > 0 ? overpayment : undefined,
      };
    } catch (error) {
      console.error(
        `Error al pagar el saldo de la tarjeta: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error instanceof Error
        ? error
        : new Error("Unknown error occurred while paying balance");
    }
  }

  private async handleOverpayment(
    userId: string,
    amount: number
  ): Promise<void> {
    console.log(
      `Procesando sobrepago de ${amount.toFixed(2)} para el usuario ${userId}.`
    );
    console.log(
      `Sobrepago de ${amount.toFixed(
        2
      )} ha sido devuelto a la cuenta del usuario ${userId}.`
    );
  }

  async generateMonthlyStatement(
    cardId: string,
    currencyCode: string
  ): Promise<any> {
    const card = await this.getCardById(cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    if (card.type !== CardType.CREDIT) {
      throw new Error("Monthly statements are only available for credit cards");
    }

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    console.log(
      `Generating statement for card ${cardId} from ${firstDayOfMonth} to ${lastDayOfMonth}`
    );

    const transactions = await this.transactionHelper.getCardTransactions(
      card.id,
      firstDayOfMonth,
      lastDayOfMonth
    );
    console.log(`Transactions found: ${transactions.length}`);

    let totalCharges = 0;
    let totalPayments = 0;

    const transactionDetails = transactions.map((t) => {
      console.log(`Processing transaction: ${JSON.stringify(t)}`);
      const amount = this.currencyService.convertAmount(
        Number(t.amount),
        card.currency.code,
        currencyCode
      );
      if (t.type === TransactionType.PAYMENT) {
        totalCharges += amount;
        return {
          date: t.createdAt,
          description: t.description,
          amount: amount,
          type: "Charge",
        };
      } else if (t.type === TransactionType.DEPOSIT) {
        totalPayments += amount;
        return {
          date: t.createdAt,
          description: t.description,
          amount: amount,
          type: "Payment",
        };
      } else {
        console.warn(`Unknown transaction type: ${t.type}`);
        return {
          date: t.createdAt,
          description: t.description,
          amount: amount,
          type: "Other",
        };
      }
    });

    const previousBalance = this.currencyService.convertAmount(
      Number(card.balance ?? 0),
      card.currency.code,
      currencyCode
    );
    let newBalance = Number(previousBalance) + totalCharges - totalPayments;

    let interest = this.currencyService.convertAmount(
      card.calculateInterest(lastDayOfMonth),
      card.currency.code,
      currencyCode
    );
    if (newBalance > 0) {
      newBalance += interest;
      card.applyInterest(lastDayOfMonth);
      await this.cardHelper.update(card);
    }

    newBalance = Number(newBalance.toFixed(2));

    console.log(
      `Statement generated: totalCharges=${totalCharges}, totalPayments=${totalPayments}, newBalance=${newBalance}, interest=${interest}`
    );

    let overpaymentCredit = 0;
    if (newBalance < 0) {
      overpaymentCredit = Math.abs(newBalance);
      newBalance = 0;
    }

    return {
      cardNumber: card.number,
      statementPeriod: {
        from: firstDayOfMonth,
        to: lastDayOfMonth,
      },
      transactions: transactionDetails,
      summary: {
        previousBalance: Number(previousBalance).toFixed(2),
        totalCharges: Number(totalCharges).toFixed(2),
        totalPayments: Number(totalPayments).toFixed(2),
        interest: Number(interest).toFixed(2),
        newBalance: Number(newBalance).toFixed(2),
        overpaymentCredit: Number(overpaymentCredit).toFixed(2),
      },
      creditLimit: this.currencyService
        .convertAmount(
          Number(card.creditLimit),
          card.currency.code,
          currencyCode
        )
        .toFixed(2),
      availableCredit: (
        this.currencyService.convertAmount(
          Number(card.creditLimit),
          card.currency.code,
          currencyCode
        ) - newBalance
      ).toFixed(2),
      currency: currencyCode,
    };
  }

  async deleteCard(
    cardId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    console.log(
      `Iniciando eliminación de tarjeta: cardId=${cardId}, userId=${userId}, userRole=${userRole}`
    );

    const card = await this.cardHelper.findById(cardId);
    if (!card) {
      console.error(`Tarjeta no encontrada: cardId=${cardId}`);
      throw new Error("Card not found");
    }

    if (card.userId !== userId && userRole !== UserRole.ADMIN) {
      console.error(
        `Usuario no autorizado para eliminar la tarjeta: userId=${userId}, cardUserId=${card.userId}`
      );
      throw new Error("Unauthorized to delete this card");
    }

    if (card.type === CardType.CREDIT && card.balance && card.balance > 0) {
      console.error(
        `No se puede eliminar tarjeta de crédito con balance pendiente: cardId=${cardId}, balance=${card.balance}`
      );
      throw new Error("Cannot delete credit card with outstanding balance");
    }

    try {
      await this.cardHelper.delete(cardId);
      console.log(`Tarjeta eliminada exitosamente: cardId=${cardId}`);
    } catch (error) {
      console.error(
        `Error al eliminar la tarjeta: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error instanceof Error
        ? error
        : new Error("Unknown error occurred while deleting the card");
    }
  }

  async addFunds(
    cardId: string,
    amount: number,
    description: string,
    currencyCode: string
  ): Promise<Transaction> {
    const card = await this.cardHelper.findById(cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    const amountInCardCurrency = this.currencyService.convertAmount(
      amount,
      currencyCode,
      card.currency.code
    );

    if (card.type === CardType.CREDIT) {
      if (card.balance === null) {
        throw new Error("Invalid card balance");
      }
      card.balance = Number(
        (Number(card.balance) - amountInCardCurrency).toFixed(2)
      );
      await this.cardHelper.update(card);
    } else if (card.type === CardType.DEBIT) {
      const account = await this.accountService.getAccountById(card.accountId);
      if (!account) {
        throw new Error("Associated account not found");
      }
      await this.accountService.updateBalance(
        card.accountId,
        Number(account.balance) + amountInCardCurrency
      );
    }

    const transaction = new Transaction(
      uuidv4(),
      TransactionType.DEPOSIT,
      amountInCardCurrency,
      null,
      card.accountId,
      description,
      new Date(),
      TransactionStatus.COMPLETED
    );

    await this.transactionHelper.create(transaction);
    return transaction;
  }

  private generateCardNumber(): string {
    const prefix = "4";
    const randomPart = Math.floor(Math.random() * 1000000000000000)
      .toString()
      .padStart(15, "0");
    return prefix + randomPart;
  }

  private generateExpirationDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    return date;
  }

  private generateCVV(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }
}
