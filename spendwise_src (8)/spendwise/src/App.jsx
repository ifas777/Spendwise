// src/App.jsx
// CS304.3 Advanced Database Management System — Group AJ

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar     from './components/Navbar'
import Home       from './pages/Home'
import Expenses   from './pages/Expenses'
import BudgetPage from './pages/BudgetPage'
import './styles/global.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budget"   element={<BudgetPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
