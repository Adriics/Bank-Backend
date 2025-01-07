import { EntitySchema } from "typeorm";
import { User, UserRole } from "../entities/User";

export const userSchema = new EntitySchema<User>({
  name: "User",
  target: User,
  columns: {
    id: {
      type: String,
      primary: true,
      generated: "uuid",
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    surname: {
      type: String,
    },
    role: {
      type: "enum",
      enum: UserRole,
      default: UserRole.CLIENT,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
});
