// backend/server.js
// CS304.3 Advanced Database Management System — Group AJ

const express  = require('express')
const cors     = require('cors')
const dotenv   = require('dotenv')
dotenv.config()

const { initialisePool } = require('./db')
const expenseRoutes      = require('./routes/expenses')
const userRoutes         = require('./routes/users')
const budgetRoutes       = require('./routes/budgets')

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/expenses', expenseRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/budgets',  budgetRoutes)

// Categories list (used for the Add Expense form dropdown)
// Oracle: SELECT category_id, name FROM Category_Table ORDER BY name
app.get('/api/categories', async (req, res) => {
  const { getConnection } = require('./db')
  let conn
  try {
    conn = await getConnection()
    const result = await conn.execute(
      `SELECT category_id, name FROM Category_Table ORDER BY name`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  } finally {
    if (conn) await conn.release()
  }
})

// Payment methods list (used for the Add Expense form dropdown)
// Oracle: SELECT pay_method_id, method_name FROM Pay_Method_Table ORDER BY method_name
app.get('/api/paymethods', async (req, res) => {
  const { getConnection } = require('./db')
  let conn
  try {
    conn = await getConnection()
    const result = await conn.execute(
      `SELECT pay_method_id, method_name FROM Pay_Method_Table ORDER BY method_name`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  } finally {
    if (conn) await conn.release()
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'Oracle', timestamp: new Date() })
})

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
initialisePool()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SpendWise API running → http://localhost:${PORT}`)
    })
  })
  .catch(err => {
    console.error('Failed to connect to Oracle:', err.message)
    process.exit(1)
  })
