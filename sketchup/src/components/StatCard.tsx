// @ts-nocheck
export default function StatCard({ title, value, icon, isCurrency = false }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-lg font-bold ${isCurrency ? 'text-green-600' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}