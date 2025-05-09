import express, { Application, Request, Response, NextFunction } from "express";
import { PORT } from "./config";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routers/auth";
import { errorHandler } from "./middlewares/errorHandler";
import referralRoutes from "./routers/referral";

const app: Application = express();

const port = PORT;
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/referral", referralRoutes);
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the API!" });
});

// jalankan server
app.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});
