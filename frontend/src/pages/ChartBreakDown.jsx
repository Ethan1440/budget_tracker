import { useEffect, useState } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { getIncomeOrExpenses, splitIncomeAndExpenses } from '../api/budgetApi';
import { itemsForWindow } from '../budgetDates';

function sumAmounts(items) {
    return items.reduce((total, item) => total + Number(item.amount), 0);
}

function slicesByCategory(items) {
    const totals = new Map();
    for (const item of items) {
        totals.set(item.category, (totals.get(item.category) ?? 0) + Number(item.amount));
    }
    return [...totals.entries()]
        .filter(([, value]) => value > 0)
        .map(([label, value], id) => ({ id, value, label }));
}

function ChartBreakDown() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthLabel = today.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const [overviewData, setOverviewData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let cancelled = false;
        async function loadChart() {
            try {
                const items = await getIncomeOrExpenses();
                if (cancelled) {
                    return;
                }
                const split = splitIncomeAndExpenses(items);
                const windowExpenses = itemsForWindow(
                    split.expenses,
                    split.expenses.filter((item) => item.recurring),
                    currentMonth,
                    currentYear,
                );
                const windowIncome = itemsForWindow(
                    split.income,
                    split.income.filter((item) => item.recurring),
                    currentMonth,
                    currentYear,
                );
                const expenseTotal = sumAmounts(windowExpenses);
                const incomeTotal = sumAmounts(windowIncome);
                const overview = [
                    { id: 0, value: expenseTotal, label: 'Expense' },
                    { id: 1, value: incomeTotal, label: 'Income' },
                ].filter((slice) => slice.value > 0);
                const categories = slicesByCategory(windowExpenses);
                if (incomeTotal > 0) {
                    categories.push({ id: categories.length, value: incomeTotal, label: 'Income' });
                }
                setOverviewData(overview);
                setCategoryData(categories);
                setLoadError('');
            } catch (error) {
                if (!cancelled) {
                    setLoadError(error.message);
                }
            }
        }
        loadChart();
        return () => {
            cancelled = true;
        };
    }, [currentMonth, currentYear]);

    const pieSeries = (data) => ({
        arcLabel: (item) => `${item.value}`,
        highlightScope: { fade: 'global', highlight: 'item' },
        faded: { color: 'gray' },
        outerRadius: 100,
        data,
    });

    return (
        <div className="chart-breakdown">
            <p>{monthLabel}</p>
            {loadError && <p>{loadError}</p>}
            {!loadError && overviewData.length === 0 && categoryData.length === 0 && (
                <p>No income or expenses for this month.</p>
            )}
            {overviewData.length > 0 && (
                <PieChart
                    width={500}
                    height={500}
                    series={[pieSeries(overviewData)]}
                />
            )}
            {categoryData.length > 0 && (
                <PieChart
                    width={500}
                    height={500}
                    series={[pieSeries(categoryData)]}
                />
            )}
        </div>
    )
}

export default ChartBreakDown;
