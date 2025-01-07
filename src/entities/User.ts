export enum UserRole {
  CLIENT = "client",
  ADMIN = "admin",
}

export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public surname: string,
    public role: UserRole,
    public isActive: boolean = true
  ) {}

  isClient(): boolean {
    return this.role === UserRole.CLIENT;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
