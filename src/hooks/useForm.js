import { useCallback, useMemo, useState } from 'react'

/**
 * Validates a single field value against its validation rules
 * @param {Object} field - Field configuration object
 * @param {any} value - Current field value
 * @param {Object} allValues - All current form values
 * @returns {string} Error message, or empty string if valid
 */
function validateField(field, value, allValues) {
  if (!field.validations) return ''

  const rules = Array.isArray(field.validations)
    ? field.validations
    : [field.validations]

  for (const rule of rules) {
    if (typeof rule === 'function') {
      const result = rule(value, allValues)
      if (typeof result === 'string' && result.trim().length > 0) {
        return result
      }
      if (result === false) {
        return `${field.label || field.id} is invalid.`
      }
    } else if (rule && typeof rule === 'object') {
      if (rule.required) {
        const isEmpty =
          value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim().length === 0)
        if (isEmpty) {
          return rule.message || `${field.label || field.id} is required.`
        }
      }
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value.trim())) {
          return rule.message || `${field.label || field.id} format is invalid.`
        }
      }
      if (typeof rule.validator === 'function') {
        const result = rule.validator(value, allValues)
        if (typeof result === 'string' && result.trim().length > 0) {
          return result
        }
        if (result === false) {
          return rule.message || `${field.label || field.id} is invalid.`
        }
      }
    }
  }

  return ''
}

/**
 * Custom hook for form state management and schema-based validations
 * @param {Array<Object>|Object} formStructure - Array of field configs containing { id, validations, initialValue }
 * @returns {Object} { values, valuesSetter, errors, isValid, touched, setTouched, resetForm }
 */
export function useForm(formStructure) {
  // Normalize form structure to an array of field configuration objects
  const fields = useMemo(() => {
    if (Array.isArray(formStructure)) {
      return formStructure
    }
    if (formStructure && typeof formStructure === 'object') {
      return Object.entries(formStructure).map(([key, config]) => ({
        id: config.id || key,
        ...config,
      }))
    }
    return []
  }, [formStructure])

  // Compute initial form values
  const getInitialValues = useCallback(() => {
    const initial = {}
    fields.forEach((field) => {
      initial[field.id] =
        field.initialValue !== undefined ? field.initialValue : ''
    })
    return initial
  }, [fields])

  const [values, setValues] = useState(getInitialValues)

  const [touched, setTouched] = useState(() => {
    const initial = {}
    fields.forEach((field) => {
      initial[field.id] = false
    })
    return initial
  })

  /**
   * Flexible setter for form values supporting:
   * 1. valuesSetter('fieldId', value)
   * 2. valuesSetter({ fieldId: value, ... })
   * 3. valuesSetter(prev => ({ ...prev, ... }))
   */
  const valuesSetter = useCallback((arg1, arg2) => {
    if (typeof arg1 === 'string') {
      setValues((prev) => ({
        ...prev,
        [arg1]: typeof arg2 === 'function' ? arg2(prev[arg1]) : arg2,
      }))
    } else if (typeof arg1 === 'function') {
      setValues(arg1)
    } else if (arg1 && typeof arg1 === 'object') {
      setValues((prev) => ({ ...prev, ...arg1 }))
    }
  }, [])

  // Calculate validation errors for all fields
  const errors = useMemo(() => {
    const errs = {}
    fields.forEach((field) => {
      errs[field.id] = validateField(field, values[field.id], values)
    })
    return errs
  }, [fields, values])

  // Overall form validity boolean
  const isValid = useMemo(() => {
    return Object.values(errors).every((error) => !error)
  }, [errors])

  // Reset form back to initial state
  const resetForm = useCallback(() => {
    setValues(getInitialValues())
    setTouched(() => {
      const initial = {}
      fields.forEach((field) => {
        initial[field.id] = false
      })
      return initial
    })
  }, [fields, getInitialValues])

  return {
    values,
    valuesSetter,
    setValues: valuesSetter,
    errors,
    isValid,
    touched,
    setTouched,
    resetForm,
  }
}

export default useForm

