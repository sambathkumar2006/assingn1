import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import companiesUrl from '../components/companies.json?url'

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(companiesUrl)
      if (!response.ok) {
        return rejectWithValue(`Request failed with status ${response.status}`)
      }

      return await response.json()
    } catch {
      return rejectWithValue('Unable to load company data.')
    }
  },
  {
    condition: (_, { getState }) => getState().companies.status !== 'loading',
  },
)

const companiesSlice = createSlice({
  name: 'companies',
  initialState: {
    data: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
  },
})

const selectCompaniesState = (state) => state.companies

export const selectCompaniesData = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.data,
)

export const selectCompaniesStatus = (state) => state.companies.status
export const selectCompaniesError = (state) => state.companies.error

export default companiesSlice.reducer