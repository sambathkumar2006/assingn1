
function Table({ headers, data }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Company contacts
      </h1>

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
            {data.map((item, index) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default Table
