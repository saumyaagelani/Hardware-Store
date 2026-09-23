export default function Loading() {
  return (
    <div className="container-page py-8" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-4 w-48 rounded" />
      <div className="skeleton mt-6 h-9 w-72 rounded" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-line">
            <div className="skeleton aspect-square" />
            <div className="space-y-2 p-4">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-5 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
