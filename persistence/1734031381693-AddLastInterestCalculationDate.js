const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class AddLastInterestCalculationDate1734031381693 {
  name = "AddLastInterestCalculationDate1734031381693";

  async up(queryRunner) {
    // Add the column as nullable
    await queryRunner.query(
      `ALTER TABLE "account" ADD "lastInterestCalculationDate" TIMESTAMP`
    );

    // Update existing rows with the current timestamp
    await queryRunner.query(
      `UPDATE "account" SET "lastInterestCalculationDate" = CURRENT_TIMESTAMP`
    );

    // Alter the column to be NOT NULL
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "lastInterestCalculationDate" SET NOT NULL`
    );
  }

  async down(queryRunner) {
    // Revert the changes by dropping the column
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "lastInterestCalculationDate"`
    );
  }
};
