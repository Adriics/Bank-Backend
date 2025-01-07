import { DataSource, EntitySchema } from "typeorm";

export abstract class IHelper<T extends any> {
  protected abstract schema: EntitySchema<T>;
  protected abstract connection: Promise<DataSource>;
}
