import {useDispatch, useSelector } from "react-redux";
import { selectCurrency } from "@/features/currency/currencySelector";
import { toggleCurrency,setCurrency,CurrencyCode } from "@/features/currency/currencySlice";
import { formatCurrency,FormatCurrencyOptions } from "@/lib/format-currency";



/**
 * One hook to rule them all.
 *
 * Usage:
 *   const { currency, fmt, toggle } = useCurrency();
 *   fmt(transaction.amount, { type: transaction.type })
 *   fmt(summary.totalIncome, { compact: true })
 */

const useCurrency = () => {
    const dispatch = useDispatch();
    const currency = useSelector(selectCurrency);
     /**
   * Format any USD value for display using the current currency preference.
   * You never need to pass `currency` manually — it's read from the store.
   */

    const fmt = (
    value: number,
    options: Omit<FormatCurrencyOptions, 'currency'> = {}
    ): string => formatCurrency(value, { ...options, currency });

    const toggle = () => dispatch(toggleCurrency());
     const set = (c: CurrencyCode) => dispatch(setCurrency(c));
 
  return { currency, fmt, toggle, set, isBDT: currency === 'BDT' };
};
 
export default useCurrency;
