/**
 * Google Apps Script Web App for Expense Tracker
 *
 * API Endpoints (all via POST with JSON payload):
 *
 * GET_DASHBOARD
 *   Response: { "status": "success", "data": { "groups": [...], "totalGroups": number, "timestamp": string } }
 *
 * GET_AVAILABLE_GROUPS
 *   Response: { "status": "success", "data": { "groups": [...], "timestamp": string } }
 *
 * CREATE_GROUP
 *   Payload: { "groupName": string }
 *   Response: { "status": "success", "data": { "groupId": string, "groupName": string } }
 *
 * ADD_EXPENSE
 *   Payload: { "groupName": string, "paidBy": string, "amount": number, "description": string, "fractions": object }
 *   Response: { "status": "success", "data": { "expenseId": string } }
 *
 * ADD_MEMBER
 *   Payload: { "groupName": string, "memberName": string }
 *   Response: { "status": "success", "data": { "memberName": string } }
 *
 * GET_GROUP_DATA
 *   Payload: { "groupName": string }
 *   Response: { "status": "success", "data": { "expenses": [...], "members": [...] } }
 *
 * GET_GROUP_BALANCES
 *   Payload: { "groupName": string }
 *   Response: { "status": "success", "data": { "balances": [...], "settlements": [...] } }
 *
 * DELETE_EXPENSE
 *   Payload: { "groupName": string, "expenseId": string }
 *   Response: { "status": "success", "data": { "expenseId": string } }
 *
 * DELETE_MEMBER
 *   Payload: { "groupName": string, "memberName": string }
 *   Response: { "status": "success", "data": { "memberName": string } }
 *
 * Error Response Format:
 *   { "status": "error", "message": string, "timestamp": string }
 */

const SCRIPT_PROP = PropertiesService.getScriptProperties();

// This function catches all POST requests from your React App
function doPost(e) {
  // 1. Establish a lock to prevent concurrent write collisions
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // Wait up to 10 seconds for the queue to clear
  
  try {
    // 2. Parse the incoming JSON payload
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const payload = requestData.payload;
    
    let resultData = null;

    // 3. Route the request based on the "action"
    if (action === "GET_DASHBOARD") {
      resultData = getDashboard();
    } else if (action === "GET_AVAILABLE_GROUPS") {
      resultData = { groups: getAvailableGroups(), timestamp: new Date().toISOString() };
    } else if (action === "CREATE_GROUP") {
      resultData = createNewGroup(payload);
    } else if (action === "ADD_EXPENSE") {
      resultData = addExpense(payload);
    } else if (action === "ADD_MEMBER") {
      resultData = addMember(payload);
    } else if (action === "GET_GROUP_DATA") {
      resultData = getGroupData(payload.groupName);
    } else if (action === "GET_GROUP_BALANCES") {
      resultData = getGroupBalances(payload.groupName);
    } else if (action === "DELETE_EXPENSE") {
      resultData = deleteExpense(payload);
    } else if (action === "DELETE_MEMBER") {
      resultData = deleteMember(payload);
    } else {
      throw new Error("Invalid Action: " + action + ". Available actions: GET_DASHBOARD, GET_AVAILABLE_GROUPS, CREATE_GROUP, ADD_EXPENSE, ADD_MEMBER, GET_GROUP_DATA, GET_GROUP_BALANCES, DELETE_EXPENSE, DELETE_MEMBER");
    }
    
    // 4. Return success response to the frontend
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "success", "data": resultData }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log the error for debugging
    Logger.log("Error in doPost: " + error.message);
    Logger.log("Error stack: " + error.stack);

    // Return error response to the frontend with proper JSON formatting
    const errorResponse = {
      "status": "error",
      "message": error.message || "An unexpected error occurred",
      "timestamp": new Date().toISOString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    // 5. Always release the lock!
    lock.releaseLock();
  }
}

