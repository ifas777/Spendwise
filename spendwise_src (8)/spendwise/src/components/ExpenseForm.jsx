// src/components/ExpenseForm.jsx
// CS304.3 Advanced Database Management System — Group AJ
//
// Oracle notes (backend):
//   POST /api/expenses → calls sp_AddExpense stored procedure
//   BEFORE INSERT trigger trg_CheckBudgetLimit fires automatically
//   raises ORA-20001 if budget limit exceeded
//   Dropdown data from: GET /api/users, /api/categories, /api/paymethods

import React, { useState } from 'react'
import { addExpense, CATEGORIES, PAY_METHODS, USERS } from '../api/dataService'

export default function ExpenseForm({ onExpenseAdded }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    user_id: '', category_id: '', pay_method_id: '',
    amount: '', expense_date: today, description: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.user_id || !form.category_id || !form.pay_method_id || !form.amount) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }
    setLoading(true); setMessage(null)
    try {
      await addExpense(form)
      setMessage({ type: 'success', text: 'Expense recorded successfully.' })
      setForm({ user_id: '', category_id: '', pay_method_id: '', amount: '', expense_date: today, description: '' })
      if (onExpenseAdded) onExpenseAdded()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      const text = err?.response?.data?.message || err.message || 'Something went wrong.'
      setMessage({ type: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card fade-up">
      <div className="section-title">Add New Expense</div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>User *</label>
            <select name="user_id" value={form.user_id} onChange={handleChange} required>
              <option value="">Select user</option>
              {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Payment Method *</label>
            <select name="pay_method_id" value={form.pay_method_id} onChange={handleChange} required>
              <option value="">Select method</option>
              {PAY_METHODS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Amount (Rs) *</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange}
              placeholder="0.00" min="1" step="0.01" required />
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" name="expense_date" value={form.expense_date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description <span style={{ fontWeight: 400, color: '#8a8f9d' }}>(optional)</span></label>
            <input type="text" name="description" value={form.description} onChange={handleChange}
              placeholder="e.g. Lunch at restaurant" />
          </div>
        </div>

        {message && (
          <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>
            {message.text}
          </div>
        )}

        <button type="submit" className="btn-primary btn-primary-full" disabled={loading}>
          {loading
            ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Adding…</>
            : 'Add Expense'}
        </button>
      </form>
    </div>
  )
}
