import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#5834eb' }} className="navbar">
            <Link to="/">Home</Link>
            <Link to="/manage-expenses">Manage Expenses</Link>
            <Link to="/monthly-budget">View Monthly Budget</Link>
            <Link to="/agent-assistant">Agent Assistant</Link>
        </nav>
    )
}

export default Navbar;