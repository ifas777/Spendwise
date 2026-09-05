// backend/routes/budgets.js
// CS304.3 Advanced Database Management System — Group AJ

const express = require('express')
const { getConnection } = require('../db')
const router  = express.Router()

// GET /api/budgets
// Oracle: Budget table joined with Category_Table,
//         remaining amount calculated via fn_RemainingBudget(p_user_id, p_category_id)
router.get('/', async (req, res) => {
  let conn
  try {
    conn = await getConnection()
    const result = await conn.execute(
      `SELECT
          b.budget_id,
          b.user_id,
          c.name                                          AS category_name,
          b.monthly_limit,
          fn_RemainingBudget(b.user_id, b.category_id)     AS remaining_budget
       FROM Budget b
       JOIN Category_Table c ON b.category_id = c.category_id`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  } finally {
    if (conn) await conn.release()
  }
})

module.exports = router
