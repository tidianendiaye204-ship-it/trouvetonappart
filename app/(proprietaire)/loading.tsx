export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-ardoise-gris/20 rounded-xl"></div>
          <div className="h-4 w-96 bg-ardoise-gris/10 rounded-full"></div>
        </div>
        <div className="h-12 w-40 bg-ardoise-gris/20 rounded-full"></div>
      </div>

      {/* KPIs Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-ardoise-gris/10 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-ardoise-gris/10 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-ardoise-gris/10 rounded-full"></div>
                <div className="h-8 w-16 bg-ardoise-gris/20 rounded-lg"></div>
              </div>
            </div>
            <div className="h-3 w-32 bg-ardoise-gris/10 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* List Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-ardoise-gris/20 rounded-xl"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-ardoise-gris/10 bg-white overflow-hidden">
            <div className="h-48 w-full bg-ardoise-gris/10"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 w-3/4 bg-ardoise-gris/20 rounded-lg"></div>
              <div className="h-4 w-1/2 bg-ardoise-gris/10 rounded-full"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-8 w-24 bg-ardoise-gris/20 rounded-full"></div>
                <div className="h-6 w-20 bg-ardoise-gris/10 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
