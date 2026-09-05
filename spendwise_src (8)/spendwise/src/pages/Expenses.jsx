// src/pages/Expenses.jsx
import React, { useState } from 'react'
import ExpenseForm  from '../components/ExpenseForm'
import ExpenseTable from '../components/ExpenseTable'

export default function Expenses() {
  const [refresh, setRefresh] = useState(0)
  return (
    <div>
      <div className="page-header">
        <h1>Expenses</h1>
        <p>Add, view, filter and manage all your expenses</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <ExpenseForm onExpenseAdded={() => setRefresh(r => r + 1)} />
        <ExpenseTable refreshTrigger={refresh} />
      </div>
    </div>
  )
}
