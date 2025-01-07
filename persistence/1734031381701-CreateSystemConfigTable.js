const { MigrationInterface, QueryRunner, Table } = require("typeorm");

module.exports = class CreateSystemConfigTable1734031381701 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: "system_config",
        columns: [
          {
            name: "id",
            type: "varchar",
            isPrimary: true,
          },
          {
            name: "globalInterestRate",
            type: "decimal",
            precision: 5,
            scale: 2,
          },
          {
            name: "dailyTransactionLimit",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
        ],
      }),
      true
    );

    // Insert default values
    await queryRunner.query(`
      INSERT INTO system_config (id, "globalInterestRate", "dailyTransactionLimit")
      VALUES ('1', 0.05, 1000)
    `);
  }

  async down(queryRunner) {
    await queryRunner.dropTable("system_config");
  }
};
