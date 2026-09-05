// src/components/ExpenseTable.jsx
// CS304.3 Advanced Database Management System — Group AJ
//
// Oracle notes (backend):
//   GET  /api/expenses → SELECT * FROM vw_ExpenseSummary ORDER BY expense_date DESC
//   DEL  /api/expenses/:id → DELETE FROM Expense WHERE expense_id = :id

import React, { useEffect, useState, useCallback } from 'react'
import { getExpenses, deleteExpense } from '../api/dataService'

const fmt = n => 'Rs ' + Number(n).toLocaleString()

export default function ExpenseTable({ refreshTrigger }) {
  const [expenses, setExpenses] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [sortKey,  setSortKey]  = useState('date-desc')
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getExpenses()
    setExpenses(data); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load, refreshTrigger])

  async function handleDelete(id) {
    if (!window.confirm('Delete this expense?')) return
    setDeleting(id)
    try {
      await deleteExpense(id)
      setExpenses(prev => prev.filter(e => e.id !== id))
    } finally { setDeleting(null) }
  }

  const q = search.toLowerCase()
  let rows = expenses.filter(e =>
    e.category_name.toLowerCase().includes(q) ||
    (e.description || '').toLowerCase().includes(q) ||
    e.user_name.toLowerCase().includes(q)
  )
  const [field, order] = sortKey.split('-')
  rows = [...rows].sort((a, b) => {
    if (field === 'amount') return order === 'desc' ? b.amount - a.amount : a.amount - b.amount
    return order === 'desc'
      ? b.expense_date.localeCompare(a.expense_date)
      : a.expense_date.localeCompare(b.expense_date)
  })

  if (loading) return <div className="spinner-wrap"><div className="spinner" />Loading expenses…</div>

  return (
    <div className="card fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>All Expenses</div>
        <div style={{ fontSize: 12, color: '#8a8f9d' }}>{rows.length} of {expenses.length} records</div>
      </div>

      <div className="search-row">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="search-input" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by category, description or user…" />
        </div>
        <select className="sort-select" value={sortKey} onChange={e => setSortKey(e.target.value)}>
          <option value="date-desc">Latest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>User</th>
              <th>Payment</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#8a8f9d' }}>No records found</td></tr>
            ) : rows.map(e => (
              <tr key={e.id}>
                <td><span className={`badge badge-${e.category_name}`}>{e.category_name}</span></td>
                <td style={{ maxWidth: 180 }}>
                  <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {e.description || '—'}
                  </div>
                </td>
                <td style={{ color: '#4b5263' }}>{e.user_name}</td>
                <td style={{ color: '#8a8f9d' }}>{e.method_name}</td>
                <td className="amount-neg" style={{ textAlign: 'right' }}>{fmt(e.amount)}</td>
                <td style={{ color: '#8a8f9d' }}>{e.expense_date}</td>
                <td>
                  <button className="btn-danger" onClick={() => handleDelete(e.id)} disabled={deleting === e.id}>
                    {deleting === e.id ? '…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
