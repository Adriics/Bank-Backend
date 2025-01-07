import { Router } from "express";
import { InterestCalculationController } from "../controllers/InterestCalculationController";
import { check as authMiddleware } from "../middlewares/Auth";

export function registerInterestCalculationRoute(router: Router): void {
  const interestCalculationController = new InterestCalculationController();

  router.post("/api/calculate-interest", authMiddleware, (req, res) =>
    interestCalculationController.calculateInterest(req, res)
  );
}
