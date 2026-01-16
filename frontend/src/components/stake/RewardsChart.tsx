// @ts-nocheck
export default function RewardsChart({ rewardsByMonth }) {
  if (rewardsByMonth.length === 0) return null;

  const maxReward = Math.max(...rewardsByMonth.map(m => parseFloat(m.reward)));
  const barWidth = 100 / rewardsByMonth.length;

  return (
    <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Payed rewards by Month</h2>
      <div className="space-y-2">
        {rewardsByMonth.map((monthData, idx) => {
          const height = maxReward > 0 ? (parseFloat(monthData.reward) / maxReward) * 100 : 0;
          return (
            <div key={idx} className="flex items-end h-12">
              <div className="w-12 text-right text-sm text-gray-500 pr-2">
                M{monthData.month + 1}
              </div>
              <div className="flex-1 flex items-end h-full bg-gray-100 rounded">
                <div 
                  className="bg-indigo-500 rounded transition-all duration-500"
                  style={{ 
                    height: `${height}%`,
                    width: `${barWidth}%`,
                    marginLeft: `${barWidth * idx}%`
                  }}
                ></div>
              </div>
              <div className="w-16 text-left text-sm font-medium ml-2">
                {monthData.reward} GGW
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}