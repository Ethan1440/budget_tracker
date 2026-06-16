import './App.css'
import Home from './pages/Home';
import ManageExpenses from './pages/ManageExpenses';
import Navbar from './components/navbar';
import { Routes, Route } from 'react-router-dom';

function App() {

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manage-expenses" element={<ManageExpenses />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
