# SpendWise — Setup Guide
## CS304.3 Advanced Database Management System — Group AJ

---

## Running the Frontend (no database needed)

```bash
cd spendwise
npm install
npm start
```
Opens at http://localhost:3000 — runs on mock data by default.

---

## Connecting to Oracle (when database is ready)

### Step 1 — Set up the backend

```bash
cd spendwise/backend
npm install express oracledb cors dotenv
```

### Step 2 — Create your .env file

Copy `.env.example` to `.env` then fill in:

**For Oracle Cloud (ATP):**
```
DB_USER=ADMIN
DB_PASSWORD=your_password
DB_CONNECT=your_connection_string_from_oracle_cloud
TNS_ADMIN=C:\path\to\your\downloaded\wallet\folder
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
```

**For local Oracle XE:**
```
DB_USER=SYSTEM
DB_PASSWORD=your_password
DB_CONNECT=localhost/XEPDB1
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
```

### Step 3 — Run the backend

```bash
node server.js
# Should print: SpendWise API running → http://localhost:5000
# Should print: Oracle connection pool created ✅
```

### Step 4 — Switch frontend to real data

Open `src/api/dataService.js` and make this one change:

```js
// Change this:
const USE_MOCK = true

// To this:
const USE_MOCK = false
```

And uncomment these two lines at the top of the same file:
```js
import axios from 'axios'
const API = axios.create({ baseURL: 'http://localhost:5000/api' })
```

Then install axios in the frontend:
```bash
cd spendwise
npm install axios
npm start
```

---

## Oracle Cloud — Getting the connection string

1. Go to https://cloud.oracle.com → sign in
2. Open your Autonomous Database
3. Click **DB Connection**
4. Download the **Wallet** (choose Instance Wallet)
5. Extract the wallet zip to a folder e.g. `C:\Wallet_SpendWise`
6. Copy the connection string from the **tnsnames.ora** file inside the wallet
7. Paste it as `DB_CONNECT` in your `.env`
8. Set `TNS_ADMIN` to the wallet folder path

---

## Oracle Objects Required in Your Database

| Type      | Name                   | Purpose                          |
|-----------|------------------------|----------------------------------|
| View      | vw_ExpenseSummary      | Fetch all expenses joined        |
| Procedure | sp_AddExpense          | Insert new expense               |
| Trigger   | trg_CheckBudgetLimit   | Auto budget check on INSERT      |
| Function  | fn_RemainingBudget     | Calculate remaining per category |
| Function  | fn_MonthlyExpense      | Monthly total per user           |

All SQL is in your Group AJ report, Section 2 and Section 3.
