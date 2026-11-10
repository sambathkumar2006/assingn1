import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { API_BASE_URL } from '../utils/api.js'

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (
    { filter = '', sortCol, sortKey, page = 1, limit = 100 } = {},
    { rejectWithValue, signal },
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
      const response = await fetch(
        query ? `${API_BASE_URL}?${query}` : API_BASE_URL,
        { signal },
      )
      if (!response.ok) {
        return rejectWithValue(`Request failed with status ${response.status}`)
      }

      const result = await response.json()
      const validRows =
        Array.isArray(result.rows) &&
        result.rows.every(
          (row) =>
            row !== null &&
            typeof row === 'object' &&
            typeof row.id === 'number' &&
            typeof row.company === 'string' &&
            typeof row.contact === 'string' &&
            typeof row.country === 'string' &&
            (row.logo === undefined || typeof row.logo === 'string'),
        )
      if (!validRows || typeof result.total !== 'number') {
        return rejectWithValue('The companies API returned an invalid response.')
      }

      return { rows: result.rows, total: result.total }
    } catch (error) {
      if (signal.aborted) {
        throw error
      }

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

export const submitCompany = createAsyncThunk(
  'companies/submitCompany',
  async ({ company, contact, country, email, image }, { rejectWithValue }) => {
    const formData = new FormData()
    formData.append('company', company)
    formData.append('contact', contact)
    formData.append('country', country)
    formData.append('email', email)
    formData.append('image', image)

    try {
      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok) {
        const apiErrors = result?.errors
        const message =
          apiErrors && typeof apiErrors === 'object'
            ? Object.values(apiErrors).filter((error) => typeof error === 'string').join('. ')
            : ''
        return rejectWithValue(
  message || `Company submission failed (${response.status}).`
)
      }

      return result
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? `Unable to submit company: ${error.message}`
          : 'Unable to submit company.',
      )
    }
  },
)

export const editCompany = createAsyncThunk(
  'companies/editCompany',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/edit/${id}`, {
        method: 'PUT',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok) {
        const apiErrors = result?.errors
        const message =
          apiErrors && typeof apiErrors === 'object'
            ? Object.values(apiErrors).filter((error) => typeof error === 'string').join('. ')
            : ''
        return rejectWithValue(message || `Company update failed (${response.status}).`)
      }

      const isValidCompany =
        result !== null &&
        typeof result === 'object' &&
        result.id === Number(id) &&
        typeof result.company === 'string' &&
        typeof result.contact === 'string' &&
        typeof result.country === 'string' &&
        typeof result.email === 'string' &&
        (result.logo === undefined || typeof result.logo === 'string')
      if (!isValidCompany) {
        return rejectWithValue('The edit company API returned an invalid response.')
      }

      return result
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? `Unable to update company: ${error.message}`
          : 'Unable to update company.',
      )
    }
  },
  {
    condition: (_, { getState }) =>
      getState().companies.editStatus !== 'loading',
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
    submitStatus: 'idle',
    submitError: null,
    editStatus: 'idle',
    editError: null,
  },
  reducers: {
    clearCompanySubmission: (state) => {
      if (state.submitStatus !== 'loading') {
        state.submitStatus = 'idle'
        state.submitError = null
      }
    },
    clearCompanyEdit: (state) => {
      if (state.editStatus !== 'loading') {
        state.editStatus = 'idle'
        state.editError = null
      }
    },
  },
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

        state.status = action.meta.aborted ? 'idle' : 'failed'
        state.error = action.meta.aborted
          ? null
          : action.payload ?? action.error.message
        state.requestId = null
      })
      .addCase(submitCompany.pending, (state) => {
        state.submitStatus = 'loading'
        state.submitError = null
      })
      .addCase(submitCompany.fulfilled, (state) => {
        state.submitStatus = 'succeeded'
        state.submitError = null
      })
      .addCase(submitCompany.rejected, (state, action) => {
        state.submitStatus = 'failed'
        state.submitError = action.payload ?? action.error.message
      })
      .addCase(editCompany.pending, (state) => {
        state.editStatus = 'loading'
        state.editError = null
      })
      .addCase(editCompany.fulfilled, (state, action) => {
        state.editStatus = 'succeeded'
        state.editError = null
        const index = state.data.findIndex((company) => company.id === action.payload.id)
        if (index !== -1) {
          state.data[index] = action.payload
        }
      })
      .addCase(editCompany.rejected, (state, action) => {
        state.editStatus = 'failed'
        state.editError = action.payload ?? action.error.message
      })
  },
})

export const { clearCompanyEdit, clearCompanySubmission } = companiesSlice.actions

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
export const selectCompanySubmitStatus = (state) => state.companies.submitStatus
export const selectCompanySubmitError = (state) => state.companies.submitError
export const selectCompanyEditStatus = (state) => state.companies.editStatus
export const selectCompanyEditError = (state) => state.companies.editError

export default companiesSlice.reducer
