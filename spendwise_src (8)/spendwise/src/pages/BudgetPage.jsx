// src/pages/BudgetPage.jsx
import React from 'react'
import Budget from '../components/Budget'

export default function BudgetPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Budget Overview</h1>
        <p>Track your spending against monthly budget limits</p>
      </div>
      <Budget />
    </div>
  )
}
