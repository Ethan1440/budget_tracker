import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/">Home</Link>
            <Link to="/manage-expenses">Manage Expenses</Link>
            <Link to="/monthly-budget">View Monthly Budget</Link>
            <Link to="/agent-assistant">Agent Assistant</Link>
        </nav>
    )
}

export default Navbar;