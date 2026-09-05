// src/components/Navbar.jsx
// CS304.3 Advanced Database Management System — Group AJ

import React from 'react'
import { NavLink } from 'react-router-dom'

const DashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const ExpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="16" y2="17"/>
  </svg>
)
const BudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
)

export default function Navbar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">SpendWise</div>
        <div className="sidebar-brand-sub">Expense Tracker</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-label">Main</div>

        <NavLink to="/" end className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <DashIcon /><span>Dashboard</span>
        </NavLink>

        <NavLink to="/expenses" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <ExpIcon /><span>Expenses</span>
        </NavLink>

        <NavLink to="/budget" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
          <BudIcon /><span>Budget</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        Group AJ · CS304.3
      </div>
    </aside>
  )
}
