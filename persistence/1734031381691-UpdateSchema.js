const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class UpdateSchema1734031381691 {
  name = "UpdateSchema1734031381691";

  async up(queryRunner) {
    // Add your schema updates here
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "transaction" (
        "id" VARCHAR PRIMARY KEY,
        "type" VARCHAR NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "fromAccountId" VARCHAR,
        "toAccountId" VARCHAR,
        "description" VARCHAR,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner) {
    // Add your rollback logic here
    await queryRunner.query(`DROP TABLE IF EXISTS "transaction"`);
  }
};
