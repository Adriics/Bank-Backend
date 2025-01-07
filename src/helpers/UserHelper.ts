import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { BaseHelper } from "./BaseHelper";

export class UserHelper extends BaseHelper {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async create(user: User): Promise<User> {
    return this.dataSource.getRepository(User).save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.dataSource.getRepository(User).findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.dataSource.getRepository(User).findOneBy({ email });
  }

  async update(user: User): Promise<User> {
    return this.dataSource.getRepository(User).save(user);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.getRepository(User).delete(id);
  }

  async findAll(): Promise<User[]> {
    return this.dataSource.getRepository(User).find();
  }
}
