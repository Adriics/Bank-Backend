import { Request, Response } from "express";
import { CardService } from "../services/CardService";
import { CardType } from "../entities/Card";

export class CardController {
  constructor(private cardService: CardService) {}

  createCard = async (req: Request, res: Response) => {
    try {
      const { userId, accountId, type, creditLimit, currencyCode } = req.body;
      const card = await this.cardService.createCard(
        userId,
        accountId,
        type as CardType,
        currencyCode,
        creditLimit
      );
      res.status(201).json(card);
    } catch (error) {
      res
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "An error occurred while creating the card",
        });
    }
  };

  getCard = async (req: Request, res: Response) => {
    try {
      const card = await this.cardService.getCardById(req.params.id);
      if (card) {
        res.json(card);
      } else {
        res.status(404).json({ message: "Card not found" });
      }
    } catch (error) {
      res
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "An error occurred while fetching the card",
        });
    }
  };

  getCardsByUser = async (req: Request, res: Response) => {
    try {
      const cards = await this.cardService.getCardsByUserId(req.params.userId);
      res.json(cards);
    } catch (error) {
      res
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "An error occurred while fetching user cards",
        });
    }
  };

  makePayment = async (req: Request, res: Response) => {
    try {
      const { amount, description } = req.body;
      await this.cardService.makePayment(req.params.id, amount, description);
      res.json({ message: "Payment successful" });
    } catch (error) {
      res
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "An error occurred while making the payment",
        });
    }
  };

  payBalance = async (req: Request, res: Response) => {
    try {
      const { amount, currencyCode } = req.body;
      const result = await this.cardService.payBalance(
        req.params.id,
        amount,
        currencyCode
      );
      res.json(result);
    } catch (error) {
      res
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "An error occurred while paying the balance",
        });
    }
  };

  generateMonthlyStatement = async (req: Request, res: Response) => {
    try {
      const { currencyCode } = req.query;
      const statement = await this.cardService.generateMonthlyStatement(
        req.params.id,
        currencyCode as string
      );
      res.json(statement);
    } catch (error) {
      res
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "An error occurred while generating the monthly statement",
        });
    }
  };

  deleteCard = async (req: Request, res: Response) => {
    try {
      const { userId, userRole } = req.body; // Assuming these are passed in the request body
      await this.cardService.deleteCard(req.params.id, userId, userRole);
      res.json({ message: "Card deleted successfully" });
    } catch (error) {
      res
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "An error occurred while deleting the card",
        });
    }
  };

  addFunds = async (req: Request, res: Response) => {
    try {
      const { amount, description, currencyCode } = req.body;
      const transaction = await this.cardService.addFunds(
        req.params.id,
        amount,
        description,
        currencyCode
      );
      res.json(transaction);
    } catch (error) {
      res
        .status(400)
        .json({
          message:
            error instanceof Error
              ? error.message
              : "An error occurred while adding funds",
        });
    }
  };
}
