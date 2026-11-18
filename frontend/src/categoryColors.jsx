import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getCategories } from './api/budgetApi';

// One color per category for the session. The list is longer than the current
// category count so a newly added category still gets its own color. After the
// last color, assignment wraps.
export const CATEGORY_COLORS = [
    '#7c5cff',
    '#3d8bfd',
    '#2fbf71',
    '#f5a524',
    '#f0616d',
    '#2ec4d6',
    '#e879f9',
    '#a3e635',
    '#fb923c',
    '#94a3b8',
    '#ff4d6d',
    '#b388ff',
    '#ffe66d',
    '#00bbf9',
];

const CATEGORY_KEY_SEPARATOR = '\u0000';

function namesOf(rows, flag) {
    const names = [];
    for (const row of rows) {
        const name = row.category;
        if (row[flag] && name && !names.includes(name)) {
            names.push(name);
        }
    }
    return names;
}

function mergeNames(current, incoming) {
    let changed = false;
    const next = [...current];
    for (const name of incoming) {
        if (!name || next.includes(name)) {
            continue;
        }
        next.push(name);
        changed = true;
    }
    return changed ? next : current;
}

// Binds a color the first time a category appears and keeps it. Later growth
// of the list only assigns colors to names that are not bound yet.
export function useCategoryColors(categoryNames) {
    const categoryKey = categoryNames.join(CATEGORY_KEY_SEPARATOR);
    const colorByNameRef = useRef(new Map());
    const nextColorIndexRef = useRef(0);
    const [colorByName, setColorByName] = useState(() => new Map());

    useEffect(() => {
        const names = categoryKey ? categoryKey.split(CATEGORY_KEY_SEPARATOR) : [];
        const colorByName = colorByNameRef.current;
        let assignedNewColor = false;
        for (const name of names) {
            if (colorByName.has(name)) {
                continue;
            }
            const colorIndex = nextColorIndexRef.current % CATEGORY_COLORS.length;
            colorByName.set(name, CATEGORY_COLORS[colorIndex]);
            nextColorIndexRef.current += 1;
            assignedNewColor = true;
        }
        if (assignedNewColor) {
            setColorByName(new Map(colorByName));
        }
    }, [categoryKey]);

    return colorByName;
}

const CategoryColorContext = createContext(null);

export function CategoryColorProvider({ children }) {
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const seededRef = useRef(false);
    const pendingIncomeRef = useRef([]);
    const pendingExpenseRef = useRef([]);
    const incomeColors = useCategoryColors(incomeCategories);
    const expenseColors = useCategoryColors(expenseCategories);

    useEffect(() => {
        let cancelled = false;
        getCategories()
            .then((rows) => {
                if (cancelled) {
                    return;
                }
                setIncomeCategories(mergeNames(namesOf(rows, 'income_category'), pendingIncomeRef.current));
                setExpenseCategories(mergeNames(namesOf(rows, 'expense_category'), pendingExpenseRef.current));
                pendingIncomeRef.current = [];
                pendingExpenseRef.current = [];
                seededRef.current = true;
            })
            .catch(() => {
                if (cancelled) {
                    return;
                }
                setIncomeCategories(mergeNames([], pendingIncomeRef.current));
                setExpenseCategories(mergeNames([], pendingExpenseRef.current));
                pendingIncomeRef.current = [];
                pendingExpenseRef.current = [];
                seededRef.current = true;
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const noteIncomeCategories = useCallback((names) => {
        if (!seededRef.current) {
            pendingIncomeRef.current = mergeNames(pendingIncomeRef.current, names);
            return;
        }
        setIncomeCategories((current) => mergeNames(current, names));
    }, []);

    const noteExpenseCategories = useCallback((names) => {
        if (!seededRef.current) {
            pendingExpenseRef.current = mergeNames(pendingExpenseRef.current, names);
            return;
        }
        setExpenseCategories((current) => mergeNames(current, names));
    }, []);

    const value = useMemo(() => ({
        colorForIncomeCategory: (name) => incomeColors.get(name),
        colorForExpenseCategory: (name) => expenseColors.get(name),
        noteIncomeCategories,
        noteExpenseCategories,
    }), [incomeColors, expenseColors, noteIncomeCategories, noteExpenseCategories]);

    return (
        <CategoryColorContext.Provider value={value}>
            {children}
        </CategoryColorContext.Provider>
    );
}

export function useCategoryColorAssignments() {
    const value = useContext(CategoryColorContext);
    if (!value) {
        throw new Error('useCategoryColorAssignments must be used within CategoryColorProvider');
    }
    return value;
}
