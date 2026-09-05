// src/components/Budget.jsx
// CS304.3 Advanced Database Management System — Group AJ
//
// Oracle notes (backend):
//   Budget limits  → SELECT * FROM Budget JOIN Category_Table
//   Spent per cat  → fn_RemainingBudget(p_user_id, p_category_id)
//   Monthly totals → SELECT * FROM vw_MonthlyExpense

import React, { useEffect, useRef, useState } from 'react'
import { getBudgets } from '../api/dataService'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const fmt = n => 'Rs ' + Number(n).toLocaleString()

export default function Budget() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const chartRef  = useRef(null)
  const chartInst = useRef(null)

  useEffect(() => {
    getBudgets().then(data => { setBudgets(data); setLoading(false) })
  }, [])

  useEffect(() => {
    if (loading || !chartRef.current) return
    chartInst.current?.destroy()
    chartInst.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: budgets.map(b => b.category_name),
        datasets: [
          {
            label: 'Budget Limit',
            data: budgets.map(b => b.monthly_limit),
            backgroundColor: 'rgba(59,91,219,0.15)',
            borderColor: '#3b5bdb',
            borderWidth: 1.5,
            borderRadius: 4,
          },
          {
            label: 'Actual Spent',
            data: budgets.map(b => b.spent),
            backgroundColor: 'rgba(239,68,68,0.65)',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { size: 12 }, boxWidth: 12 } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#8a8f9d' } },
          y: { grid: { color: '#f0f2f5' }, ticks: { callback: v => 'Rs ' + v.toLocaleString(), font: { size: 10 }, color: '#8a8f9d' } },
        },
      },
    })
    return () => chartInst.current?.destroy()
  }, [loading, budgets])

  if (loading) return <div className="spinner-wrap"><div className="spinner" />Loading budgets…</div>

  const totalBudget = budgets.reduce((s, b) => s + b.monthly_limit, 0)
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0)
  const remaining   = totalBudget - totalSpent

  return (
    <div className="fade-up">
      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Budget</div>
          <div className="stat-card-value">{fmt(totalBudget)}</div>
          <div className="stat-card-sub">Monthly allocation</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Spent</div>
          <div className="stat-card-value" style={{ color: '#ef4444' }}>{fmt(totalSpent)}</div>
          <div className="stat-card-sub down">{Math.round(totalSpent / totalBudget * 100)}% of budget used</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Remaining</div>
          <div className="stat-card-value" style={{ color: remaining < 0 ? '#ef4444' : '#22c55e' }}>
            {fmt(Math.abs(remaining))}
          </div>
          <div className={`stat-card-sub ${remaining < 0 ? 'down' : 'up'}`}>
            {remaining < 0 ? 'Over budget' : 'Available to spend'}
          </div>
        </div>
      </div>

      {/* Budget table */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Category Budgets</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Budget Limit</th>
              <th style={{ textAlign: 'right' }}>Spent</th>
              <th style={{ textAlign: 'right' }}>Remaining</th>
              <th>Utilization</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map(b => {
              const pct   = Math.min(100, Math.round(b.spent / b.monthly_limit * 100))
              const over  = b.remaining < 0
              const warn  = pct >= 80 && !over
              const barCls  = over ? 'over' : warn ? 'warn' : 'ok'
              const pillCls = over ? 'status-over' : warn ? 'status-warn' : 'status-ok'
              const pillTxt = over ? 'Over Budget' : warn ? 'Near Limit' : 'On Track'
              return (
                <tr key={b.budget_id}>
                  <td><span className={`badge badge-${b.category_name}`}>{b.category_name}</span></td>
                  <td style={{ textAlign: 'right' }}>{fmt(b.monthly_limit)}</td>
                  <td className="amount-neg" style={{ textAlign: 'right' }}>{fmt(b.spent)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: over ? '#ef4444' : '#22c55e' }}>
                    {fmt(Math.abs(b.remaining))}
                  </td>
                  <td style={{ minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="budget-bar-bg" style={{ flex: 1 }}>
                        <div className={`budget-bar ${barCls}`} style={{ width: pct + '%' }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#8a8f9d', minWidth: 30 }}>{pct}%</span>
                    </div>
                  </td>
                  <td><span className={`status-pill ${pillCls}`}>{pillTxt}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Budget vs Actual Comparison</div>
        <div style={{ height: 260 }}>
          <canvas ref={chartRef} />
        </div>
      </div>

      {/* ── Spending Insights — Advanced Database Algorithm ──────────────────
          Z-Score anomaly detection identifies categories where spending is
          unusually high compared to the average across all categories.
          z = (x - mean) / standard deviation
          Oracle equivalent: STDDEV() OVER and AVG() OVER analytical functions
          applied to category totals from the Expense table.
      ────────────────────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="section-title">Spending Insights</div>
        <p style={{ fontSize: 12, color: '#8a8f9d', marginTop: -10, marginBottom: 16 }}>
          Categories flagged where spending is significantly higher than average
        </p>
        {(() => {
          const vals = budgets.map(b => b.spent)
          const mean = vals.reduce((a, c) => a + c, 0) / vals.length
          const stddev = Math.sqrt(
            vals.map(v => (v - mean) ** 2).reduce((a, c) => a + c, 0) / vals.length
          ) || 1
          const scored = budgets.map(b => ({
            ...b,
            zScore: +((b.spent - mean) / stddev).toFixed(2),
          })).sort((a, b) => b.zScore - a.zScore)
          const flagged = scored.filter(s => s.zScore > 1)

          return (
            <>
              {flagged.length === 0 ? (
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: 8, padding: '12px 14px',
                  color: '#16a34a', fontSize: 13,
                }}>
                  No unusual spending detected — all categories are within normal range.
                </div>
              ) : flagged.map(s => (
                <div key={s.budget_id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 8,
                }}>
                  <div>
                    <span className={`badge badge-${s.category_name}`}>{s.category_name}</span>
                    <span style={{ fontSize: 12, color: '#7f1d1d', marginLeft: 10 }}>
                      Spending is significantly above average
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }}>
                    Z-Score: {s.zScore}
                  </span>
                </div>
              ))}
              <div className="db-note" style={{ marginTop: 12 }}>
                Calculated using Z-Score analysis on category spend totals — a statistical
                technique to detect outliers relative to the mean
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
