// @ts-nocheck
import { useState, useEffect } from 'react';
import StakingInfo from './components/StakingInfo';
import CreateDeposit from './components/CreateDeposit';
import DepositCard from './components/DepositCard';

export default function StakingDashboard() {
  const [account, setAccount] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Имитация подключения к кошельку и загрузки данных
  useEffect(() => {
    // Здесь будет: 
    // - подключение через ethers/web3modal
    // - вызов getTotalDeposits(), getUserDeposits(account)
    // - парсинг депозитов через getDepositById()
    setTimeout(() => {
      setAccount('0x...1234');
      setDeposits([
        { id: 0, amount: '100', lockMonths: 3, unlockDate: '2026-04-15', reward: '1.26' },
        { id: 1, amount: '50', lockMonths: 6, unlockDate: '2026-07-15', reward: '3.15' }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">GGW Staking</h1>
          <p className="text-gray-600 mt-2">
            Stake tokens for fixed terms and earn predictable rewards
          </p>
          <div className="mt-4 inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка: информация и создание депозита */}
          <div className="lg:col-span-2 space-y-6">
            <StakingInfo />
            <CreateDeposit account={account} />
          </div>

          {/* Правая колонка: активные депозиты */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Deposits</h2>
            {deposits.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-6 text-center">
                <p className="text-gray-500">No active deposits</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deposits.map(deposit => (
                  <DepositCard key={deposit.id} deposit={deposit} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}