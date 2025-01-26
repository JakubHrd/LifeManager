import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth"; // ✅ Správný import
import dashboardRoutes from "./routes/dashboard"; // Import dashboardu
import userRoutes from "./routes/user";



dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

// ✅ Musí obsahovat prefix `/api/auth`
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/user", userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server běží na portu ${PORT}`));
