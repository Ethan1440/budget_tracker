import './App.css'
import Home from './pages/Home';
import ManageExpenses from './pages/ManageExpenses';
import Navbar from './components/navbar';
import ChartBreakDown from './pages/ChartBreakDown';
import { BudgetWindowProvider } from './budgetWindow';
import { Routes, Route } from 'react-router-dom';
import SavingsGoal from './pages/savingsGoal';

function App() {

  return (
    <BudgetWindowProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manage-expenses" element={<ManageExpenses />} />
            <Route path="/chart-breakdown" element={<ChartBreakDown />} />
            <Route path="/savings-goal-tracker" element={<SavingsGoal />} />
          </Routes>
        </main>
      </div>
    </BudgetWindowProvider>
  )
}

export default App
