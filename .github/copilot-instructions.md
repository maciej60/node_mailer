# Email API Server - AI Agent Guide

## Architecture Overview

This is a minimal email service API built with Express. The architecture follows a **middleware-based request pipeline** with layered concerns:

```
Request → API Key Auth → Rate Limiter → Validation (Zod) → Mailer → Response
```

**Key principle**: Each component is independently testable and decoupled. Use specific modules rather than monolithic handlers.

## Core Modules

- **server.js** - Express app setup, routes, and error handling. Entry point.
- **mailer.js** - Nodemailer transporter configuration and template rendering with Handlebars.
- **validation.js** - Joi schemas for request validation (sendEmailSchema).
- **auth.js** - Simple header-based API key middleware (`x-api-key`).
- **rateLimiter.js** - Express-rate-limit configuration (100 reqs/15 min per IP).
- **logger.js** - Pino logger with pretty-print transport for development.
- **templates/** - Handlebars email templates (`.hbs` files with variable interpolation).

## Critical Workflows

### Starting the Server
```bash
npm start          # Single run
npm run dev        # Watch mode (--watch flag)
```

### Adding a New Email Template
1. Create `.hbs` file in `templates/` (e.g., `reset-password.hbs`)
2. Use Handlebars syntax: `{{variableName}}`
3. Pass variables via `sendTemplateEmail({ ..., variables: { variableName: "value" } })`

### Adding a New Endpoint
- Follow the `/send-email` pattern: middleware chain → async handler → try/catch with Zod error handling
- Always wrap Zod validation in try/catch; errors have `.name === "ZodError"` with `.errors` array

## Project-Specific Patterns

### Request Flow Pattern
Every endpoint uses: `apiKeyAuth` → `emailRateLimiter` → validation → handler → logger

```javascript
app.post("/send-email", apiKeyAuth, emailRateLimiter, async (req, res) => {
  try {
    const data = sendEmailSchema.parse(req.body);
    const info = await sendTemplateEmail(data);
    res.json({ message: "Email sent", messageId: info.messageId });
  } catch (error) {
    logger.error(error);
    // Handle ZodError specially (returns 400)
  }
});
```

### Error Handling Convention
- Zod validation errors → 400 with error details
- All other errors → 500 with generic message; details logged via `logger.error(error)`
- Always log errors before responding

### Environment Variables Required
- `API_KEY` - Header authentication key
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` - Nodemailer config
- `PORT` - Server port (defaults to 5000)

### Validation with Joi
Schemas are imported and used like: `sendEmailSchema.validate(data)`. Returns `{ error, value }`. When adding validations:
- Place schema definitions in `validation.js`
- Use `Joi.object()` for request bodies
- Use `.optional()` for non-required fields (e.g., variables in email requests)
- Check `error` before using `value`

## Common Tasks

**Modify rate limit**: Edit `rateLimiter.js` - change `max` or `windowMs` values.
**Change template rendering**: Edit `mailer.js` - template path logic and Handlebars compile step.
**Add validation rule**: Add schema to `validation.js`, import in `server.js`.
**Debug email sending**: Check `logger` output; Nodemailer errors logged before 500 response.

## Dependencies & Integration

- **Express 5.x** - Web framework
- **Nodemailer 7.x** - Email transport
- **Joi 17.x** - Schema validation with detailed errors
- **Handlebars 4.x** - Template rendering (not full Hbs templating, just variable interpolation)
- **Pino** - Structured logging with pretty-print for dev
- **CORS** - Enabled for all origins by default
- **express-rate-limit** - IP-based rate limiting
- **dotenv** - Environment variable loading

All modules use ES modules (`import`/`export`); `package.json` has `"type": "module"`.
