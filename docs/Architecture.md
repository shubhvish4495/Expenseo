# Architecture Specification: Travel Expense Manager (MVP)

## 1. Project Overview

A lightweight, temporary Single Page Application (SPA) designed for group travel. It allows users to create groups, add members, and log shared expenses without requiring user authentication. To ensure rapid deployment and zero backend maintenance, the application utilizes Google Sheets as a serverless database and API.

## 2. Technology Stack

- **Frontend Framework**: React.js (via Vite)
- **Routing**: React Router (for navigating between Home and Group views)
- **Styling**: Tailwind CSS (for rapid, mobile-responsive UI development)
- **Backend / API**: Google Apps Script (GAS) deployed as a Web App
- **Database**: Google Workspace (Google Sheets)
- **Deployment**: Vercel or Netlify (Free Tier)

## 3. Data Architecture (Google Sheets)

The database will consist of a single Google Spreadsheet, dynamically creating new tabs as groups are formed.

### Core Sheets

| Sheet Name | Columns | Purpose |
|------------|---------|---------|
| Index | GroupID, GroupName, CreatedDate | Master ledger of all active trips/groups |
| [Group]_Members | MemberName, JoinDate | Tracks individuals within a specific group |
| [Group]_Expenses | ExpenseID, Timestamp, PaidBy, Amount, Description, Fractions | The ledger for a specific group. Fractions stores a JSON string (e.g., `{"Alice": 0.5, "Bob": 0.5}`) |

## 4. API Layer (Google Apps Script)

The SPA communicates with the Google Sheet via a single GAS Web App URL using HTTP POST requests. The `doPost(e)` function will act as a router based on the action provided in the JSON payload.

### API Actions

- **GET_DASHBOARD**: Returns a list of all groups from the Index sheet
- **CREATE_GROUP**: Appends a row to Index and duplicates a template sheet to create [Group]_Members and [Group]_Expenses
- **GET_GROUP_DATA**: Fetches all rows from a specific group's Member and Expense sheets to hydrate the React state
- **ADD_MEMBER**: Appends a row to the [Group]_Members sheet
- **ADD_EXPENSE**: Appends a row to the [Group]_Expenses sheet

### Concurrency Management

To prevent data corruption when multiple users update the sheet simultaneously from different devices, all write operations in the GAS backend will be wrapped in the LockService class:

```javascript
const lock = LockService.getScriptLock();
lock.waitLock(10000); // Wait up to 10 seconds for other operations to finish
// ... Perform Sheet Write Operations ...
lock.releaseLock();
```

## 5. Application Flow & User Interface

### View 1: Home / Dashboard

- **State**: List of groups
- **UI**: A grid of existing groups and a prominent "Create New Trip" button
- **Action**: Clicking a group routes the user to `/group/:groupName`

### View 2: Group Ledger

- **State**: `members` (Array), `expenses` (Array of Objects)
- **Behavior**: On mount, React fetches `GET_GROUP_DATA`. A `setInterval` runs every 15 seconds to re-fetch the data, ensuring the user sees expenses added by others in real-time
- **UI**:
  - Header displaying Total Trip Cost
  - List of Members (with a quick "Add Member" text input)
  - Feed of recent expenses
  - Floating Action Button (FAB) to "Log Expense"

### View 3: Expense Modal (Component)

- **State**: `description`, `amount`, `paidBy`, `splitType` (Equal/Custom), `customSplits` (Object)
- **UI**:
  - Dropdown to select who paid (populated from members state)
  - Input for Amount and Description
  - Dynamic toggle: "Split Equally" (auto-calculates math) or "Custom Split" (renders input fields next to each member's name to assign specific amounts)
  - Validation: React ensures the sum of custom splits equals the total amount before enabling the "Save" button