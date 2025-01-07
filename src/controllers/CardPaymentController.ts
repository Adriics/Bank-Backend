import { Request, Response } from "express";
import { CardService } from "../services/CardService";

export class CardPaymentController {
  constructor(private readonly cardService: CardService) {}

  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { cardNumber, amount, description } = req.body;

      if (
        typeof cardNumber !== "string" ||
        typeof amount !== "number" ||
        typeof description !== "string"
      ) {
        res.status(400).json({ message: "Invalid input data" });
        return;
      }

      const transaction = await this.cardService.processPayment(
        cardNumber,
        amount,
        description
      );

      res.status(201).json({
        message: "Payment processed successfully",
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.createdAt,
        },
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res
        .status(500)
        .json({
          message: "Error processing payment",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }
}
