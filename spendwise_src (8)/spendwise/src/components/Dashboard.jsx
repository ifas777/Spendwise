// src/components/Dashboard.jsx
// CS304.3 Advanced Database Management System — Group AJ
//
// Oracle notes (backend — not shown in UI):
//   Stats  → SELECT SUM(amount), AVG(amount), COUNT(*) FROM vw_ExpenseSummary
//   Chart  → SELECT category_name, SUM(amount) FROM vw_ExpenseSummary GROUP BY category_name
//   Recent → SELECT * FROM vw_ExpenseSummary ORDER BY expense_date DESC FETCH FIRST 5 ROWS ONLY
//   Budget → fn_RemainingBudget(p_user_id, p_category_id)

import React, { useEffect, useRef, useState } from 'react'
import { getExpenses, getBudgets } from '../api/dataService'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const fmt = n => 'Rs ' + Number(n).toLocaleString()

// Small up/down arrow SVG
const TrendUp   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
const TrendDown = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>

export default function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [budgets,  setBudgets]  = useState([])
  const [loading,  setLoading]  = useState(true)

  const barRef   = useRef(null)
  const lineRef  = useRef(null)
  const barInst  = useRef(null)
  const lineInst = useRef(null)

  useEffect(() => {
    Promise.all([getExpenses(), getBudgets()]).then(([exp, bud]) => {
      setExpenses(exp); setBudgets(bud); setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (loading || !barRef.current || !lineRef.current) return
    barInst.current?.destroy()
    lineInst.current?.destroy()

    // Category bar chart
    const bycat = {}
    expenses.forEach(e => { bycat[e.category_name] = (bycat[e.category_name] || 0) + e.amount })
    barInst.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: Object.keys(bycat),
        datasets: [{
          data: Object.values(bycat),
          backgroundColor: '#3b5bdb',
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#8a8f9d' } },
          y: { grid: { color: '#f0f2f5' }, ticks: { callback: v => 'Rs ' + v.toLocaleString(), font: { size: 10 }, color: '#8a8f9d' } },
        },
      },
    })

    // Daily line chart
    const dailyMap = {}
    expenses.forEach(e => { dailyMap[e.expense_date] = (dailyMap[e.expense_date] || 0) + e.amount })
    const days = Object.keys(dailyMap).sort().slice(-8)
    lineInst.current = new Chart(lineRef.current, {
      type: 'line',
      data: {
        labels: days.map(d => d.slice(5)),
        datasets: [{
          data: days.map(d => dailyMap[d]),
          borderColor: '#3b5bdb',
          backgroundColor: 'rgba(59,91,219,0.06)',
          tension: 0.4, fill: true,
          pointBackgroundColor: '#3b5bdb',
          pointRadius: 3, borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#8a8f9d' } },
          y: { grid: { color: '#f0f2f5' }, ticks: { callback: v => 'Rs ' + v.toLocaleString(), font: { size: 10 }, color: '#8a8f9d' } },
        },
      },
    })

    return () => { barInst.current?.destroy(); lineInst.current?.destroy() }
  }, [loading, expenses])

  if (loading) return <div className="spinner-wrap"><div className="spinner" />Loading…</div>

  const totalSpent  = expenses.reduce((s, e) => s + e.amount, 0)
  const avgExpense  = expenses.length ? Math.round(totalSpent / expenses.length) : 0
  const catCount    = [...new Set(expenses.map(e => e.category_name))].length
  const totalBudget = budgets.reduce((s, b) => s + b.monthly_limit, 0)
  const remaining   = totalBudget - totalSpent
  const recent      = expenses.slice(0, 5)

  // Payment method breakdown
  const byMethod = {}
  expenses.forEach(e => { byMethod[e.method_name] = (byMethod[e.method_name] || 0) + e.amount })

  return (
    <div className="fade-up">
      {/* Stat row */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">
            Total Spent
            <div className="stat-card-icon red">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
          </div>
          <div className="stat-card-value">{fmt(totalSpent)}</div>
          <div className="stat-card-sub">{expenses.length} transactions</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Avg per Transaction
            <div className="stat-card-icon blue">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            </div>
          </div>
          <div className="stat-card-value">{fmt(avgExpense)}</div>
          <div className="stat-card-sub">Per transaction</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Budget Remaining
            <div className="stat-card-icon green">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
          <div className="stat-card-value">{fmt(Math.max(0, remaining))}</div>
          <div className={`stat-card-sub ${remaining < 0 ? 'down' : 'up'}`}>
            {remaining < 0
              ? <><TrendDown /> Rs {fmt(Math.abs(remaining))} over budget</>
              : <><TrendUp /> Of {fmt(totalBudget)} total</>}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            Categories
            <div className="stat-card-icon purple">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </div>
          </div>
          <div className="stat-card-value">{catCount}</div>
          <div className="stat-card-sub">Active this month</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid-3-1" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-title">Spending by Category</div>
          <div style={{ height: 220 }}>
            <canvas ref={barRef} />
          </div>
        </div>
        <div className="card">
          <div className="section-title">Payment Methods</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(byMethod).map(([method, amount]) => {
              const pct = Math.round(amount / totalSpent * 100)
              return (
                <div key={method}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4b5263', marginBottom: 4 }}>
                    <span>{method}</span>
                    <span style={{ fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="budget-bar-bg">
                    <div className="budget-bar ok" style={{ width: pct + '%' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid-2">
        <div className="card">
          <div className="section-title">Daily Trend</div>
          <div style={{ height: 180 }}>
            <canvas ref={lineRef} />
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Recent Transactions</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{e.description || '—'}</div>
                    <div style={{ fontSize: 11, color: '#8a8f9d' }}>{e.expense_date}</div>
                  </td>
                  <td><span className={`badge badge-${e.category_name}`}>{e.category_name}</span></td>
                  <td className="amount-neg" style={{ textAlign: 'right' }}>- {fmt(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
