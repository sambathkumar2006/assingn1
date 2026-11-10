import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import useForm from '../hooks/useForm.js'
import {
  clearCompanySubmission,
  selectCompanyEditError,
  selectCompanyEditStatus,
  selectCompanySubmitError,
  selectCompanySubmitStatus,
  submitCompany,
} from '../store/companiesSlice.js'
import { countries, countryOptions } from '../utils/countries.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_LOGO_TYPES = ['image/jpeg', 'image/png']
const VALID_LOGO_EXTENSIONS = /\.(jpe?g|png)$/i

// Form structure containing field ids, initial values, and validations
const FORM_STRUCTURE = [
  {
    id: 'company',
    label: 'Company',
    initialValue: '',
    validations: [
      (value) => (!value || !value.trim() ? 'Company name is required.' : ''),
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    initialValue: '',
    validations: [
      (value) => (!value || !value.trim() ? 'Contact name is required.' : ''),
    ],
  },
  {
    id: 'country',
    label: 'Country',
    initialValue: '',
    validations: [
      (value) => {
        if (!value) return 'Please select a valid 3-letter ISO country.'
        if (value.length !== 3 || !/^[A-Z]{3}$/.test(value) || !countries[value]) {
          return 'Please select a valid 3-letter ISO country.'
        }
        return ''
      },
    ],
  },
  {
    id: 'email',
    label: 'Email',
    initialValue: '',
    validations: [
      (value) => {
        if (!value || !value.trim()) return 'Email address is required.'
        if (!EMAIL_REGEX.test(value.trim())) {
          return 'Please enter a valid email address (e.g. contact@example.com).'
        }
        return ''
      },
    ],
  },
  {
    id: 'logo',
    label: 'Logo',
    initialValue: null,
    validations: [
      (value) => {
        if (!value) return 'Company logo is required.'
        if (typeof value === 'string') return ''
        const isTypeValid = VALID_LOGO_TYPES.includes(value.type)
        const isExtValid = VALID_LOGO_EXTENSIONS.test(value.name)
        if (!isTypeValid && !isExtValid) {
          return 'Invalid file type. Only JPG and PNG image files are allowed.'
        }
        return ''
      },
    ],
  },
]

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function AddCompanyForm({ initialValues = {}, onSubmit }) {
  const dispatch = useDispatch()
  const cardRef = useRef(null)
  const fileInputRef = useRef(null)
  const isEdit = typeof onSubmit === 'function'

  const formStructure = useMemo(
    () =>
      FORM_STRUCTURE.map((field) => ({
        ...field,
        initialValue:
          initialValues[field.id] === undefined
            ? field.initialValue
            : initialValues[field.id],
        validations:
          isEdit && field.id === 'logo'
            ? (value) => (value ? field.validations[0](value) : '')
            : field.validations,
      })),
    [initialValues, isEdit],
  )
  const { values, valuesSetter, errors, isValid, touched, setTouched, resetForm } =
    useForm(formStructure)

  const submitStatus = useSelector(selectCompanySubmitStatus)
  const submitError = useSelector(selectCompanySubmitError)
  const editError = useSelector(selectCompanyEditError)
  const editStatus = useSelector(selectCompanyEditStatus)
  const submitted = !isEdit && submitStatus === 'succeeded'
  const isSubmitting = isEdit ? editStatus === 'loading' : submitStatus === 'loading'
  const isEditComplete = isEdit && editStatus === 'succeeded'
  const [previewUrl, setPreviewUrl] = useState(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })
  const logoPreviewUrl =
    previewUrl || (typeof values.logo === 'string' ? values.logo : null)

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Interactive 3D tilt tracking
  const handleMouseMove = (event) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    // Subtle tilt: max 2.5 degrees along each axis
    const rotateX = ((y - centerY) / centerY) * -2.5
    const rotateY = ((x - centerX) / centerX) * 2.5
    setTilt({ x: rotateX, y: rotateY })
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.12,
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50, opacity: 0 })
  }

  const handleInputChange = (field) => (event) => {
    valuesSetter(field, event.target.value)
    if (!isEdit) dispatch(clearCompanySubmission())
  }

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0] || null
    valuesSetter('logo', file)
    setTouched((prev) => ({ ...prev, logo: true }))
    if (!isEdit) dispatch(clearCompanySubmission())

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    if (file && (VALID_LOGO_TYPES.includes(file.type) || VALID_LOGO_EXTENSIONS.test(file.name))) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleRemoveLogo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    valuesSetter('logo', null)
    setTouched((prev) => ({ ...prev, logo: true }))
    setPreviewUrl(null)
    if (!isEdit) dispatch(clearCompanySubmission())
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (isSubmitting || isEditComplete) return

    if (!isValid) {
      setTouched({
        company: true,
        contact: true,
        country: true,
        email: true,
        logo: true,
      })
      return
    }

    const submission = {
      company: values.company.trim(),
      contact: values.contact.trim(),
      country: values.country,
      email: values.email.trim(),
      logo: values.logo,
    }

    if (isEdit) {
      onSubmit(submission)
      return
    }

    dispatch(submitCompany({ ...submission, image: submission.logo }))
  }

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    resetForm()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setPreviewUrl(null)
    if (!isEdit) dispatch(clearCompanySubmission())
  }

  return (
    <div className={isEdit ? '' : 'card-3d-wrapper'}>
      <div
        ref={cardRef}
        onMouseMove={isEdit ? undefined : handleMouseMove}
        onMouseLeave={isEdit ? undefined : handleMouseLeave}
        style={
          isEdit
            ? undefined
            : {
                transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              }
        }
        className={isEdit ? 'p-6 sm:p-8' : 'card-3d p-6 sm:p-10'}
      >
        {/* Subtle 3D Specular Glare Layer */}
        {!isEdit && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[1.25rem] transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%)`,
              opacity: glare.opacity,
            }}
          />
        )}

        {/* 3D Success Alert */}
        {submitted && (
          <div
            role="status"
            className="mb-8 rounded-xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 p-5 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.2),inset_0_1px_0_#ffffff]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-[0_3px_0_#047857,0_6px_12px_rgba(16,185,129,0.3)]">
                  <svg
                    aria-hidden="true"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-bold text-emerald-950">
                    Company Registered Successfully!
                  </p>
                  <p className="text-xs text-emerald-800">
                    The company has been saved to the directory.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="btn-3d-secondary px-3 py-1.5 text-xs text-emerald-900"
              >
                Reset Form
              </button>
            </div>
          </div>
        )}

        {!isEdit && submitError && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {submitError}
          </p>
        )}

        {isEdit && editError && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {editError}
          </p>
        )}

        {isSubmitting && (
          <p role="status" className="mb-6 text-sm font-medium text-blue-700">
            Submitting company...
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Company Name Field */}
            <div>
              <label
                htmlFor="company"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Company <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  value={values.company}
                  onChange={handleInputChange('company')}
                  onBlur={handleBlur('company')}
                  placeholder="e.g. Apex Corporation"
                  aria-invalid={touched.company && Boolean(errors.company)}
                  aria-describedby={touched.company && errors.company ? 'company-error' : undefined}
                  className={`input-3d block w-full rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none ${
                    touched.company && errors.company ? 'input-3d-error' : ''
                  }`}
                />
              </div>
              {touched.company && errors.company && (
                <p id="company-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.company}
                </p>
              )}
            </div>

            {/* Contact Name Field */}
            <div>
              <label
                htmlFor="contact"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Contact Person <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="contact"
                  name="contact"
                  type="text"
                  required
                  value={values.contact}
                  onChange={handleInputChange('contact')}
                  onBlur={handleBlur('contact')}
                  placeholder="e.g. Jane Doe"
                  aria-invalid={touched.contact && Boolean(errors.contact)}
                  aria-describedby={touched.contact && errors.contact ? 'contact-error' : undefined}
                  className={`input-3d block w-full rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none ${
                    touched.contact && errors.contact ? 'input-3d-error' : ''
                  }`}
                />
              </div>
              {touched.contact && errors.contact && (
                <p id="contact-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.contact}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Country Dropdown (Valid 3-letter ISO Code) */}
            <div>
              <label
                htmlFor="country"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Country <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <select
                  id="country"
                  name="country"
                  required
                  value={values.country}
                  onChange={handleInputChange('country')}
                  onBlur={handleBlur('country')}
                  aria-invalid={touched.country && Boolean(errors.country)}
                  aria-describedby={touched.country && errors.country ? 'country-error' : undefined}
                  className={`input-3d block w-full rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none ${
                    touched.country && errors.country ? 'input-3d-error' : ''
                  }`}
                >
                  <option value="">Select a country</option>
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code} — {country.name}
                    </option>
                  ))}
                </select>
              </div>
              {touched.country && errors.country ? (
                <p id="country-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.country}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Select a valid 3-letter ISO code.
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={values.email}
                  onChange={handleInputChange('email')}
                  onBlur={handleBlur('email')}
                  placeholder="e.g. contact@apex.com"
                  aria-invalid={touched.email && Boolean(errors.email)}
                  aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                  className={`input-3d block w-full rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none ${
                    touched.email && errors.email ? 'input-3d-error' : ''
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p id="email-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Logo Upload (JPG/PNG Only) */}
          <div>
            <label
              htmlFor="logo"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Company Logo <span className="text-red-500">*</span>
            </label>

            {/* Custom 3D Dropzone */}
            <div className="mt-1.5">
              <label
                htmlFor="logo"
                className={`dropzone-3d flex cursor-pointer flex-col items-center justify-center p-6 text-center ${
                  touched.logo && errors.logo ? 'border-red-400 bg-red-50/50' : ''
                }`}
              >
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_0_#1d4ed8,0_8px_16px_rgba(37,99,235,0.3)]">
                  <svg
                    aria-hidden="true"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  <span className="text-blue-600 underline underline-offset-2">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Accepts only <span className="font-semibold text-slate-700">PNG</span> or <span className="font-semibold text-slate-700">JPG</span> files
                </p>

                <input
                  id="logo"
                  name="logo"
                  ref={fileInputRef}
                  type="file"
                  required={!isEdit || !values.logo}
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleLogoChange}
                  onBlur={handleBlur('logo')}
                  className="sr-only"
                />
              </label>
            </div>

            {touched.logo && errors.logo && (
              <p id="logo-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                {errors.logo}
              </p>
            )}

            {/* 3D Floating Thumbnail Preview */}
            {logoPreviewUrl && values.logo && (
              <div className="preview-3d mt-4 flex items-center gap-4 p-3.5">
                <img
                  src={logoPreviewUrl}
                  alt={isEdit && typeof values.logo === 'string' ? 'Current company logo' : 'Logo preview'}
                  className="h-14 w-14 rounded-lg border border-slate-200 bg-slate-50 object-cover shadow-inner"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {typeof values.logo === 'string'
                      ? 'Current company logo'
                      : values.logo.name}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {typeof values.logo === 'string'
                      ? 'Upload a new image to replace it'
                      : `${formatFileSize(values.logo.size)} • ${values.logo.type || 'image'}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="btn-3d-secondary px-3 py-1.5 text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Form 3D Action Controls */}
          <div
            className={`flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between ${
              isEdit
                ? 'sticky bottom-0 z-10 -mx-6 bg-slate-100 px-6 pb-2 sm:-mx-8 sm:px-8'
                : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!isValid || isSubmitting || isEditComplete}
                className="btn-3d-primary gap-2 px-6 py-3 text-sm tracking-wide"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {isSubmitting
                  ? 'Submitting...'
                  : isEdit
                    ? 'Submit'
                    : 'Submit Company'}
              </button>

              {!isEdit && (
                <Link
                  to="/"
                  className="btn-3d-secondary px-5 py-3 text-sm"
                >
                  Cancel
                </Link>
              )}
            </div>

            {!isValid && (
              <span className="text-xs font-medium text-slate-500">
                Fill in all required fields to activate the submit button.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCompanyForm
