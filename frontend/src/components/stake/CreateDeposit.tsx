import { useState } from 'react';

export default function CreateDeposit({ account }) {
  const [amount, setAmount] = useState('');
  const [lockMonths, setLockMonths] = useState('3');
  const [estimatedReward, setEstimatedReward] = useState('0.00');

  // При изменении amount/lockMonths — вызывать calculateRewardByMonths
  const handleCalculate = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    // Пример расчёта (в реальности — вызов контракта)
    const reward = (parseFloat(amount) * 0.05 * parseInt(lockMonths)) / 12;
    setEstimatedReward(reward.toFixed(4));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Вызов createDeposit(amount, lockMonths)
    alert(`Creating deposit: ${amount} GGW for ${lockMonths} months`);
  };

  return (
    <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Create New Deposit</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Amount (GGW)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={handleCalculate}
                placeholder="0.00"
                className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">GGW</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Lock Period
            </label>
            <select
              value={lockMonths}
              onChange={(e) => {
                setLockMonths(e.target.value);
                handleCalculate();
              }}
              className="w-full px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </div>

          {estimatedReward && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                Estimated reward: <span className="font-semibold">{estimatedReward} GGW</span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!account || !amount || parseFloat(amount) < 1}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Confirm Deposit
          </button>
        </div>
      </form>
    </div>
  );
}