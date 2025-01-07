import { Request, Response } from "express";
import { SystemConfigService } from "../services/SystemConfigService";

export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  async updateGlobalInterestRate(req: Request, res: Response): Promise<void> {
    try {
      const { interestRate } = req.body;
      await this.systemConfigService.updateGlobalInterestRate(interestRate);
      res
        .status(200)
        .json({ message: "Global interest rate updated successfully" });
    } catch (error) {
      console.error("Error updating global interest rate:", error);
      res.status(500).json({
        message: "Error updating global interest rate",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async updateDailyTransactionLimit(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { limit } = req.body;
      await this.systemConfigService.updateDailyTransactionLimit(limit);
      res
        .status(200)
        .json({ message: "Daily transaction limit updated successfully" });
    } catch (error) {
      console.error("Error updating daily transaction limit:", error);
      res.status(500).json({
        message: "Error updating daily transaction limit",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getSystemConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await this.systemConfigService.getSystemConfig();
      res.status(200).json(config);
    } catch (error) {
      console.error("Error getting system config:", error);
      res.status(500).json({
        message: "Error getting system config",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
