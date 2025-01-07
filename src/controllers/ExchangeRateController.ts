import { Request, Response, Router } from "express";
import { ExchangeRateService } from "../services/ExchangeRateService";
import { Currency } from "../entities/Account";
import { RoleCheckMiddleware } from "../middlewares/RoleCheck";
import { UserRole } from "../entities/User";

export class ExchangeRateController {
  private roleCheck: RoleCheckMiddleware;

  constructor(private readonly exchangeRateService: ExchangeRateService) {
    this.roleCheck = new RoleCheckMiddleware();
  }

  registerRoutes(router: Router): void {
    router.get(
      "/api/exchange-rates",
      this.roleCheck.check([UserRole.ADMIN, UserRole.CLIENT]),
      this.getAllExchangeRates.bind(this)
    );
    router.get(
      "/api/exchange-rates/:fromCurrency/:toCurrency",
      this.roleCheck.check([UserRole.ADMIN, UserRole.CLIENT]),
      this.getExchangeRate.bind(this)
    );
    router.put(
      "/api/exchange-rates/:fromCurrency/:toCurrency",
      this.roleCheck.check([UserRole.ADMIN]),
      this.updateExchangeRate.bind(this)
    );
  }

  async getExchangeRate(req: Request, res: Response): Promise<void> {
    try {
      const { fromCurrency, toCurrency } = req.params;
      const rate = await this.exchangeRateService.getExchangeRate(
        fromCurrency as Currency,
        toCurrency as Currency
      );
      res.status(200).json({ rate });
    } catch (error) {
      console.error("Error getting exchange rate:", error);
      res
        .status(500)
        .json({
          message: "Error getting exchange rate",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }

  async updateExchangeRate(req: Request, res: Response): Promise<void> {
    try {
      const { fromCurrency, toCurrency } = req.params;
      const { rate } = req.body;
      await this.exchangeRateService.updateExchangeRate(
        fromCurrency as Currency,
        toCurrency as Currency,
        rate
      );
      res.status(200).json({ message: "Exchange rate updated successfully" });
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      res
        .status(500)
        .json({
          message: "Error updating exchange rate",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }

  async getAllExchangeRates(req: Request, res: Response): Promise<void> {
    try {
      const rates = await this.exchangeRateService.getAllExchangeRates();
      res.status(200).json(rates);
    } catch (error) {
      console.error("Error getting all exchange rates:", error);
      res
        .status(500)
        .json({
          message: "Error getting all exchange rates",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  }
}
