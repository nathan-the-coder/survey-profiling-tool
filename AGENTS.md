# AGENTS.md - Development Guidelines

## Project Overview

This is a Node.js/Express 5.x web application using EJS templates for server-side rendering. It supports both MySQL (development) and Supabase (production) databases. The app serves a family profiling survey tool with role-based access (parish, archdiocese, admin).

## Build & Run Commands

### Installation
```bash
npm install
```

### Development
```bash
npm start
```
Runs `node ./bin/www` - starts the Express server on port 3000 (or PORT env var).

### Linting & Code Quality

This project uses Biome for linting. Run with:
```bash
npx biome check .
npx biome check --write .   # Auto-fix issues
```

Run format:
```bash
npx biome format --write .
```

### Testing

**No test framework is currently configured.** If adding tests:
```bash
# Jest (recommended for Express)
npm test                     # Run all tests
npm test -- --testNamePattern="test name"  # Run single test

# Or with Mocha
npx mocha "test/**/*.js"    # Run specific test file
```

## Code Style Guidelines

### Language
- **Use CommonJS** (`require()`) - do not use ES modules (`import/export`)
- This project uses Express 5.x which still uses CommonJS

### Naming Conventions
- **Files**: snake_case (`database.js`, `api_routes.js`)
- **Classes**: PascalCase (`DatabaseAdapter`, `UserService`)
- **Functions/variables**: camelCase (`getAllParticipants`, `userRole`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CONNECTIONS`, `DEFAULT_PORT`)

### Imports
```javascript
// Core Node modules
var express = require('express');
var path = require('path');

// Third-party modules
var cookieParser = require('cookie-parser');

// Local modules (relative paths)
var indexRouter = require('./routes/index');
var DatabaseAdapter = require('./routes/database');
```

### Async/Await
- Always use `async/await` for route handlers in Express 5
- Always wrap in try/catch for error handling
```javascript
router.get('/endpoint', async function(req, res, next) {
  try {
    const data = await db.getData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch data',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});
```

### Error Handling
- In API routes: return JSON with `{ error, message }` structure
- In production: hide error details, show only in development
- Use appropriate HTTP status codes (400, 401, 403, 404, 500)

### Database Access
- Use the `DatabaseAdapter` class in `routes/database.js`
- It handles both MySQL (dev) and Supabase (prod) transparently
- Always pass `userRole` and `userParish` for role-based filtering

### Environment Variables
- All config via `dotenv`
- Required vars: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Optional: `NODE_ENV`, `PORT`, `CORS_ORIGINS`
- Never commit `.env` files

### Security
- Passwords stored as plain text (in development) - needs improvement
- CORS configured via `CORS_ORIGINS` env var
- Role-based access control implemented in middleware

### Routes
- Define in `routes/` directory
- Use Express Router
- Apply auth middleware after public endpoints:
```javascript
// Public endpoint
router.post('/login', async function(req, res, next) { ... });

// Protected endpoints
router.use(authMiddleware);
router.get('/protected', async function(req, res, next) { ... });
```

### Views (EJS)
- Templates in `views/pages/` and `views/partials/`
- Use layouts for shared header/footer
- Server-side rendering only (no client-side React/Vue)

### Git Conventions
- Branch naming: `feature/description`, `fix/description`
- Commit messages: concise, imperative mood
- No commits containing secrets or `.env` files

## Project Structure

```
frontend/
├── bin/www              # Server entry point
├── app.js               # Express app configuration
├── routes/
│   ├── index.js         # Page routes
│   ├── users.js         # User routes
│   ├── api.js           # API endpoints
│   └── database.js      # Database adapter
├── views/
│   ├── layouts/         # Layout templates
│   ├── pages/           # Page templates (EJS)
│   └── partials/        # Shared partials
├── public/
│   ├── javascripts/     # Client-side JS
│   ├── stylesheets/    # CSS
│   └── images/         # Static images
├── .env.example         # Environment template
└── package.json
```

## Database Schema

Key tables: `households`, `family_members`, `health_conditions`, `socio_economic`, `users`

## Common Tasks

### Adding a new API endpoint
1. Add route in `routes/api.js`
2. Use try/catch error handling
3. Apply role-based access if needed
4. Test with `curl` or Postman

### Adding a new page
1. Create EJS template in `views/pages/`
2. Add route in `routes/index.js`
3. Add client JS in `public/javascripts/` if needed

### Database changes
- Modify `routes/database.js` - handles both MySQL and Supabase
- Test both environments before committing
