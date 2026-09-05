// backend/db.js
// CS304.3 Advanced Database Management System — Group AJ
//
// Supports both:
//   - Oracle Cloud (ATP) via Wallet
//   - Local Oracle XE via connectString

const oracledb = require('oracledb')
const path     = require('path')

// Return rows as plain JS objects { COLUMN_NAME: value }
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT

let pool

/**
 * initialisePool()
 * Creates the Oracle connection pool on server startup.
 *
 * For Oracle Cloud (ATP):
 *   - Set TNS_ADMIN in .env to the path of your downloaded Wallet folder
 *   - DB_CONNECT should be the full connection string from Oracle Cloud
 *
 * For local Oracle XE:
 *   - DB_CONNECT = localhost/XEPDB1
 *   - No wallet needed
 */
async function initialisePool() {

  // ── Oracle Cloud Wallet setup ──────────────────────────────────────────────
  // If TNS_ADMIN is set in .env, configure wallet for Oracle Cloud (ATP)
  if (process.env.TNS_ADMIN) {
    oracledb.initOracleClient({
      configDir: process.env.TNS_ADMIN
    })
    console.log('Oracle Wallet configured:', process.env.TNS_ADMIN)
  }

  pool = await oracledb.createPool({
    user:          process.env.DB_USER,
    password:      process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT,
    poolMin:       2,
    poolMax:       10,
    poolIncrement: 1,
  })

  console.log('Oracle connection pool created ✅')
  console.log('Connected as:', process.env.DB_USER)
}

/**
 * getConnection()
 * Returns a connection from the pool.
 * Always call conn.release() in a finally block after use.
 */
async function getConnection() {
  return pool.getConnection()
}

module.exports = { initialisePool, getConnection }
