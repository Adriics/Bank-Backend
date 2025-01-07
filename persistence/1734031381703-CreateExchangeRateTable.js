const { MigrationInterface, QueryRunner, Table } = require("typeorm");

const Currency = {
  EUR: "EUR",
  USD: "USD",
  GBP: "GBP",
  JPY: "JPY",
  AUD: "AUD",
};

module.exports = class CreateExchangeRateTable1734031381703 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: "exchange_rate",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "fromCurrency",
            type: "enum",
            enum: Object.values(Currency),
          },
          {
            name: "toCurrency",
            type: "enum",
            enum: Object.values(Currency),
          },
          {
            name: "rate",
            type: "decimal",
            precision: 10,
            scale: 5,
          },
          {
            name: "lastUpdated",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Insertar tasas de cambio iniciales
    await queryRunner.manager.insert("exchange_rate", [
      { fromCurrency: Currency.EUR, toCurrency: Currency.USD, rate: 1.1 },
      { fromCurrency: Currency.USD, toCurrency: Currency.EUR, rate: 1 / 1.1 },
      { fromCurrency: Currency.EUR, toCurrency: Currency.GBP, rate: 0.85 },
      { fromCurrency: Currency.GBP, toCurrency: Currency.EUR, rate: 1 / 0.85 },
      { fromCurrency: Currency.USD, toCurrency: Currency.GBP, rate: 0.75 },
      { fromCurrency: Currency.GBP, toCurrency: Currency.USD, rate: 1 / 0.75 },
    ]);
  }

  async down(queryRunner) {
    await queryRunner.dropTable("exchange_rate");
  }
};
