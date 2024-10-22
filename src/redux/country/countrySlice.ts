import { createSlice } from '@reduxjs/toolkit';
import { getAllCountry } from './countryThunk';
import { ICountry, ICountryState } from './countryState';

const initCountry: ICountryState = {
  countryList: []
};

const countrySlice = createSlice({
  name: 'countrySlice',
  initialState: initCountry,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getAllCountry.fulfilled, (state, action) => {
      state.countryList = action.payload as any;
    });
  }
});

export const {} = countrySlice.actions;
export const countryReducer = countrySlice.reducer;
