import { DataSource } from "typeorm";
import { Card } from "../entities/Card";
import { BaseHelper } from "./BaseHelper";

export class CardHelper extends BaseHelper {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async create(card: Card): Promise<Card> {
    return this.dataSource.getRepository(Card).save(card);
  }

  async findById(id: string): Promise<Card | null> {
    return this.dataSource.getRepository(Card).findOneBy({ id });
  }

  async findByUserId(userId: string): Promise<Card[]> {
    return this.dataSource.getRepository(Card).findBy({ userId });
  }

  async update(card: Card): Promise<Card> {
    return this.dataSource.getRepository(Card).save(card);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.getRepository(Card).delete(id);
  }
}
