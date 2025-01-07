import { DataSource } from "typeorm";

export class BaseHelper {
  protected dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }
}
