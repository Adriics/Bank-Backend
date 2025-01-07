const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class Migrations1734031381690 {
  name = "Migrations1734031381690";

  async up(queryRunner) {
    // Existing migrations
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "roleId" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_user_role" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL`
    );

    // New migration for annualInterestRate
    await queryRunner.query(
      `ALTER TABLE "account" ADD "annualInterestRate" numeric(5,2)`
    );
    await queryRunner.query(`UPDATE "account" SET "annualInterestRate" = 0.00`);
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "annualInterestRate" SET NOT NULL`
    );

    // New migration for lastInterestCalculationDate
    await queryRunner.query(
      `ALTER TABLE "account" ADD "lastInterestCalculationDate" TIMESTAMP`
    );
    await queryRunner.query(
      `UPDATE "account" SET "lastInterestCalculationDate" = CURRENT_TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "lastInterestCalculationDate" SET NOT NULL`
    );

    // New migration for Transaction table
    await queryRunner.query(`
      CREATE TABLE "transaction" (
        "id" VARCHAR PRIMARY KEY,
        "type" VARCHAR NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "fromAccountId" VARCHAR,
        "toAccountId" VARCHAR,
        "description" VARCHAR,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Add foreign key constraints for Transaction table
    await queryRunner.query(`
      ALTER TABLE "transaction" 
      ADD CONSTRAINT "FK_transaction_fromAccount" 
      FOREIGN KEY ("fromAccountId") REFERENCES "account"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "transaction" 
      ADD CONSTRAINT "FK_transaction_toAccount" 
      FOREIGN KEY ("toAccountId") REFERENCES "account"("id") ON DELETE SET NULL
    `);
  }

  async down(queryRunner) {
    // Reverting Transaction table
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_transaction_toAccount"`
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_transaction_fromAccount"`
    );
    await queryRunner.query(`DROP TABLE "transaction"`);

    // Reverting new migrations
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "lastInterestCalculationDate"`
    );
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "annualInterestRate"`
    );

    // Existing down migrations
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_role"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "roleId"`);
  }
};
