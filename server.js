import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./logger.js";
import { emailRateLimiter } from "./rateLimiter.js";
import { apiKeyAuth } from "./auth.js";
import { sendEmailSchema } from "./validation.js";
import { sendTemplateEmail } from "./mailer.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Email API running" });
});

// Send email endpoint
app.post(
  "/send-email",
  apiKeyAuth,
  emailRateLimiter,
  async (req, res) => {
    try {
      const { error, value } = sendEmailSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.details.map(d => ({ field: d.path.join("."), message: d.message })),
        });
      }

      const info = await sendTemplateEmail(value);

      res.json({
        message: "Email sent",
        messageId: info.messageId,
      });
    } catch (error) {
      logger.error(error);
      console.log(error)
      res.status(500).json({
        error: "Failed to send email: " + error.message,
      });
    }
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
