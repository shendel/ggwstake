// @ts-nocheck
export default function StakingInfo() {
  // Данные будут получены из контракта: globalRateBps, minLockAmount, minLockMonths
  const globalAPY = "5.0%"; 
  const minAmount = "1.0 GGW";
  const minTerm = "1 month";

  return (
    <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4">
      <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-white">Fixed-Term Deposits</h3>
            <p className="text-white text-sm mt-1">
              Lock your tokens for a fixed period ({minTerm} minimum) to earn interest.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-white">Predictable Rewards</h3>
            <p className="text-white text-sm mt-1">
              Earn up to <span className="font-semibold">{globalAPY} APY</span>. 
              Rewards are calculated precisely based on your deposit start time.
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium text-white mb-2">Current Terms</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white">Min. Amount</span>
              <p className="font-medium">{minAmount}</p>
            </div>
            <div>
              <span className="text-white">Min. Term</span>
              <p className="font-medium">{minTerm}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}