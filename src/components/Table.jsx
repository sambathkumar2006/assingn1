
import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

function Table({
  headers,
  data,
  searchText,
  onSearchTextChange,
}) {
  const [sort, setSort] = useState(null)
  const sortedData = useMemo(() => {
    if (!sort) {
      return data
    }

    return [...data].sort((first, second) => {
      const comparison = String(first[sort.column] ?? '').localeCompare(
        String(second[sort.column] ?? ''),
        undefined,
        { numeric: true, sensitivity: 'base' },
      )

      return sort.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sort])

  const toggleSort = (column) => {
    setSort((currentSort) => {
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
            placeholder="Search all columns"
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
                  No matching companies found.
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
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
}

export default Table
