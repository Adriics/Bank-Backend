const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class AddTransactionStatus1734031381696 {
  name = "AddTransactionStatus1734031381696";

  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE "transaction" ADD "status" VARCHAR CHECK ("status" IN ('PENDING', 'COMPLETED', 'FAILED')) NOT NULL DEFAULT 'PENDING'
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE "transaction" DROP COLUMN "status"
    `);
  }
};
