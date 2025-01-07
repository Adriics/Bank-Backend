import { SystemConfigHelper } from "../helpers/SystemConfigHelper";

export class SystemConfigService {
  constructor(private readonly systemConfigHelper: SystemConfigHelper) {}

  async updateGlobalInterestRate(interestRate: number): Promise<void> {
    await this.systemConfigHelper.updateGlobalInterestRate(interestRate);
  }

  async updateDailyTransactionLimit(limit: number): Promise<void> {
    await this.systemConfigHelper.updateDailyTransactionLimit(limit);
  }

  async getSystemConfig(): Promise<{
    globalInterestRate: number;
    dailyTransactionLimit: number;
  }> {
    return this.systemConfigHelper.getSystemConfig();
  }
}
