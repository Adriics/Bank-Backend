import express from "express";
import { registerUserRoutes } from "./userRoutes";
import { registerAccountRoutes } from "./accountRoutes";
import { registerCardRoutes } from "./cardRoutes";
import { registerTransactionRoutes } from "./transactionRoutes";
import dataSource from "../dataSourceConfig";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Register routes
registerUserRoutes(app);
registerAccountRoutes(app);
registerCardRoutes(app);
registerTransactionRoutes(app);

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  }
);

// Start the Express server
dataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error: Error) => {
    console.error("Error during Data Source initialization:", error);
  });

export default app;
