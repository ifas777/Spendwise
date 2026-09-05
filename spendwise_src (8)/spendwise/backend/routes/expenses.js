// backend/routes/expenses.js
// CS304.3 Advanced Database Management System — Group AJ

const express  = require('express')
const { getConnection } = require('../db')
const router   = express.Router()

// GET /api/expenses
// Fetches all expenses using Oracle view vw_ExpenseSummary
router.get('/', async (req, res) => {
  let conn
  try {
    conn = await getConnection()
    const result = await conn.execute(
      `SELECT * FROM vw_ExpenseSummary ORDER BY expense_date DESC`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  } finally {
    if (conn) await conn.release()
  }
})

// POST /api/expenses
// Calls Oracle stored procedure sp_AddExpense.
// The BEFORE INSERT trigger trg_CheckBudgetLimit fires inside Oracle
// and raises ORA-20001 if the budget limit would be exceeded.
router.post('/', async (req, res) => {
  const { user_id, category_id, pay_method_id, amount, expense_date, description } = req.body
  let conn
  try {
    conn = await getConnection()
    await conn.execute(
      `BEGIN
         sp_AddExpense(
           p_user_id       => :user_id,
           p_category_id   => :category_id,
           p_pay_method_id => :pay_method_id,
           p_amount        => :amount,
           p_expense_date  => TO_DATE(:expense_date, 'YYYY-MM-DD'),
           p_description   => :description
         );
       END;`,
      { user_id, category_id, pay_method_id, amount, expense_date, description },
      { autoCommit: true }
    )
    res.json({ success: true, message: 'Expense added successfully' })
  } catch (err) {
    // Catch Oracle trigger budget violation (ORA-20001)
    const msg = err.message.includes('ORA-20001')
      ? 'Budget limit exceeded for this category'
      : err.message
    res.status(400).json({ success: false, message: msg })
  } finally {
    if (conn) await conn.release()
  }
})

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  let conn
  try {
    conn = await getConnection()
    await conn.execute(
      `DELETE FROM Expense WHERE expense_id = :id`,
      { id: req.params.id },
      { autoCommit: true }
    )
    res.json({ success: true, message: 'Expense deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  } finally {
    if (conn) await conn.release()
  }
})

module.exports = router
