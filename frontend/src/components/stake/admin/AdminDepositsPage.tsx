// AdminDepositsPage.tsx
import { useState, useEffect } from 'react';
import { useStakeContext } from '@/contexts/StakeContext'; // Импортируем хук
import fetchDeposits from '@/helpers_stake/fetchDeposits';
import fetchActiveDeposits from '@/helpers_stake/fetchActiveDeposits';
import { fromWei } from '@/helpers/wei';
import BigNumber from 'bignumber.js';

interface Deposit {
  depositId: string;
  owner: string;
  amount: string; // в wei
  monthIndex: string;
  depositStart: string; // timestamp
  depositClosed: string; // timestamp
  unlockMonthIndex: string;
  lastAccruedMonthIdx: string;
  pendingReward: string; // в wei
  active: boolean;
  isSaved: boolean;
  savedReward: string; // в wei
  ownRate: boolean;
  rate: string; // в bps
}

const AdminDepositsPage = () => {
  const {
    contractAddress,
    chainId,
    summaryInfo: { 
      tokenDecimals, 
      tokenSymbol, 
      depositsCount,
      activeDepositsCount
    }
  } = useStakeContext();

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalDepositsForFilter = activeOnly ? Number(activeDepositsCount) : Number(depositsCount);
  const totalPages = Math.ceil(totalDepositsForFilter / itemsPerPage);


  const offset = (currentPage - 1) * itemsPerPage;

  const fetchDepositsData = () => {
    setLoading(true);
    setError(null);
    setDeposits([]);

    let fetchDataPromise;

    if (activeOnly) {
      fetchDataPromise = fetchActiveDeposits({
        address: contractAddress,
        chainId,
        offset: offset,
        limit: itemsPerPage,
        onBatch: (batch, batchOffset, total) => {
          setDeposits(prev => [...prev, ...batch]);
        },
        onReady: (result) => {}
      });
    } else {
      fetchDataPromise = fetchDeposits({
        address: contractAddress,
        chainId,
        offset: offset,
        limit: itemsPerPage,
        onBatch: (batch, batchOffset, total) => {
          setDeposits(prev => [...prev, ...batch]);
        },
        onReady: (result) => {}
      });
    }

    fetchDataPromise
      .then((finalResult) => {
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch deposits');
        console.error('Error fetching deposits:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDepositsData();
  }, [activeOnly, currentPage, contractAddress, chainId]);

  const formatDate = (timestamp: string) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatAmount = (weiAmount: string) => {
    if (!weiAmount) return '0.00';
    return new BigNumber(fromWei(weiAmount, tokenDecimals)).toFixed(4).replace(/\.0*$|(?<=\.\d*)0*$/, "");
  };

  const formatRate = (rate: string) => {
    return new BigNumber(rate).dividedBy(100).toFixed(2) + '%';
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin: Deposits Management</h1>

      <div className="mb-6 flex items-center space-x-4">
        <div className="flex items-center">
          <span className="mr-2">Active Only:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => {
                setActiveOnly(e.target.checked);
                setCurrentPage(1); // Сброс на первую страницу при смене фильтра
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="text-sm text-gray-400">
          {/* Отображаем общее количество для выбранного фильтра */}
          Total: {totalDepositsForFilter} {activeOnly ? 'active' : 'all'} deposits
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && deposits.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Start</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Unlock Month</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Pending Reward</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {deposits.map((deposit) => (
                  <tr key={deposit.depositId} className="hover:bg-gray-800">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{deposit.depositId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-300">
                      {deposit.owner.substring(0, 6)}...{deposit.owner.substring(38, 42)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatAmount(deposit.amount)} {tokenSymbol}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(deposit.depositStart)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">#{deposit.unlockMonthIndex}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-500">+{formatAmount(deposit.pendingReward)} {tokenSymbol}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatRate(deposit.rate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        deposit.active 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {deposit.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages} ({deposits.length} shown)
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}

      {!loading && !error && deposits.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No deposits found
        </div>
      )}
    </div>
  );
};

export default AdminDepositsPage;