const companies = [
  {
    company: 'Alfreds Futterkiste',
    contact: 'Maria Anders',
    country: 'Germany',
  },
  {
    company: 'Centro comercial Moctezuma',
    contact: 'Francisco Chang',
    country: 'Mexico',
  },
  {
    company: 'Ernst Handel',
    contact: 'Roland Mendel',
    country: 'Austria',
  },
  {
    company: 'Island Trading',
    contact: 'Helen Bennett',
    country: 'UK',
  },
  {
    company: 'Laughing Bacchus Winecellars',
    contact: 'Yoshi Tannamuri',
    country: 'Canada',
  },
  {
    company: 'Magazzini Alimentari Riuniti',
    contact: 'Giovanni Rovelli',
    country: 'Italy',
  },
]

function Table() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Company contacts</h1>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Company</th>
              <th className="px-6 py-4 font-semibold">Contact</th>
              <th className="px-6 py-4 font-semibold">Country</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {companies.map((item) => (
              <tr key={item.company} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{item.company}</td>
                <td className="px-6 py-4 text-slate-600">{item.contact}</td>
                <td className="px-6 py-4 text-slate-600">{item.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default Table