// Testing endpoint - accessible via GET request in browser
function doGet() {
  try {
    return ContentService
      .createTextOutput(JSON.stringify({
        "status": "success",
        "message": "Expense Tracker API is running",
        "timestamp": new Date().toISOString(),
        "availableActions": [
          "GET_DASHBOARD",
          "GET_AVAILABLE_GROUPS",
          "CREATE_GROUP",
          "ADD_EXPENSE",
          "ADD_MEMBER",
          "GET_GROUP_DATA",
          "GET_GROUP_BALANCES",
          "DELETE_EXPENSE",
          "DELETE_MEMBER"
        ]
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        "status": "error",
        "message": error.message,
        "timestamp": new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- CORE CRUD FUNCTIONS ---

function getDashboard() {
  try {
    const groups = getAvailableGroups();
    return {
      groups: groups,
      totalGroups: groups.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    Logger.log("Error in getDashboard: " + error.message);
    throw new Error("Failed to get dashboard data: " + error.message);
  }
}

/**
 * Gets all available groups with proper JSON formatting
 * @returns {Array} Array of group objects
 */
function getAvailableGroups() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let indexSheet;

  try {
    indexSheet = ss.getSheetByName("Index");
  } catch (error) {
    // If Index sheet doesn't exist, create it
    indexSheet = ss.insertSheet("Index");
    indexSheet.appendRow(["GroupID", "GroupName", "CreatedDate"]);
    return [];
  }

  // Get all data from the sheet
  const dataRange = indexSheet.getDataRange();
  if (dataRange.getNumRows() <= 1) {
    // Only header row exists or sheet is empty
    return [];
  }

  const allData = dataRange.getValues();

  // Skip the header row and format the data with proper JSON structure
  const groups = allData.slice(1)
    .filter(row => row[0] && row[1]) // Filter out empty rows
    .map(row => ({
      groupId: String(row[0] || ""),
      groupName: String(row[1] || ""),
      createdDate: row[2] ? formatDateToISO(row[2]) : new Date().toISOString(),
      status: "active"
    }));

  return groups;
}

/**
 * Helper function to ensure consistent date formatting
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string
 */
function formatDateToISO(date) {
  try {
    if (date instanceof Date) {
      return date.toISOString();
    } else if (typeof date === 'string') {
      return new Date(date).toISOString();
    } else {
      return new Date().toISOString();
    }
  } catch (error) {
    return new Date().toISOString();
  }
}

function createNewGroup(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const groupName = payload.groupName;
  const groupId = Utilities.getUuid(); // Generate a unique ID
  
  // 1. Log the group in the Index sheet
  const indexSheet = ss.getSheetByName("Index");
  indexSheet.appendRow([groupId, groupName, new Date().toISOString()]);
  
  // 2. Create the Expenses tab for this group
  const expensesSheet = ss.insertSheet(`${groupName}_Expenses`);
  expensesSheet.appendRow(["ExpenseID", "Timestamp", "PaidBy", "Amount", "Description", "Fractions"]);
  
  // 3. Create the Members tab for this group
  const membersSheet = ss.insertSheet(`${groupName}_Members`);
  membersSheet.appendRow(["MemberName", "JoinDate"]);
  
  return { groupId: groupId, groupName: groupName };
}

function addExpense(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(`${payload.groupName}_Expenses`);
  
  if (!sheet) throw new Error("Group does not exist.");
  
  const expenseId = Utilities.getUuid();
  sheet.appendRow([
    expenseId,
    new Date().toISOString(),
    payload.paidBy,
    payload.amount,
    payload.description,
    JSON.stringify(payload.fractions) // Save split logic as a string
  ]);
  
  return { expenseId: expenseId };
}

function addMember(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(`${payload.groupName}_Members`);
  
  if (!sheet) throw new Error("Group does not exist.");
  
  sheet.appendRow([payload.memberName, new Date().toISOString()]);
  return { memberName: payload.memberName };
}

function getGroupData(groupName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const expensesSheet = ss.getSheetByName(`${groupName}_Expenses`);
  const membersSheet = ss.getSheetByName(`${groupName}_Members`);

  if (!expensesSheet || !membersSheet) throw new Error("Group not found.");

  // Fetch all data excluding the header row
  const expensesData = expensesSheet.getDataRange().getValues().slice(1);
  const membersData = membersSheet.getDataRange().getValues().slice(1);

  // Format expenses data to match React component expectations
  const expenses = expensesData.map(row => ({
    expenseId: row[0],
    timestamp: row[1],
    paidBy: row[2],
    amount: parseFloat(row[3]),
    description: row[4],
    fractions: JSON.parse(row[5] || '{}')
  }));

  // Format members data to match React component expectations
  const members = membersData.map(row => ({
    memberName: row[0],
    joinDate: row[1]
  }));

  return {
    expenses: expenses,
    members: members
  };
}

/**
 * Calculate outstanding balances for a group
 * @param {string} groupName - The name of the group
 * @returns {Object} Object containing member balances and settlement plan
 */
function getGroupBalances(groupName) {
  try {
    const groupData = getGroupData(groupName);
    const expenses = groupData.expenses;
    const members = groupData.members;

    // Initialize balances for all members
    const balances = {};
    members.forEach(member => {
      balances[member.memberName] = {
        memberName: member.memberName,
        totalPaid: 0,
        totalOwes: 0,
        netBalance: 0 // positive = owed money, negative = owes money
      };
    });

    // Process each expense
    expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      const amount = expense.amount;
      const fractions = expense.fractions;

      // Credit the person who paid
      if (balances[paidBy]) {
        balances[paidBy].totalPaid += amount;
      }

      // Debit each person based on their share
      Object.keys(fractions).forEach(member => {
        if (balances[member]) {
          const share = amount * fractions[member];
          balances[member].totalOwes += share;
        }
      });
    });

    // Calculate net balances
    Object.keys(balances).forEach(member => {
      balances[member].netBalance = Math.round((balances[member].totalPaid - balances[member].totalOwes) * 100) / 100;
    });

    // Generate settlement plan
    const settlements = calculateSettlements(balances);

    return {
      balances: Object.values(balances),
      settlements: settlements,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    Logger.log("Error in getGroupBalances: " + error.message);
    throw new Error("Failed to calculate group balances: " + error.message);
  }
}

/**
 * Calculate optimal settlement plan to minimize transactions
 * @param {Object} balances - Object containing member balances
 * @returns {Array} Array of settlement transactions
 */
function calculateSettlements(balances) {
  const settlements = [];

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = [];
  const debtors = [];

  Object.values(balances).forEach(member => {
    if (member.netBalance > 0.01) { // They are owed money (with small tolerance for floating point)
      creditors.push({
        name: member.memberName,
        amount: member.netBalance
      });
    } else if (member.netBalance < -0.01) { // They owe money
      debtors.push({
        name: member.memberName,
        amount: Math.abs(member.netBalance)
      });
    }
  });

  // Sort creditors and debtors by amount (largest first) for optimal settlement
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Match debtors with creditors
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    // Calculate settlement amount (minimum of what's owed vs what's due)
    const settlementAmount = Math.min(creditor.amount, debtor.amount);

    if (settlementAmount > 0.01) { // Only create settlement if amount is meaningful
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(settlementAmount * 100) / 100,
        description: `${debtor.name} owes ${creditor.name}`
      });

      // Update remaining amounts
      creditor.amount -= settlementAmount;
      debtor.amount -= settlementAmount;
    }

    // Move to next creditor or debtor if current one is settled
    if (creditor.amount <= 0.01) {
      creditorIndex++;
    }
    if (debtor.amount <= 0.01) {
      debtorIndex++;
    }
  }

  return settlements;
}

/**
 * Delete an expense from a group
 * @param {Object} payload - Contains groupName and expenseId
 * @returns {Object} Object containing the deleted expense ID
 */
function deleteExpense(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(`${payload.groupName}_Expenses`);

  if (!sheet) throw new Error("Group does not exist.");

  const expenseId = payload.expenseId;
  const dataRange = sheet.getDataRange();
  const allData = dataRange.getValues();

  // Find the row with the matching expense ID
  let rowToDelete = -1;
  for (let i = 1; i < allData.length; i++) { // Start from 1 to skip header
    if (allData[i][0] === expenseId) {
      rowToDelete = i + 1; // Convert to 1-based indexing for sheet
      break;
    }
  }

  if (rowToDelete === -1) {
    throw new Error("Expense not found.");
  }

  // Delete the row
  sheet.deleteRow(rowToDelete);

  return { expenseId: expenseId };
}

/**
 * Delete a member from a group
 * @param {Object} payload - Contains groupName and memberName
 * @returns {Object} Object containing the deleted member name
 */
function deleteMember(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(`${payload.groupName}_Members`);

  if (!sheet) throw new Error("Group does not exist.");

  const memberName = payload.memberName;
  const dataRange = sheet.getDataRange();
  const allData = dataRange.getValues();

  // Find the row with the matching member name
  let rowToDelete = -1;
  for (let i = 1; i < allData.length; i++) { // Start from 1 to skip header
    if (allData[i][0] === memberName) {
      rowToDelete = i + 1; // Convert to 1-based indexing for sheet
      break;
    }
  }

  if (rowToDelete === -1) {
    throw new Error("Member not found.");
  }

  // Check if member has any expenses before deleting
  const expensesSheet = ss.getSheetByName(`${payload.groupName}_Expenses`);
  if (expensesSheet) {
    const expensesData = expensesSheet.getDataRange().getValues();

    // Check if member is referenced in any expense (either as payer or in fractions)
    for (let i = 1; i < expensesData.length; i++) {
      const paidBy = expensesData[i][2];
      const fractionsStr = expensesData[i][5];

      // Check if member paid for any expense
      if (paidBy === memberName) {
        throw new Error("Cannot delete member who has paid for expenses. Delete their expenses first.");
      }

      // Check if member is part of any expense split
      try {
        const fractions = JSON.parse(fractionsStr || '{}');
        if (fractions[memberName]) {
          throw new Error("Cannot delete member who is part of expense splits. Delete or modify the relevant expenses first.");
        }
      } catch (parseError) {
        // If JSON parsing fails, continue (invalid data)
        Logger.log("Warning: Could not parse fractions for expense: " + fractionsStr);
      }
    }
  }

  // Delete the row
  sheet.deleteRow(rowToDelete);

  return { memberName: memberName };
}