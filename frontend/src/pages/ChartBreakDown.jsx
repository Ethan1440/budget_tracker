import { useEffect, useRef, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { getIncomeOrExpenses, splitIncomeAndExpenses } from '../api/budgetApi';
import { itemsForWindow, monthYearLabel, shiftMonth } from '../budgetDates';
import { useBudgetWindow } from '../budgetWindow';

const SLICE_COLORS = ['#7c5cff', '#3d8bfd', '#2fbf71', '#f5a524', '#f0616d', '#2ec4d6', '#e879f9', '#a3e635', '#fb923c', '#94a3b8'];
const CHART_WIDTH = 180;
const CHART_HEIGHT = 170;
const CHART_OUTER_RADIUS = 68;
const BAR_COLUMN_WIDTH = 84;
const BAR_CHART_HEIGHT = 240;
const SAVINGS_MONTH_COUNT = 3;
const SAVINGS_CHART_HEIGHT = 260;
const SAVINGS_AXIS_HEADROOM = 1.25;
const SAVINGS_COLOR = '#22c55e';
const LOSS_COLOR = '#ef4444';

function sumAmounts(items) {
    return items.reduce((total, item) => total + Number(item.amount), 0);
}

const PERCENT_FRACTION_DIGITS = 1;

function formatAmount(value) {
    return Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatSignedAmount(value) {
    const amount = `$${formatAmount(Math.abs(value))}`;
    return value < 0 ? `-${amount}` : amount;
}

function savingsAxis(months) {
    const peak = Math.max(...months.map((month) => Math.abs(month.saved)), 0);
    const limit = peak === 0 ? 1 : peak * SAVINGS_AXIS_HEADROOM;
    const hasLoss = months.some((month) => month.saved < 0);
    if (hasLoss) {
        return { min: -limit, max: limit };
    }
    return { min: 0, max: limit };
}

function formatPercentNumber(percent) {
    return `${Number(percent).toLocaleString('en-US', {
        minimumFractionDigits: PERCENT_FRACTION_DIGITS,
        maximumFractionDigits: PERCENT_FRACTION_DIGITS,
    })}%`;
}

function formatPercent(value, total) {
    if (total <= 0) {
        return '0%';
    }
    return formatPercentNumber((Number(value) / total) * 100);
}

function spendingBars(expenseSlices, incomeTotal) {
    return expenseSlices
        .map((slice) => ({
            label: slice.label,
            amount: slice.value,
            percent: (Number(slice.value) / incomeTotal) * 100,
            color: slice.color,
        }))
        .sort((left, right) => right.percent - left.percent);
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

function withSliceColors(slices) {
    return slices.map((slice, index) => ({
        ...slice,
        color: SLICE_COLORS[index % SLICE_COLORS.length],
    }));
}

function SliceList({ items, showPercent = false }) {
    const total = items.reduce((sum, item) => sum + Number(item.value), 0);
    const legendClass = showPercent ? 'chart-breakdown-legend chart-breakdown-legend-with-percent' : 'chart-breakdown-legend';
    return (
        <ul className={legendClass}>
            {items.map((item) => (
                <li key={item.id}>
                    <span className="chart-breakdown-swatch" style={{ backgroundColor: item.color }} />
                    <span className="chart-breakdown-legend-label">{item.label}</span>
                    <span className="chart-breakdown-legend-amount">${formatAmount(item.value)}</span>
                    {showPercent && <span className="chart-breakdown-legend-percent">{formatPercent(item.value, total)}</span>}
                </li>
            ))}
        </ul>
    );
}

function expenseToIncomeLabel(expenseTotal, incomeTotal) {
    if (incomeTotal <= 0) {
        return 'No income to compare';
    }
    return `Expenses are ${formatPercent(expenseTotal, incomeTotal)} of total income.`;
}

function SpendingBarChart({ bars, note }) {
    const scrollerRef = useRef(null);
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
        const element = scrollerRef.current;
        if (!element) {
            return undefined;
        }
        const updateWidth = () => setViewportWidth(element.clientWidth);
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const chartWidth = Math.max(viewportWidth, bars.length * BAR_COLUMN_WIDTH);

    return (
        <section className="chart-breakdown-panel">
            <h2>Expenses as a Share of Income</h2>
            <div className="chart-breakdown-bar-scroll" ref={scrollerRef}>
                {viewportWidth > 0 && bars.length > 0 && (
                    <BarChart
                        width={chartWidth}
                        height={BAR_CHART_HEIGHT}
                        hideLegend
                        margin={{ top: 32, right: 8, bottom: 36, left: 48 }}
                        xAxis={[{
                            scaleType: 'band',
                            data: bars.map((bar) => bar.label),
                            tickLabelStyle: { fill: '#fff', fontSize: 12 },
                        }]}
                        yAxis={[{
                            tickLabelStyle: { fill: '#fff', fontSize: 12 },
                            valueFormatter: (value) => `${Math.round(value)}%`,
                        }]}
                        series={[{
                            data: bars.map((bar) => bar.percent),
                            label: 'Spent',
                            colorGetter: ({ dataIndex }) => bars[dataIndex].color,
                            barLabel: (item) => (item.value == null ? '' : formatPercentNumber(item.value)),
                            barLabelPlacement: 'outside',
                            valueFormatter: (_value, context) => `$${formatAmount(bars[context.dataIndex].amount)}`,
                        }]}
                        sx={{
                            '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': {
                                stroke: '#9ca3af',
                            },
                        }}
                    />
                )}
            </div>
            {note && <p className="chart-breakdown-ratio">{note}</p>}
        </section>
    );
}

function SavingsBarChart({ months }) {
    const chartRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(0);
    const axis = savingsAxis(months);

    useEffect(() => {
        const element = chartRef.current;
        if (!element) {
            return undefined;
        }
        const updateWidth = () => setChartWidth(element.clientWidth);
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="chart-breakdown-panel chart-breakdown-savings">
            <h2>Savings</h2>
            <div className="chart-breakdown-savings-chart" ref={chartRef}>
                {chartWidth > 0 && (
                    <BarChart
                        width={chartWidth}
                        height={SAVINGS_CHART_HEIGHT}
                        hideLegend
                        margin={{ top: 32, right: 16, bottom: 36, left: 16 }}
                        xAxis={[{
                            scaleType: 'band',
                            data: months.map((month) => month.label),
                            tickLabelStyle: { fill: '#fff', fontSize: 12 },
                        }]}
                        yAxis={[{
                            width: 'auto',
                            min: axis.min,
                            max: axis.max,
                            tickLabelStyle: { fill: '#fff', fontSize: 12 },
                            valueFormatter: (value) => formatSignedAmount(value),
                        }]}
                        series={[{
                            data: months.map((month) => month.saved),
                            label: 'Saved',
                            colorGetter: ({ value }) => (value < 0 ? LOSS_COLOR : SAVINGS_COLOR),
                            barLabel: (item) => (item.value == null ? '' : formatSignedAmount(item.value)),
                            barLabelPlacement: 'outside',
                            valueFormatter: (value) => formatSignedAmount(value),
                        }]}
                        sx={{
                            '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': {
                                stroke: '#9ca3af',
                            },
                        }}
                    />
                )}
            </div>
        </section>
    );
}

function BreakdownChart({ title, data, showPercent = false, note }) {
    return (
        <section className="chart-breakdown-panel">
            <h2>{title}</h2>
            <div className="chart-breakdown-body">
                <PieChart
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                    hideLegend
                    series={[{
                        arcLabel: (item) => `$${formatAmount(item.value)}`,
                        arcLabelMinAngle: 20,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { color: 'gray' },
                        innerRadius: 0,
                        outerRadius: CHART_OUTER_RADIUS,
                        data,
                    }]}
                />
                <SliceList items={data} showPercent={showPercent} />
            </div>
            {note && <p className="chart-breakdown-ratio">{note}</p>}
        </section>
    );
}

function ChartBreakDown() {
    const { currentMonth, currentYear } = useBudgetWindow();
    const monthLabel = monthYearLabel(currentMonth, currentYear);
    const [expenseCategoryData, setExpenseCategoryData] = useState([]);
    const [incomeCategoryData, setIncomeCategoryData] = useState([]);
    const [savingsMonths, setSavingsMonths] = useState([]);
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
                const recurringExpenses = split.expenses.filter((item) => item.recurring);
                const recurringIncome = split.income.filter((item) => item.recurring);
                const windowExpenses = itemsForWindow(split.expenses, recurringExpenses, currentMonth, currentYear);
                const windowIncome = itemsForWindow(split.income, recurringIncome, currentMonth, currentYear);
                const months = Array.from({ length: SAVINGS_MONTH_COUNT }, (_, index) => {
                    const shifted = shiftMonth(currentMonth, currentYear, index - (SAVINGS_MONTH_COUNT - 1));
                    const expenses = itemsForWindow(split.expenses, recurringExpenses, shifted.month, shifted.year);
                    const income = itemsForWindow(split.income, recurringIncome, shifted.month, shifted.year);
                    return {
                        label: monthYearLabel(shifted.month, shifted.year),
                        saved: sumAmounts(income) - sumAmounts(expenses),
                    };
                });
                setExpenseCategoryData(withSliceColors(slicesByCategory(windowExpenses)));
                setIncomeCategoryData(withSliceColors(slicesByCategory(windowIncome)));
                setSavingsMonths(months);
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

    const hasData = expenseCategoryData.length > 0 || incomeCategoryData.length > 0;
    const expenseTotal = expenseCategoryData.reduce((sum, slice) => sum + Number(slice.value), 0);
    const incomeTotal = incomeCategoryData.reduce((sum, slice) => sum + Number(slice.value), 0);
    const incomeShareBars = incomeTotal > 0 ? spendingBars(expenseCategoryData, incomeTotal) : [];

    return (
        <div className="chart-breakdown">
            <h1 className="chart-breakdown-month">{monthLabel}</h1>
            {loadError && <p className="chart-breakdown-message">{loadError}</p>}
            {!loadError && !hasData && (
                <p className="chart-breakdown-message">No income or expenses for this month.</p>
            )}
            {hasData && (
                <div className="chart-breakdown-charts">
                    {expenseCategoryData.length > 0 && (
                        <SpendingBarChart
                            bars={incomeShareBars}
                            note={expenseToIncomeLabel(expenseTotal, incomeTotal)}
                        />
                    )}
                    {expenseCategoryData.length > 0 && (
                        <BreakdownChart title="Expenses" data={expenseCategoryData} showPercent />
                    )}
                    {incomeCategoryData.length > 0 && (
                        <BreakdownChart title="Income" data={incomeCategoryData} showPercent />
                    )}
                </div>
            )}
            {!loadError && savingsMonths.length > 0 && (
                <SavingsBarChart months={savingsMonths} />
            )}
        </div>
    );
}

export default ChartBreakDown;
