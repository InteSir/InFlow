import { CurrencyCode } from "@/features/currency/currencySlice";

const USD_TO_BDT = 122;

export interface FormatCurrencyOptions {
  currency?: CurrencyCode;
  type?: 'EXPENSE' | 'INCOME';
  decimalPlaces?: number;
  compact?: boolean;
  showSign?: boolean;
}

export const formatCurrency = (value: number,
  options: FormatCurrencyOptions = {}
):string => {
  const { currency = 'USD', type="INCOME", decimalPlaces = 2, compact = false, showSign = false } = options;

  const convertedValue = currency === "BDT" ? value * USD_TO_BDT : value;
  const absValue = Math.abs(convertedValue);


  const sign = showSign
    ? type === 'EXPENSE' ? '-' : '+'
    : '';
// ── BDT custom format ──────────────────────────────────────────────────────
  if (currency === 'BDT') {
    if (compact) {
      if (absValue >= 10_000_000)
        return `${sign}${(absValue / 10_000_000).toFixed(2)} Cr Tk`;
      if (absValue >= 100_000)
        return `${sign}${(absValue / 100_000).toFixed(2)} Lac Tk`;
      
    }
    return `${sign}${absValue.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    })} Tk`;
  }
  
  return new Intl.NumberFormat(
    'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    notation:'standard',
    //signDisplay: showSign  ? 'always' : isExpense ? 'always' : 'auto',
    signDisplay: showSign ? 'always' : 'auto',
  }).format(type === 'EXPENSE' ? -absValue : absValue);
};
//Convert a user-entered BDT amount back to USD before sending to the API.

export const bdtToUsd = (bdtValue:number):number=>{
  return Number((bdtValue / USD_TO_BDT).toFixed(2));
}

/**
 * Convert a USD value to BDT for display only.
 */
export const usdToBdt = (usdValue: number): number => {
  return Number((usdValue * USD_TO_BDT).toFixed(2));
};