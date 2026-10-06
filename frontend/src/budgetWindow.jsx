import { createContext, useContext, useMemo, useState } from 'react';

const BudgetWindowContext = createContext(null);

export function BudgetWindowProvider({ children }) {
    const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

    const value = useMemo(() => ({
        currentMonth,
        currentYear,
        setWindow(month, year) {
            setCurrentMonth(month);
            setCurrentYear(year);
        },
    }), [currentMonth, currentYear]);

    return (
        <BudgetWindowContext.Provider value={value}>
            {children}
        </BudgetWindowContext.Provider>
    );
}

export function useBudgetWindow() {
    const value = useContext(BudgetWindowContext);
    if (!value) {
        throw new Error('useBudgetWindow must be used within BudgetWindowProvider');
    }
    return value;
}
