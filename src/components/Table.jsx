
import PropTypes from 'prop-types'

function Table({
  headers,
  data,
  searchText,
  onSearchTextChange,
  sort,
  onSortChange,
}) {
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

        <div className="flex flex-col gap-4 sm:flex-row">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Sort by
            <select
              value={sort.column}
              onChange={(event) =>
                onSortChange({ ...sort, column: event.target.value })
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {headers.map((header) => (
                <option key={header.name} value={header.name}>
                  {header.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Order
            <select
              value={sort.direction}
              onChange={(event) =>
                onSortChange({ ...sort, direction: event.target.value })
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.name}
                  className="px-6 py-4 font-semibold"
                >
                  {header.label}
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
                      {item[header.name]}
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
    }).isRequired,
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.node).isRequired)
    .isRequired,
  searchText: PropTypes.string.isRequired,
  onSearchTextChange: PropTypes.func.isRequired,
  sort: PropTypes.shape({
    column: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(['asc', 'desc']).isRequired,
  }).isRequired,
  onSortChange: PropTypes.func.isRequired,
}

export default Table
