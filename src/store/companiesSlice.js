import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

const companiesUrl = 'http://localhost:8080/api'

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async ({ filter = '', sortCol, sortKey, limit } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (limit) {
        params.set('limit', String(limit))
      }

      if (filter.trim()) {
        params.set('filter', filter)
      }
      if (sortCol) {
        params.set('sortCol', sortCol)
        params.set('sortKey', sortKey)
      }

      const query = params.toString()
      const response = await fetch(query ? `${companiesUrl}?${query}` : companiesUrl)
      if (!response.ok) {
        return rejectWithValue(`Request failed with status ${response.status}`)
      }

      const result = await response.json()
      if (!Array.isArray(result.rows)) {
        return rejectWithValue('The companies API returned an invalid response.')
      }

      return result.rows
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? `Unable to load company data: ${error.message}`
          : 'Unable to load company data.',
      )
    }
  },
)

const companiesSlice = createSlice({
  name: 'companies',
  initialState: {
    data: [],
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

        state.status = 'succeeded'
        state.data = action.payload
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

export default companiesSlice.reducer