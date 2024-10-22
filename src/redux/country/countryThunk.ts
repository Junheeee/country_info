import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/customAxios';

export const getAllCountry = createAsyncThunk(
  'country/getAllCountry',
  async (_, thunkAPI) => {
    try {
      const data = await axios.get('all');
      console.log(data, '----data');
    } catch (error) {}
  }
);
