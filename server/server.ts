import express, { Application } from "express";
import "dotenv-flow/config";
import { setupSwagger } from "./swagger";
import cors from "cors";
import dotenv from "dotenv";
import {authRoutes} from "./routes/authRoutes"; // Import authentication routes
import dashboardRoutes from "./routes/dashboardRoutes"; // Import dashboard routes
import userRoutes from "./routes/userRoutes"; // Import user routes
import {mealRoutes} from "./routes/mealRoutes"; // Import meal routes
import trainingRoutes from "./routes/trainingRoutes"; // Import training routes
import chatGPTRouter from "./routes/chatgptRoutes"; // Import ChatGPT routes
import habitRoutes from "./routes/habitRoutes"; // Import habit routes
import userSettingRoute from "./routes/userSettingRoutes"; // Import user setting routes
import { CORS_ORIGINS, PORT as CFG_PORT, isProd, logEnvSummary } from "./config/env";


dotenv.config(); // Load environment variables from .env file

const app: Application = express();

/**
 * Setup Swagger UI na /api-docs
 */
setupSwagger(app);

/**
 * Apply middleware
 */
app.use(cors({
  origin(origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return cb(null, true);
    if (CORS_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
})); // Enable Cross-Origin Resource Sharing

app.use(express.json()); // Parse incoming JSON requests

/**
 * Define routes with prefixes
 */
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/dashboard", dashboardRoutes); // Dashboard routes
app.use("/api/user", userRoutes); // User routes
app.use("/api/meals", mealRoutes); // Meal routes
app.use("/api/trainings", trainingRoutes); // Training routes
app.use("/api/chat", chatGPTRouter); // ChatGPT routes
app.use("/api/habits", habitRoutes); // Habit routes
app.use("/api/userSetting", userSettingRoute); // User setting routes

const PORT = CFG_PORT;

/**
 * Start server
 */
app.listen(PORT, () => {
  logEnvSummary();
  console.log(`Server running on :${PORT} (${isProd ? "PROD" : "DEV"})`);
});
