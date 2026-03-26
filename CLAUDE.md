# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Travel Expense Manager MVP - a lightweight, temporary Single Page Application (SPA) for group travel expense tracking. The application allows users to create groups, add members, and log shared expenses without requiring user authentication.

## Architecture

**Frontend Stack:**
- React.js (via Vite)
- React Router (for navigation between Home and Group views)
- Tailwind CSS (mobile-first responsive design)

**Backend/API:**
- Google Apps Script (GAS) deployed as a Web App
- Single doPost(e) function acting as a router based on action in JSON payload

**Database:**
- Google Sheets as serverless database
- Dynamic sheet creation: Index sheet + [Group]_Members + [Group]_Expenses per group

## Key Development Commands

Since this appears to be a fresh project setup, typical commands would be:

```bash
# Install dependencies (when package.json exists)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Critical Architecture Patterns

### API Integration
- All API calls centralized in `src/utils/api.js`
- Standardized payload format for GAS communication:
```javascript
{
  "action": "ACTION_NAME",
  "payload": { ...data }
}
```

### Core API Actions
- `GET_DASHBOARD`: Returns list of all groups from Index sheet
- `CREATE_GROUP`: Creates new group and associated sheets
- `GET_GROUP_DATA`: Fetches members and expenses for specific group
- `ADD_MEMBER`: Adds member to group
- `ADD_EXPENSE`: Adds expense entry

### Google Apps Script Requirements
- **Mandatory LockService:** All write operations must use `LockService.getScriptLock()` to prevent concurrent write collisions
- Use `SpreadsheetApp` for all data manipulation
- Return properly formatted JSON using `ContentService`

### State Management Rules
- Use React hooks only (`useState`, `useEffect`, `useMemo`)
- No Redux/Zustand - prop drilling is acceptable for this MVP
- Implement polling (15-second intervals) on Group view for real-time updates
- Clear intervals on component unmount to prevent memory leaks

### Component Standards
- Functional components only, no class components
- Use `.jsx` file extensions
- Keep components under 150 lines
- Mobile-first Tailwind CSS approach

### Data Structure
**Fractions Storage:** Custom splits stored as JSON strings in expenses (e.g., `{"Alice": 0.5, "Bob": 0.5}`)

**Sheet Structure:**
- `Index`: GroupID, GroupName, CreatedDate
- `[Group]_Members`: MemberName, JoinDate
- `[Group]_Expenses`: ExpenseID, Timestamp, PaidBy, Amount, Description, Fractions

### Important Constraints
- No SQL/MongoDB/Prisma - all data goes through Google Sheets API
- No authentication system
- No Node.js APIs in GAS environment
- Handle CORS with `redirect: "follow"` in fetch options
- Precise float math for expense calculations (round to 2 decimal places)

## UI/UX Architecture

**View 1 - Dashboard:** Grid of existing groups + "Create New Trip" button
**View 2 - Group Ledger:** Members list, expenses feed, FAB for adding expenses
**View 3 - Expense Modal:** Amount, description, paid by, split options (equal/custom)

## Development Workflow

### Before Starting Any New Feature
**ALWAYS** read `docs/CodingStandards.md` first to understand:
- Component structure requirements
- Styling conventions (Tailwind CSS only)
- State management patterns
- Backend constraints and API protocols

### During New Implementation
**ALWAYS** reference `docs/Architecture.md` for:
- Complete data flow understanding
- API action specifications
- Sheet structure and naming conventions
- Concurrency management patterns
- UI/UX flow requirements

### Implementation Checklist
1. Read coding standards before writing any code
2. Verify architecture patterns during implementation
3. Ensure LockService wrapping for all GAS write operations
4. Implement proper polling/cleanup for real-time features
5. Follow mobile-first Tailwind patterns

## Documentation References

Detailed architecture specifications are in `docs/Architecture.md` and comprehensive coding standards are in `docs/CodingStandards.md`.