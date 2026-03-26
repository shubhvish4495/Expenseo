# AI Agent Coding Standards: Travel Expense Manager MVP

## 1. Project Context & Architecture
* **Frontend:** React.js (initialized via Vite), React Router, Tailwind CSS.
* **Backend:** Google Apps Script (GAS) deployed as a Web App (acting as a serverless API).
* **Database:** Google Sheets.
* **Primary Goal:** A lightweight, mobile-first Single Page Application (SPA) for group travel expense tracking. No user authentication is required.

---

## 2. General AI Directives
* **Simplicity First:** This is a temporary MVP. Prioritize readable, straightforward code over over-engineered, highly abstract patterns.
* **No Database Assumptions:** Do not generate code for SQL, MongoDB, or Prisma. All data persistence must strictly route through the `api.js` fetch layer to Google Apps Script.
* **Security:** Since there is no auth, do not implement complex JWT or session logic. Focus entirely on UI state and data concurrency.
* **Completeness:** When generating or refactoring components, provide the complete file code. Do not use placeholders like `// ... existing code ...` unless explicitly instructed to save space.

---

## 3. Frontend Standards (React + Tailwind)

### Component Structure
* Use Functional Components with React Hooks (`useState`, `useEffect`, `useMemo`). Do not use Class Components.
* Keep components small and focused. If a component exceeds 150 lines, evaluate if it can be broken down into smaller sub-components (e.g., extracting an `ExpenseListItem` from an `ExpenseList`).
* Use `.jsx` file extensions.

### Styling (Tailwind CSS)
* Strictly use Tailwind CSS utility classes for styling. Do not create separate `.css` files for component-level styling unless absolutely necessary for complex animations.
* Build for mobile-first. Default to mobile layouts and use `md:` or `lg:` prefixes only if a desktop view is required.
* Ensure high contrast and touch-friendly targets (buttons/inputs should have adequate padding, e.g., `p-3` or `min-h-[44px]`).

### State Management
* Rely on React's built-in hooks (`useState`, `useContext`) for local state. 
* Do not introduce Redux, Zustand, or other global state managers. For this MVP, prop-drilling a few levels down is perfectly acceptable.
* For the `fractions` or `customSplits` state, ensure precise float math (e.g., rounding to 2 decimal places) to prevent UI display errors when dividing expenses.

---

## 4. Backend Standards (Google Apps Script)

### Environment Constraints
* GAS uses modern JavaScript (V8), but lacks Node.js APIs. Do not attempt to import npm packages like `axios`, `express`, or `mongoose` into the GAS files.
* Ensure all GAS code uses `SpreadsheetApp` for data manipulation.

### Concurrency & Performance
* **Mandatory LockService:** Every `doPost(e)` action that writes to the sheet MUST be wrapped in Google's `LockService` to prevent concurrent write collisions.
  ```javascript
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    // ... write operations ...
  } catch (e) {
    // return error
  } finally {
    lock.releaseLock();
  }
Batch operations where possible to avoid hitting GAS execution time limits.
API Response Format
All doGet and doPost functions must return properly formatted JSON strings using ContentService.
JavaScript
return ContentService.createTextOutput(JSON.stringify(responseObject))
  .setMimeType(ContentService.MimeType.JSON);



5. API Integration (The Bridge)
Fetch Protocol
Centralize all API calls in a single src/utils/api.js file.
Since GAS Web Apps primarily rely on POST for payloads, structure the fetch body with an explicit action routing key:
JavaScript
// Standardized payload format
{
  "action": "ACTION_NAME",
  "payload": { ...data }
}


Handle CORS issues gracefully. GAS Web Apps often return redirects (302) before the final response. Use redirect: "follow" in the fetch options.
Error Handling & Polling
Implement a try/catch block for every network request.
Because data can be updated by other users in real-time, implement a lightweight polling mechanism (setInterval) on the Group view to silently fetch the latest sheet data every 10-15 seconds. Ensure the interval is cleared on component unmount to prevent memory leaks.