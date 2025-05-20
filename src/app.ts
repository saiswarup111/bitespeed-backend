import express from "express";
import identifyRouter from "./routes/identify.route";

const app = express();

app.use(express.json());
app.use("/", identifyRouter);

export default app;
