import { createHmac } from "crypto";
import { User, UserRole } from "../entities/User";
import { UserHelper } from "../helpers/UserHelper";
import { UserNotFound } from "../errors/UserNotFound";
import jwt from "jsonwebtoken";
import { AccountHelper } from "../helpers/AccountHelper";
import { v4 as uuidv4 } from "uuid";

export class UserService {
  constructor(
    private readonly userHelper: UserHelper,
    private readonly accountHelper: AccountHelper
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userHelper.findById(id);
    if (!user) throw new UserNotFound(`An user with id ${id} was not found`);
    return user;
  }

  async login(email: string, password: string): Promise<string> {
    console.log(`Iniciando proceso de login para email: ${email}`);

    const user = await this.userHelper.findByEmail(email);
    if (!user) {
      console.log(`No se encontró usuario para el email: ${email}`);
      throw new UserNotFound(`Usuario no encontrado con el email ${email}`);
    }

    const hashGenerator = createHmac("sha-512", "salt");
    const hashedPassword = hashGenerator.update(password).digest("hex");
    console.log(`Contraseña proporcionada hasheada: ${hashedPassword}`);
    console.log(`Contraseña almacenada en la base de datos: ${user.password}`);

    if (user.password !== hashedPassword) {
      console.log(`Contraseña incorrecta para el email: ${email}`);
      throw new UserNotFound(`Credenciales inválidas para el email ${email}`);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "tu_clave_secreta_aqui",
      { expiresIn: "1h" }
    );

    return token;
  }

  async register(
    name: string,
    email: string,
    password: string,
    surname: string,
    role: UserRole = UserRole.CLIENT
  ): Promise<User> {
    const hashGenerator = createHmac("sha-512", "salt");
    const hashedPassword = hashGenerator.update(password).digest("hex");
    console.log(`Contraseña hasheada para registro: ${hashedPassword}`);

    const id = uuidv4(); // Generamos un ID único automáticamente
    const user = new User(id, name, email, hashedPassword, surname, role);
    await this.userHelper.create(user);
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userHelper.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const userAccounts = await this.accountHelper.findByUserId(userId);
    if (userAccounts.length > 0) {
      throw new Error(
        "No se puede eliminar el usuario porque tiene cuentas asociadas"
      );
    }

    await this.userHelper.delete(userId);
  }

  async updateUser(
    id: string,
    updateData: {
      name?: string;
      surname?: string;
      email?: string;
      role?: UserRole;
    }
  ): Promise<User> {
    const user = await this.userHelper.findById(id);
    if (!user) {
      throw new UserNotFound(`Usuario con id ${id} no encontrado`);
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.surname) user.surname = updateData.surname;
    if (updateData.email) {
      const existingUserWithEmail = await this.userHelper.findByEmail(
        updateData.email
      );
      if (existingUserWithEmail && existingUserWithEmail.id !== id) {
        throw new Error("El email ya está en uso por otro usuario");
      }
      user.email = updateData.email;
    }
    if (updateData.role) user.role = updateData.role;

    await this.userHelper.update(user);
    return user;
  }

  async deactivateUser(id: string): Promise<void> {
    const user = await this.userHelper.findById(id);
    if (!user) {
      throw new UserNotFound(`Usuario con id ${id} no encontrado`);
    }

    user.isActive = false;
    await this.userHelper.update(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userHelper.findAll();
  }
}
