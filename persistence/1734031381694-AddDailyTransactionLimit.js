const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class AddDailyTransactionLimit1734031381694 {
  name = "AddDailyTransactionLimit1734031381694";

  async up(queryRunner) {
    // Add the column with a default value
    await queryRunner.query(
      `ALTER TABLE "account" ADD "dailyTransactionLimit" DECIMAL(10,2) DEFAULT 1000.00`
    );

    // Alter the column to be NOT NULL
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "dailyTransactionLimit" SET NOT NULL`
    );
  }

  async down(queryRunner) {
    // Revert the changes by dropping the column
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "dailyTransactionLimit"`
    );
  }
};
