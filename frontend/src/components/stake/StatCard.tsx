// @ts-nocheck
export default function StatCard({ title, value, icon, isCurrency = false }) {
  return (
    <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4">
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className={`text-lg font-bold ${isCurrency ? 'text-green-600' : 'text-white'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}