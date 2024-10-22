import { combineReducers } from '@reduxjs/toolkit';
import { countryReducer } from './country/countrySlice';

const rootReducer = (state: any, action: any) => {
  const combineReducer = combineReducers({
    countryState: countryReducer
  });
  return combineReducer(state, action);
};

export default rootReducer;
