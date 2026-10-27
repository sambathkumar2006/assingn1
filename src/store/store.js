import { configureStore } from '@reduxjs/toolkit'
import companiesReducer from './companiesSlice.js'

export const store = configureStore({
  reducer: {
    companies: companiesReducer,
  },
})