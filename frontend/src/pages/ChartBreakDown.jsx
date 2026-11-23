import { useEffect, useRef, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { getIncomeOrExpenses, splitIncomeAndExpenses } from '../api/budgetApi';
import { itemsForWindow, MONTH_NAMES, monthYearLabel, shiftMonth } from '../budgetDates';
import { useBudgetWindow } from '../budgetWindow';
import { CATEGORY_COLORS, useCategoryColorAssignments } from '../categoryColors';
import ExpenseWindowButton from '../components/expenseWindowButton';
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
const LEGEND_VISIBLE_ROWS = 8;

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

function byDescendingShare(items) {
    return [...items].sort((left, right) => Number(right.value) - Number(left.value));
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

function withCategoryColors(slices, colorForCategory) {
    return slices.map((slice) => ({
        ...slice,
        color: colorForCategory(slice.label),
    }));
}

function withSliceColors(slices) {
    return slices.map((slice, index) => ({
        ...slice,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
}

function slicesByItem(items) {
    return withSliceColors(
        items
            .filter((item) => Number(item.amount) > 0)
            .map((item) => ({
                id: item.id,
                value: Number(item.amount),
                label: item.name,
            })),
    );
}

function SliceFields({ item, showPercent, total }) {
    return (
        <>
            <span className="chart-breakdown-swatch" style={{ backgroundColor: item.color }} />
            <span className="chart-breakdown-legend-label">{item.label}</span>
            <span className="chart-breakdown-legend-amount">${formatAmount(item.value)}</span>
            {showPercent && <span className="chart-breakdown-legend-percent">{formatPercent(item.value, total)}</span>}
        </>
    );
}

function SliceList({ items, showPercent = false, onSelect, visibleRowLimit }) {
    const total = items.reduce((sum, item) => sum + Number(item.value), 0);
    const legendClass = [
        'chart-breakdown-legend',
        showPercent ? 'chart-breakdown-legend-with-percent' : '',
        visibleRowLimit ? 'chart-breakdown-legend-scroll' : '',
    ].filter(Boolean).join(' ');
    const style = visibleRowLimit ? { '--chart-breakdown-legend-rows': visibleRowLimit } : undefined;
    return (
        <ul className={legendClass} style={style}>
            {items.map((item) => (
                <li key={item.id}>
                    {onSelect ? (
                        <button type="button" className="chart-breakdown-legend-row" onClick={() => onSelect(item)}>
                            <SliceFields item={item} showPercent={showPercent} total={total} />
                        </button>
                    ) : (
                        <div className="chart-breakdown-legend-row">
                            <SliceFields item={item} showPercent={showPercent} total={total} />
                        </div>
                    )}
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

function BreakdownChart({ title, data, showPercent = false, note, chartKey, onSliceSelect, onReset, selectedCategory, legendRowLimit, sortLegend = false }) {
    const legendItems = sortLegend ? byDescendingShare(data) : data;
    return (
        <section className="chart-breakdown-panel">
            {onReset ? (
                <div className="chart-breakdown-heading">
                    <h2>{title}</h2>
                    <button type="button" className="chart-breakdown-reset" onClick={onReset}>
                        Reset
                    </button>
                </div>
            ) : (
                <h2>{title}</h2>
            )}
            {selectedCategory && <p className="chart-breakdown-selected-category">{selectedCategory}</p>}
            <div className="chart-breakdown-body">
                <PieChart
                    key={chartKey}
                    width={CHART_WIDTH}
                    height={CHART_HEIGHT}
                    hideLegend
                    skipAnimation={Boolean(chartKey)}
                    onItemClick={onSliceSelect ? (_event, itemIdentifier) => {
                        const slice = data[itemIdentifier.dataIndex];
                        if (slice) {
                            onSliceSelect(slice);
                        }
                    } : undefined}
                    series={[{
                        arcLabel: (item) => `$${formatAmount(item.value)}`,
                        arcLabelMinAngle: 20,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { color: 'gray' },
                        innerRadius: 0,
                        outerRadius: CHART_OUTER_RADIUS,
                        data,
                    }]}
                    sx={onSliceSelect ? {
                        '& .MuiPieArc-root': { cursor: 'pointer' },
                        '& .MuiPieArcLabel-root': { pointerEvents: 'none' },
                    } : undefined}
                />
                <SliceList
                    items={legendItems}
                    showPercent={showPercent}
                    onSelect={onSliceSelect}
                    visibleRowLimit={legendRowLimit}
                />
            </div>
            {note && <p className="chart-breakdown-ratio">{note}</p>}
        </section>
    );
}

function ChartBreakDown() {
    const { currentMonth, currentYear, setWindow } = useBudgetWindow();
    const {
        colorForExpenseCategory,
        colorForIncomeCategory,
        noteExpenseCategories,
        noteIncomeCategories,
    } = useCategoryColorAssignments();
    const monthLabel = monthYearLabel(currentMonth, currentYear);
    const longestMonthName = MONTH_NAMES.reduce((longest, name) => name.length > longest.length ? name : longest);
    const [expenseItems, setExpenseItems] = useState([]);
    const [expenseCategoryData, setExpenseCategoryData] = useState([]);
    const [incomeCategoryData, setIncomeCategoryData] = useState([]);
    const [selectedExpenseCategory, setSelectedExpenseCategory] = useState(null);
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
                const expensesInWindow = itemsForWindow(split.expenses, recurringExpenses, currentMonth, currentYear);
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
                noteExpenseCategories(split.expenses.map((item) => item.category));
                noteIncomeCategories(split.income.map((item) => item.category));
                setExpenseItems(expensesInWindow);
                setExpenseCategoryData(slicesByCategory(expensesInWindow));
                setIncomeCategoryData(slicesByCategory(windowIncome));
                setSelectedExpenseCategory(null);
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
    }, [currentMonth, currentYear, noteExpenseCategories, noteIncomeCategories]);

    const coloredExpenseCategories = withCategoryColors(expenseCategoryData, colorForExpenseCategory);
    const coloredIncomeCategories = withCategoryColors(incomeCategoryData, colorForIncomeCategory);
    const hasData = expenseCategoryData.length > 0 || incomeCategoryData.length > 0;
    const expenseTotal = expenseCategoryData.reduce((sum, slice) => sum + Number(slice.value), 0);
    const incomeTotal = incomeCategoryData.reduce((sum, slice) => sum + Number(slice.value), 0);
    const incomeShareBars = incomeTotal > 0 ? spendingBars(coloredExpenseCategories, incomeTotal) : [];
    const expenseChartData = selectedExpenseCategory
        ? slicesByItem(expenseItems.filter((item) => item.category === selectedExpenseCategory))
        : coloredExpenseCategories;

    return (
        <div className="chart-breakdown">
            <h1 className="chart-breakdown-month expense-window-nav">
                <ExpenseWindowButton updateState={setWindow} direction="Previous" currentMonth={currentMonth} currentYear={currentYear} />
                <span className="expense-window-month">
                    <span className="expense-window-month-sizer" aria-hidden="true">: {longestMonthName} {currentYear}</span>
                    <span className="expense-window-month-label">{monthLabel}</span>
                </span>
                <ExpenseWindowButton updateState={setWindow} direction="Next" currentMonth={currentMonth} currentYear={currentYear} />
            </h1>
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
                        <BreakdownChart
                            title="Expenses"
                            data={expenseChartData}
                            showPercent
                            sortLegend
                            chartKey={selectedExpenseCategory ?? 'overview'}
                            legendRowLimit={LEGEND_VISIBLE_ROWS}
                            selectedCategory={selectedExpenseCategory}
                            onSliceSelect={selectedExpenseCategory ? undefined : (slice) => setSelectedExpenseCategory(slice.label)}
                            onReset={selectedExpenseCategory ? () => setSelectedExpenseCategory(null) : undefined}
                        />
                    )}
                    {incomeCategoryData.length > 0 && (
                        <BreakdownChart title="Income" data={coloredIncomeCategories} showPercent />
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
