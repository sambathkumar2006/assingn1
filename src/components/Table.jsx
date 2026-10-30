
import PropTypes from 'prop-types'

function Table({
  headers,
  data,
  searchText,
  onSearchTextChange,
  sort,
  onSortChange,
  isLoading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onRetry,
}) {
  const toggleSort = (column) => {
    onSortChange((currentSort) => {
      if (currentSort?.column !== column) {
        return { column, direction: 'desc' }
      }

      if (currentSort.direction === 'desc') {
        return { column, direction: 'asc' }
      }

      return null
    })
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Company contacts
      </h1>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Filter
          <input
            type="search"
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="Search company or contact"
            className="rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.name}
                  className={`px-6 py-4 font-semibold ${header.sortable ? 'group' : ''}`}
                >
                  {header.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(header.name)}
                      aria-label={
                        sort?.column === header.name
                          ? `Sort ${header.label} ${sort.direction === 'desc' ? 'ascending' : 'unsorted'}`
                          : `Sort ${header.label} descending`
                      }
                      className="inline-flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {header.label}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        className={`h-3.5 w-3.5 transition-opacity ${
                          sort?.column === header.name
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                        } ${sort?.column === header.name && sort.direction === 'asc' ? 'rotate-180' : ''}`}
                        fill="none"
                      >
                        <path
                          d="m3.5 6 4.5 4.5L12.5 6"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </button>
                  ) : (
                    header.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-8 text-center text-slate-600"
                >
                  {isLoading ? 'Loading companies...' : 'No matching companies found.'}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.company ?? index}
                  className="transition-colors hover:bg-slate-50"
                >
                  {headers.map((header) => (
                    <td
                      key={header.name}
                      className="px-6 py-4 text-slate-600"
                    >
                      {header.render ? header.render(item) : item[header.name]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-red-700" role="alert">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
          >
            Retry loading companies
          </button>
        </div>
      )}

      <nav
        aria-label="Pagination"
        className="mt-4 flex items-center justify-center gap-1"
      >
        {currentPage > 1 ? (
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isLoading}
            className="h-10 w-10 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ←
          </button>
        ) : (
          <span className="h-10 w-10" aria-hidden="true" />
        )}

        {[currentPage - 1, currentPage, currentPage + 1].map((page) =>
          page >= 1 && page <= totalPages ? (
            <button
              key={page}
              type="button"
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
              onClick={() => onPageChange(page)}
              disabled={isLoading || page === currentPage}
              className={`h-10 min-w-10 rounded-md border px-3 disabled:cursor-not-allowed ${
                page === currentPage
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={page} className="h-10 min-w-10" aria-hidden="true" />
          ),
        )}

        {currentPage < totalPages ? (
          <button
            type="button"
            aria-label="Next page"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLoading}
            className="h-10 w-10 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            →
          </button>
        ) : (
          <span className="h-10 w-10" aria-hidden="true" />
        )}
      </nav>
    </main>
  )
}

Table.propTypes = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func,
    }).isRequired,
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.node).isRequired)
    .isRequired,
  searchText: PropTypes.string.isRequired,
  onSearchTextChange: PropTypes.func.isRequired,
  sort: PropTypes.shape({
    column: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(['asc', 'desc']).isRequired,
  }),
  onSortChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
}

export default Table
