import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import useInfiniteScroll from '../hooks/useInfiniteScroll.js'

function Table({
  headers,
  data,
  searchText,
  onSearchTextChange,
  sort,
  onSortChange,
  hasMore,
  isLoading,
  error,
  onLoadMore,
  onEdit,
}) {
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading,
    error,
    onLoadMore,
  })

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="badge-3d mb-2">Directory</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Company contacts
          </h1>
        </div>

        <Link
          to="/add-company"
          className="btn-3d-primary gap-2 self-start sm:self-auto px-4 py-2.5 text-sm"
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
          Add Company
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
          Filter
          <input
            type="search"
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="Search company or contact"
            className="input-3d rounded-lg px-3.5 py-2 font-normal text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_0_rgba(255,255,255,1)_inset]">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead className="bg-slate-100/80 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.name}
                  className={`px-6 py-4 ${header.sortable ? 'group' : ''}`}
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
                      className="inline-flex items-center gap-2 text-left font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    >
                      {header.label}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        className={`h-3.5 w-3.5 transition-transform ${
                          sort?.column === header.name
                            ? 'opacity-100 text-blue-600'
                            : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-slate-400'
                        } ${sort?.column === header.name && sort.direction === 'asc' ? 'rotate-180' : ''}`}
                        fill="none"
                      >
                        <path
                          d="m3.5 6 4.5 4.5L12.5 6"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  ) : (
                    header.label
                  )}
                </th>
              ))}
              <th scope="col" className="px-6 py-4">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="px-6 py-8 text-center text-slate-600"
                >
                  {isLoading ? 'Loading companies...' : 'No matching companies found.'}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.company ?? index}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  {headers.map((header) => (
                    <td
                      key={header.name}
                      className="px-6 py-4 font-medium text-slate-700"
                    >
                      {header.render ? header.render(item) : item[header.name]}
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title={`Edit ${item.company || 'company'}`}
                      aria-label={`Edit ${item.company || 'company'}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 2.651 2.651M7.5 16.5l4.25-.85 8.114-8.114a1.875 1.875 0 0 0-2.652-2.652L9.1 13l-.85 3.5Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 13.5v5.25A2.25 2.25 0 0 1 17.25 21H6.75a2.25 2.25 0 0 1-2.25-2.25V8.25A2.25 2.25 0 0 1 6.75 6H12"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={headers.length + 1}
                className="px-6 py-4 text-center text-slate-600 border-t border-slate-200"
              >
                {isLoading && hasMore ? (
                  <span role="status" className="font-medium text-blue-600">Loading more companies...</span>
                ) : error ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-red-700 font-semibold" role="alert">{error}</p>
                    {hasMore && (
                      <button
                        type="button"
                        onClick={onLoadMore}
                        className="btn-3d-secondary px-3 py-1.5 text-xs font-semibold"
                      >
                        Retry loading companies
                      </button>
                    )}
                  </div>
                ) : hasMore ? (
                  <div ref={sentinelRef} aria-hidden="true" className="h-1" />
                ) : (
                  data.length > 0 && <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">All companies loaded.</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
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
  hasMore: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onLoadMore: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
}

export default Table
