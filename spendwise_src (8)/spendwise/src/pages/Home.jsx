// src/pages/Home.jsx
import React, { useState } from 'react'
import Dashboard from '../components/Dashboard'
import ExpenseForm from '../components/ExpenseForm'

export default function Home() {
  const [refresh, setRefresh] = useState(0)
  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your spending habits and recent transactions</p>
      </div>
      <Dashboard key={refresh} />
      <div style={{ marginTop: 20 }}>
        <ExpenseForm onExpenseAdded={() => setRefresh(r => r + 1)} />
      </div>
    </div>
  )
}
