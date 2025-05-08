import express, { Application, Request, Response } from "express";
import { PORT } from "./config";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./routes/auth"

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (_, res: Response) => {
  res.status(200).json({ message: "Welcome to the API!" });
});

// jalankan server
app.listen(PORT || 8080, () => {
  console.log(`Server started on port http://localhost:${PORT || 8080}`);
});
