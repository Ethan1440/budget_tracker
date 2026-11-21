import './App.css'
import Home from './pages/Home';
import Login from './pages/Login';
import ManageExpenses from './pages/ManageExpenses';
import Navbar from './components/navbar';
import ChartBreakDown from './pages/ChartBreakDown';
import { BudgetWindowProvider } from './budgetWindow';
import { CategoryColorProvider } from './categoryColors';
import { Routes, Route } from 'react-router-dom';
import SavingsGoal from './pages/savingsGoal';

let isLoggedIn = true; //testing logged in state and pages displayed as a result.

function App() {
    //This looks like where I would place the login page
    if (isLoggedIn === true) {
      return (
        <BudgetWindowProvider>
        <CategoryColorProvider>
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
        </CategoryColorProvider>
      </BudgetWindowProvider>
      )
    }

    else {
      return (
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      )
    }
}

export default App
