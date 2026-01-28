import rateLimit from "express-rate-limit";

export const emailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  message: {
    error: "Too many requests, please try again later",
  },
});
