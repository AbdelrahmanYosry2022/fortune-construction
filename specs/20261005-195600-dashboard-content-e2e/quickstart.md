# Quickstart: Running E2E Suite

## Setup & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright Browsers** (if running for the first time):
   ```bash
   npx playwright install chromium
   ```

3. **Run Full E2E Test Suite**:
   ```bash
   npm run test:e2e
   ```

4. **Run E2E Test Suite in UI Mode**:
   ```bash
   npx playwright test --ui
   ```

5. **Run Specific Test Scenario**:
   ```bash
   npx playwright test -g "dashboard content publishes"
   ```

## Local Environment Defaults
- Public Website: `http://localhost:5173`
- Dashboard App: `http://localhost:5174`
- API Server: `http://localhost:3001`
- Admin User: `admin` / `admin123`
