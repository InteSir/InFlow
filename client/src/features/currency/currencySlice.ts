import {createSlice,PayloadAction}  from "@reduxjs/toolkit";

export type CurrencyCode = 'USD'|'BDT';

interface CurrencyStatus {
    currency:CurrencyCode;
}

const initialState:CurrencyStatus = {
    currency:'BDT',
};

const currencySlice = createSlice({
    name:"currency",
    initialState,
    reducers:{
        setCurrency(state,action:PayloadAction<CurrencyCode>){
            state.currency = action.payload;
        },
        toggleCurrency(state){
            state.currency = state.currency === "USD" ? "BDT" : "USD";
        },
    },
});


export const {setCurrency,toggleCurrency} = currencySlice.actions;

export default currencySlice.reducer;