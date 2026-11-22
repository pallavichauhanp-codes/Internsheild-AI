import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter
 * 150 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

/**
 * Sensitive endpoints Rate Limiter (Auth & Threat Scanner)
 * 40 requests per 15 minutes per IP to mitigate credential brute-force and API abuse
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit reached for security operations. Please wait 15 minutes before retrying.'
  }
});
