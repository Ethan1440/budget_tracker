import AddItemButton from '../components/addItemButton';

function ManageExpenses() {

    //States to store user data
    //Users have the ability to add income/expense items to state. All items must have an associated category.
    const [expenses, setExpenses] = useState([]) //State to store list of user expenses. Each expense is an object with the following properties: { name: string, category: string, amount: number }
    const [income, setIncome] = useState([]) //State to store list of user income. Each income is an object with the following properties: { name: string, category: string, amount: number }
    const [userCategories, setUserCategories] = useState(['Housing', 'Auto', 'Groceries', 'Social', 'Entertainment', 'Other']) //State to store list of user categories. Each category is an object with the following properties: { name: string, color: string }

    //Function will add an expense or income item to the state based on the type parameter.
    const addExpense_addIncome = (type, name, amount, category) => {
        //validate that category exists in userCategories
        if (!userCategories.includes(category)) {
            alert('Category does not exist. Please add the category to the list of user categories.');
            return;
        }

        if (type === 'expense') {
            setExpenses([...expenses, { name, amount, category }]); //...expenses is the state of expenses before the new expense is added. then the update function is called and the new item added to the state var.
        } else if (type === 'income') {
            setIncome([...income, { name, amount, category }]);
        } else {
            alert('Invalid type. Please use "expense" or "income".');
            return;
        }
    } //end addExpense_addIncomes

    //remove items by name
    const removeExpense_removeIncome = (type, name) => {
        if (type === 'expense') {
            setExpenses(expenses.filter(expense => expense.name !== name));
        } else if (type === 'income') {
            setIncome(income.filter(income => income.name !== name));
        } else {
            alert('Invalid type. Please use "expense" or "income".');
            return;
        }
    } //end removeExpense_removeIncome

    const addCategory = (category) => {
        setUserCategories([...userCategories, category]);
    }

    const removeCategory = (category) => {
        setUserCategories(userCategories.filter(cat => cat !== category)); //filter out the category to remove from the list.
    }


    return (
        <div className="manage-expenses">
            <div className="manage-expenses-header">
                <h1>Manage Expenses</h1>
            </div>
            <div className="manage-expenses-columns">
                <section className="manage-expenses-column expenses-column">
                    <h2>Expenses</h2>
                    <AddItemButton type="expense" />
                    <ul className="expenses-list"></ul>
                </section>
                <section className="manage-expenses-column income-column">
                    <h2>Income</h2>
                    <AddItemButton type="income" />
                    <ul className="income-list">
                        <li></li>
                    </ul>
                </section>
            </div>
        </div>
    )
}

export default ManageExpenses;
