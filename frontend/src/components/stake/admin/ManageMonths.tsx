import { useEffect, useState } from 'react';
import { useStakeContext } from '@/contexts/StakeContext'
import { useModal } from '@/contexts/ModalContext'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useNotification } from '@/contexts/NotificationContext'
import addMonthsBatch from '@/helpers_stake/addMonthsBatch'
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import SwitchChainButton from '@/components/ui/SwitchChainButton'
import LoadingOverlay from '@/components/LoadingOverlay'
import InfoField from '@/components/appconfig/ui/InfoField'
import SortToggle from '@/components/appconfig/ui/SortToggle'
import HideShow from '@/components/appconfig/ui/HideShow'
import { fromWei } from '@/helpers/wei'

// Конвертирует Unix timestamp в строку для отображения
const unixToDisplay = (timestamp) => {
  return new Date(Number(timestamp) * 1000).toISOString().slice(0, 16).split('T').join(' ');
};
const unixToLocal = (timestamp) => {
  const d = new Date(Number(timestamp) * 1000)
  return d.getFullYear()
    + '-' + ((d.getMonth() > 9) ? d.getMonth() : '0' + d.getMonth())
    + '-' + ((d.getDate() > 9) ? d.getDate() : '0' + d.getDate())
    + ' ' + ((d.getHours() > 9) ? d.getHours() : '0' + d.getHours())
    + ':' + ((d.getMinutes() > 9) ? d.getMinutes() : '0' + d.getMinutes())
}
// Конвертирует строку в Unix timestamp
const displayToUnix = (str) => {
  return Math.floor(new Date(str).getTime() / 1000);
};

