import { EntitySchema, Repository } from "typeorm";
import dataSource from "../dataSourceServer";

interface SystemConfig {
  id: string;
  globalInterestRate: number;
  dailyTransactionLimit: number;
}

const systemConfigSchema = new EntitySchema<SystemConfig>({
  name: "SystemConfig",
  columns: {
    id: {
      type: String,
      primary: true,
    },
    globalInterestRate: {
      type: "decimal",
      precision: 5,
      scale: 2,
    },
    dailyTransactionLimit: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
  },
});

export class SystemConfigHelper {
  private repository: Repository<SystemConfig> | null = null;

  constructor() {
    this.initRepository();
  }

  private async initRepository(): Promise<void> {
    if (!this.repository) {
      const ds = await dataSource;
      this.repository = ds.getRepository(systemConfigSchema);
    }
  }

  private async getRepository(): Promise<Repository<SystemConfig>> {
    if (!this.repository) {
      await this.initRepository();
    }
    return this.repository!;
  }

  async getSystemConfig(): Promise<SystemConfig> {
    const repo = await this.getRepository();
    let config = await repo.findOne({ where: {} });
    if (!config) {
      config = await this.createDefaultConfig();
    }
    return config;
  }

  private async createDefaultConfig(): Promise<SystemConfig> {
    const repo = await this.getRepository();
    const defaultConfig: SystemConfig = {
      id: "1",
      globalInterestRate: 0.05,
      dailyTransactionLimit: 1000,
    };
    return repo.save(defaultConfig);
  }

  async updateGlobalInterestRate(interestRate: number): Promise<void> {
    const repo = await this.getRepository();
    let config = await this.getSystemConfig();
    config.globalInterestRate = interestRate;
    await repo.save(config);
  }

  async updateDailyTransactionLimit(limit: number): Promise<void> {
    const repo = await this.getRepository();
    let config = await this.getSystemConfig();
    config.dailyTransactionLimit = limit;
    await repo.save(config);
  }
}
