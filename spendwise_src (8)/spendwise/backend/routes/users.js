// backend/routes/users.js
// CS304.3 Advanced Database Management System — Group AJ

const express = require('express')
const { getConnection } = require('../db')
const router  = express.Router()

// GET /api/users
// Oracle: SELECT user_id, name FROM User_Table ORDER BY name
router.get('/', async (req, res) => {
  let conn
  try {
    conn = await getConnection()
    const result = await conn.execute(
      `SELECT user_id, name FROM User_Table ORDER BY name`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  } finally {
    if (conn) await conn.release()
  }
})

module.exports = router