const ManageMonths = (props) => {
  const {
    chainId,
    contractAddress,
    depositMonths,
    isDepositMonthsFetching,
    summaryInfo,
    summaryInfo: {
      currentMonth,
    },
    tokenInfo,
    isSummaryLoaded,
    updateState,
  } = useStakeContext()

  const {
    injectedChainId,
    injectedWeb3,
  } = useInjectedWeb3()
  
  const { addNotification } = useNotification()
  const { openModal } = useModal()

  
  const [months, setMonths] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [fillCount, setFillCount] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isReversed, setIsReversed] = useState(false); 
  const [isHideFinished, setIsHideFinished ] = useState(true)
  
  // Загрузка месяцев из блокчейна
  useEffect(() => {
    if (depositMonths.length > 0) {
      const formatted = depositMonths.map(m => ({
        ...m,
        // Храним как Unix timestamps
        start: Number(m.start),
        end: Number(m.end)
      })).reverse();
      
      setMonths(formatted);
    }
  }, [depositMonths]);

  const displayMonths = (isReversed ? [...months].reverse() : months).filter((month) => {
    if (!isHideFinished) return true
    if ((month.monthId !== undefined) && (Number(month.monthId) < Number(currentMonth))) return false
    return true
  });
  
  const toggleSortOrder = () => {
    setIsReversed(!isReversed);
  };
  const toggleHideFinished = () => {
    setIsHideFinished(!isHideFinished)
  }
  
  const addRow = () => {
    setMonths([...months, { start: 0, end: 0, rateBps: '' }]);
  };

  const removeRow = (index) => {
    if (months.length <= 1) return;
    openModal({
      title: 'Remove month',
      description: `Remove current month?`,
      onConfirm: () => {
        setTimeout(() => {
          const updated = [...months];
          updated.splice(index, 1);

          // Пересчитываем интервалы
          const recalculated = updated.map((m, i) => {
            if (i === 0) return m;
            return { ...m, start: updated[i-1].end };
          });
          
          setMonths(recalculated);
        })
      }
    })
  };

  const updateRow = (index, field, value) => {
    const updated = months.map((row, i) => 
      i === index ? { ...row, [field]: Number(value) } : row
    );
    setMonths(updated);
  };

  // Функция для вычисления длины интервала
  const getIntervalLength = (start, end) => {
    if (!start || !end) return '';
    
    const diffSecs = end - start;
    const diffMins = diffSecs / 60;
    const diffDays = diffSecs / 86400;
    
    if (diffMins < 1440) { // < 1 день
      return `${Math.round(diffMins)} min`;
    } else {
      return `${diffDays.toFixed(1)} days`;
    }
  };

  const fillMonths = () => {
    const filled = [];
    let currentTs;
    
    if (months.length > 0) {
      // Берём end последнего месяца как старт для нового
      const lastMonth = months[months.length - 1];
      currentTs = lastMonth.end;
    } else {
      // Если нет месяцев - начинаем с текущего времени
      currentTs = Math.floor(Date.now() / 1000);
    }
    
    for (let i = 0; i < fillCount; i++) {
      const start = currentTs;
      const end = currentTs + durationMinutes * 60;
      
      filled.push({
        start,
        end,
        rateBps: ''
      });
      
      // Переходим к следующему интервалу
      currentTs = end;
    }
    
    setMonths(prev => [...prev, ...filled]);
    addNotification(`success`, `${fillCount} test periods added`)
  };

  const fillRealMonths = () => {
    const filled = [];
    let currentStart;

    if (months.length > 0) {
      // Берём end последнего месяца как старт для нового
      const lastMonth = months[months.length - 1];
      currentStart = lastMonth.end + 1; // +1 секунда после окончания
    } else {
      // Начинаем с текущего месяца в 00:00:00 UTC
      const now = new Date();
      currentStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0) / 1000;
    }
    
    for (let i = 0; i < fillCount; i++) {
      const start = currentStart;
      // Конец месяца: последнее число в 23:59:59
      const startDate = new Date(start * 1000);
      const end = Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth() + 1,
        0, 23, 59, 59
      ) / 1000;
      
      filled.push({
        start,
        end,
        rate: ''
      });
      
      // Переходим к следующему месяцу: 00:00:00 первого числа
      currentStart = Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth() + 1,
        1, 0, 0, 0
      ) / 1000;
    }
    
    setMonths(prev => [...prev, ...filled]);
    addNotification(`success`, `${fillCount} months added`)
  };

  const handleAddBatch = async (e) => {
    try {
      const forAdd = months.filter((month) => { return (month.monthId == undefined) })
      if (forAdd.length > 0) {
        
        const startTimes = forAdd.map(m => m.start);
        const endTimes = forAdd.map(m => m.end);
        const rates = forAdd.map(m => parseInt(m.rateBps) || 0);
        
        console.log('>> submit', startTimes, endTimes, rates)
        setIsAdding(true)
        addNotification('info', 'Add months... Confirm transaction')
        addMonthsBatch({
          activeWeb3: injectedWeb3,
          address: contractAddress,
          monthsStart: startTimes,
          monthsEnd: endTimes,
          monthsRates: rates,
          onTrx: (txHash) => {
            addNotification('info', 'Transaction', getTransactionLink(chainId, txHash), getShortTxHash(txHash))
          },
          onSuccess: (txInfo) => {
            addNotification('success', `New months succesfull added`)
            setIsAdding(false);
            updateState()
          },
          onError: () => {}
        }).catch((err) => {
          addNotification('error', 'Fail add months')
          setIsAdding(false);
        })
      } else {
        addNotification('error', 'No new months for add')
      }
    } finally {
      setIsAdding(false);
    }
  };

  const controlPanel = (
    <div className="flex justify-between items-center">
      <div className="flex">
        <SortToggle isReversed={isReversed} onToggle={toggleSortOrder} />
        <HideShow
          isHidden={isHideFinished}
          onToggle={toggleHideFinished}
          hideText={`Hide finished periods`}
          showText={`Show finished periods`}
        />
      </div>
      {(chainId != injectedChainId) ? (
        <SwitchChainButton
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-2 rounded"
          title="Switch to {CHAIN_TITLE} for add months"
        />
      ) : (
        <button
          onClick={handleAddBatch}
          disabled={isAdding}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-2 rounded"
        >
          {isAdding ? 'Adding...' : 'Add Months to Contract'}
        </button>
      )}
    </div>
  )

  const tableHeadCellClass = `px-4 py-3 text-left text-xs font-medium uppercase tracking-wider`
  return (
    <div className="mx-auto p-6 bg-gray-900 text-white">
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Month Count</label>
            <input
              type="number"
              value={fillCount}
              onChange={(e) => setFillCount(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={fillMonths}
              className="bg-purple-600 hover:bg-purple-700 w-full py-2 rounded mr-2"
            >
              Add Test Periods
            </button>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={fillRealMonths}
              className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded"
            >
              Add Real Months
            </button>
          </div>
        </div>
      </div>
      <InfoField>
        {`The time is indicated according to UTC. In blockchain in UnixTimeStamp (UTX). LT - Local Time in your time-zone`}
      </InfoField>
      <div className="space-y-6 relative">
        {controlPanel}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className={tableHeadCellClass}>{`ID`}</th>
                <th className={tableHeadCellClass}>{`Start Date`}</th>
                <th className={tableHeadCellClass}>{`End Date`}</th>
                <th className={tableHeadCellClass}>{`Len`}</th>
                <th className={tableHeadCellClass}>
                  {`Rate (bps)`}
                  <div className="text-sm text-gray-400 mt-1">
                    {(isSummaryLoaded && summaryInfo && summaryInfo.globalRateBps) ? (
                      <>{`Global: ${summaryInfo.globalRateBps}`}</>
                    ) : (
                      <>{`...`}</>
                    )}
                  </div>
                </th>
                <th className={tableHeadCellClass}>{`Dep. Count`}</th>
                <th className={tableHeadCellClass}>{`Dep. Amount (${tokenInfo.symbol})`}</th>
                <th className={tableHeadCellClass}>{`Reward Amount (${tokenInfo.symbol})`}</th>
                <th className={tableHeadCellClass}>{`Actions`}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {displayMonths.map((row, index) => {
                const isBC = (row.monthId !== undefined) ? true : false
                const isFinished = (isBC && (Number(row.monthId) < Number(currentMonth))) ? true : false
                const isCurrent = (isBC && (Number(row.monthId) == Number(currentMonth))) ? true : false
                return (
                  <tr key={index} className={`hover:bg-gray-800 ${(isCurrent) ? 'bg-green-900 hover:bg-green-900' : (isFinished) ? 'bg-red-900 hover:bg-red-900' : ''}`}>
                    <td className="px-4 py-3">
                      {(row.monthId !== undefined) ? row.monthId : '#'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-400 mt-1">
                        {unixToDisplay(row.start)}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        LT: {unixToLocal(row.start)}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        UTS: {row.start}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-400 mt-1">
                        {unixToDisplay(row.end)}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        LT: {unixToLocal(row.end)}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        UTS: {row.end}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getIntervalLength(row.start, row.end)}
                    </td>
                    <td className="px-4 py-3">
                      {isBC ? (
                        <div className="font-bold text-gray-400 mt-1">
                          {row.rateBps}
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={row.rateBps}
                          readOnly={isBC}
                          onChange={(e) => updateRow(index, 'rateBps', e.target.value)}
                          className=" bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                          placeholder="Rate in bps"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(isBC) ? row.depositsCount : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {(isBC && tokenInfo) ? fromWei(row.depositsAmount, tokenInfo.decimals) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {(isBC && tokenInfo) ? fromWei(row.rewardsAmount, tokenInfo.decimals) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {((((index == (months.length - 1)) && !isReversed) || (index == 0 && isReversed)) && !isFinished) && (
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="text-red-400 hover:text-red-300 px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <LoadingOverlay isLoading={isDepositMonthsFetching} />
        </div>
        {controlPanel}
      </div>
    </div>
  );
}

export default ManageMonths