import { createSlice } from '@reduxjs/toolkit';
import { getAllCountry } from './countryThunk';

export {};

const countrySlice = createSlice({
  name: 'countrySlice',
  initialState: {},
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getAllCountry.fulfilled, (state, action) => {
      const data = action.payload;
    });
  }
});

export const countryReducer = countrySlice.reducer;
