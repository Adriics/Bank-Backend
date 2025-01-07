import { Request, Response } from "express";

export class InterestCalculationController {
  calculateInterest(req: Request, res: Response): void {
    try {
      const { balance, annualInterestRate, months } = req.body;

      if (
        balance === undefined ||
        annualInterestRate === undefined ||
        months === undefined
      ) {
        res.status(400).json({ message: "Faltan parámetros requeridos" });
        return;
      }

      const initialBalance = Number(balance);
      const rate = Number(annualInterestRate) / 100; // Convert percentage to decimal
      const monthlyRate = rate / 12;
      let currentBalance = initialBalance;

      console.log(
        `Calculando interés para: balance inicial=${initialBalance}, tasa anual=${annualInterestRate}%, meses=${months}`
      );

      for (let i = 0; i < months; i++) {
        const interest = currentBalance * monthlyRate;
        currentBalance += interest;
        console.log(
          `Mes ${i + 1}: Interés=${interest.toFixed(
            2
          )}, Nuevo balance=${currentBalance.toFixed(2)}`
        );
      }

      const totalInterest = currentBalance - initialBalance;

      res.json({
        initialBalance: initialBalance.toFixed(2),
        finalBalance: currentBalance.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        monthsCalculated: months,
      });
    } catch (error) {
      console.error("Error al calcular el interés:", error);
      res
        .status(500)
        .json({
          message: "Error al calcular el interés",
          error: (error as Error).message,
        });
    }
  }
}
