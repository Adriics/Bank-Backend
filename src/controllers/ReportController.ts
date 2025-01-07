import { Request, Response } from "express";
import { ReportService } from "../services/ReportService";

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  async generateGlobalReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await this.reportService.generateGlobalReport();
      res.status(200).json(report);
    } catch (error) {
      console.error("Error generating global report:", error);
      res.status(500).json({
        message: "Error generating global report",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getTransactionLogs(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const logs = await this.reportService.getTransactionLogs(
        startDate as string,
        endDate as string
      );
      res.status(200).json(logs);
    } catch (error) {
      console.error("Error getting transaction logs:", error);
      res.status(500).json({
        message: "Error getting transaction logs",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
