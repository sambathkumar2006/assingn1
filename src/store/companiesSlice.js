import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { API_BASE_URL } from '../utils/api.js'

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (
    { filter = '', sortCol, sortKey, page = 1, limit = 100 } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('page', String(page))
      if (filter.trim()) {
        params.set('filter', filter)
      }
      if (sortCol) {
        params.set('sortCol', sortCol)
        params.set('sortKey', sortKey)
      }

      const query = params.toString()
      const response = await fetch(query ? `${API_BASE_URL}?${query}` : API_BASE_URL)
      if (!response.ok) {
        return rejectWithValue(`Request failed with status ${response.status}`)
      }

      const result = await response.json()
      if (!Array.isArray(result.rows) || typeof result.total !== 'number') {
        return rejectWithValue('The companies API returned an invalid response.')
      }

      return { rows: result.rows, total: result.total }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? `Unable to load company data: ${error.message}`
          : 'Unable to load company data.',
      )
    }
  },
  {
    condition: ({ page = 1 } = {}, { getState }) =>
      page === 1 || getState().companies.status !== 'loading',
  },
)

const companiesSlice = createSlice({
  name: 'companies',
  initialState: {
    data: [],
    total: 0,
    page: 0,
    status: 'idle',
    error: null,
    requestId: null,
    hasLoaded: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.requestId = action.meta.requestId
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) {
          return
        }

        const page = action.meta.arg?.page ?? 1
        state.status = 'succeeded'
        state.data =
          page === 1
            ? action.payload.rows
            : [...state.data, ...action.payload.rows]
        state.total = action.payload.total
        state.page = page
        state.requestId = null
        state.hasLoaded = true
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) {
          return
        }

        state.status = 'failed'
        state.error = action.payload ?? action.error.message
        state.requestId = null
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
export const selectCompaniesLoaded = (state) => state.companies.hasLoaded
export const selectCompaniesPage = (state) => state.companies.page
export const selectCompaniesTotal = (state) => state.companies.total

export default companiesSlice.reducer
