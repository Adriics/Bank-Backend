const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class AddCardTable1734031381697 {
  name = "AddCardTable1734031381697";

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE "card" (
        "id" VARCHAR PRIMARY KEY,
        "userId" VARCHAR NOT NULL,
        "accountId" VARCHAR NOT NULL,
        "type" VARCHAR CHECK ("type" IN ('DEBIT', 'CREDIT')) NOT NULL,
        "number" VARCHAR NOT NULL,
        "expirationDate" TIMESTAMP NOT NULL,
        "cvv" VARCHAR NOT NULL,
        "creditLimit" DECIMAL(10,2),
        "balance" DECIMAL(10,2),
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
        FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "card"`);
  }
};
