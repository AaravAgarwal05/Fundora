export default function PublicDonors({ donors }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-3">
        Recent Supporters
      </h3>

      <ul className="space-y-2">
        {donors.map((d) => (
          <li
            key={d.id}
            className="flex justify-between bg-slate-900 p-3 rounded"
          >
            <span className="text-slate-200">{d.name || "Anonymous"}</span>
            <span className="text-green-400">₹{d.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
