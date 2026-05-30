import { RootState } from "./../../app/store";
import { CurrencyCode } from "./currencySlice";


export const selectCurrency = (state: RootState): CurrencyCode =>
  state.currency.currency;
 
export const selectIsBDT = (state: RootState): boolean =>
  state.currency.currency === 'BDT';