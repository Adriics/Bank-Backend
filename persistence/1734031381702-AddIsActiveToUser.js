const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class AddIsActiveToUser1734031381702 {
  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE "user" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "isActive"
    `);
  }
};
