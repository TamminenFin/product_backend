import express, { Request, Response } from "express";
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import globalErrorHandler from "./app/middlewares/globalErrorhandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://www.lastiendas.pe"],
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
