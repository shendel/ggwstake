import { useEffect, useState } from 'react';
import { useStakeContext } from '@/contexts/StakeContext'
import { useModal } from '@/contexts/ModalContext'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useNotification } from '@/contexts/NotificationContext'
import addMonthsBatch from '@/helpers_stake/addMonthsBatch'
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import SwitchChainButton from '@/components/ui/SwitchChainButton'
import LoadingOverlay from '@/components/LoadingOverlay'
import UTCDatePicker from '@/components/appconfig/ui/UTCDatePicker'

const timeFromBlockChain = (utx) => {
  return new Date(Number(utx) * 1000).toISOString().slice(0, 16)
}

const formatDateTimeForDisplay = (value) => {
  if (!value) return '';
  
  // Проверяем формат: Unix timestamp или ISO строка
  const isUnixTimestamp = /^\d+$/.test(String(value));
  
  if (isUnixTimestamp) {
    // Unix timestamp из блокчейна
    return timeFromBlockChain(value);
  } else {
    // ISO строка
    return value;
  }
}

const ManageMonths = (props) => {
  const {
    chainId,
    contractAddress,
  } = useStakeContext()

  const {
    isConnected,
    injectedAccount,
    injectedChainId,
    injectedWeb3,
  } = useInjectedWeb3()
  
  const { addNotification } = useNotification()
  const { openModal, closeModal } = useModal()

  const {
    depositMonths,
    isDepositMonthsFetching,
    isDepositMonthsFetchingError,
    isDepositMonthsLoaded,
  } = useStakeContext()
  
  const [months, setMonths] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(10); // 10 минут по умолчанию
  const [fillCount, setFillCount] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (depositMonths.length > 0) {
      // Преобразуем месяцы из блокчейна в формат для отображения
      const formatted = depositMonths.map(month => ({
        ...month,
        start: formatDateTimeForDisplay(month.start),
        end: formatDateTimeForDisplay(month.end)
      })).reverse();
      
      setMonths(formatted);
    }
  }, [depositMonths]);

  const addRow = () => {
    setMonths([...months, { start: '', end: '', rateBps: '' }]);
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

          // Пересчитываем интервалы чтобы убрать пропуски
          const recalculated = updated.map((month, i) => {
            if (i === 0) return month; // Первый месяц не меняется
            
            // Берём end предыдущего как start текущего
            const prevEnd = updated[i-1].end;
            return {
              ...month,
              start: prevEnd
            };
          });
          
          setMonths(recalculated);
        })
      }
    })
  };

  const updateRow = (index, field, value) => {
    const updated = months.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    );
    setMonths(updated);
  };

  const convertToUnix = (dateStr) => {
    return Math.floor(new Date(dateStr).getTime() / 1000);
  };

  // Функция для вычисления длины интервала
  const getIntervalLength = (start, end) => {
    if (!start || !end) return '';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    
    if (diffMs < 86400000) { // < 1 день (в миллисекундах)
      const minutes = Math.round(diffMs / 60000); // 60000 мс = 1 мин
      return `${minutes} min`;
    } else {
      const days = (diffMs / 86400000).toFixed(1); // 86400000 мс = 1 день
      return `${days} days`;
    }
  };

  const fillMonths = () => {
    const filled = [];
    let currentDate;
    
    if (months.length > 0) {
      // Берём end последнего месяца как старт для нового
      const lastMonth = months[months.length - 1];
      const lastEnd = new Date(lastMonth.end);
      
      // Конвертируем в UTC
      currentDate = new Date(lastEnd.getTime() - lastEnd.getTimezoneOffset() * 60000);
    } else {
      // Если нет месяцев - начинаем с текущего времени в UTC
      currentDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    }
    
    for (let i = 0; i < fillCount; i++) {
      const start = new Date(currentDate);
      const end = new Date(currentDate.getTime() + durationMinutes * 60 * 1000);
      
      // Форматируем в ISO строку (UTC)
      const startISO = start.toISOString().slice(0, 16);
      const endISO = end.toISOString().slice(0, 16);
      
      filled.push({
        start: startISO,
        end: endISO,
        rateBps: ''
      });
      
      // Переходим к следующему месяцу
      currentDate = end;
    }
    
    // Добавляем к существующим месяцам
    setMonths(prev => [...prev, ...filled]);
  };

  const fillRealMonths = () => {
  const filled = [];
  let startDate;

  if (months.length > 0) {
    // Находим последний месяц по end дате
    const sorted = [...months].sort((a, b) => {
      const getEndDate = (month) => {
        // Проверяем формат: Unix timestamp или ISO строка
        const isUnixTimestamp = /^\d+$/.test(String(month.end));
        if (isUnixTimestamp) {
          // Unix timestamp из блокчейна
          return new Date(Number(month.end) * 1000);
        } else {
          // ISO строка
          return new Date(month.end);
        }
      };
      
      return getEndDate(a) - getEndDate(b);
    });
    
    const lastEnd = sorted[sorted.length - 1];
    let lastEndDate;
    
    // Конвертируем end последнего месяца в Date объект
    const isUnixTimestamp = /^\d+$/.test(String(lastEnd.end));
    if (isUnixTimestamp) {
      lastEndDate = new Date(Number(lastEnd.end) * 1000);
    } else {
      lastEndDate = new Date(lastEnd.end);
    }
    
    // Берём время окончания последнего месяца как начало следующего
    
    startDate = new Date(
      Date.UTC(
        lastEndDate.getUTCFullYear(),
        lastEndDate.getUTCMonth(),
        lastEndDate.getUTCDate(),
        lastEndDate.getUTCHours(),
        lastEndDate.getUTCMinutes(),
        lastEndDate.getUTCSeconds() + 1  // +1 секунда после окончания
      )
    );
    console.log(startDate)
  } else {
    // Если нет месяцев - начинаем с текущего месяца в 00:00:00 UTC
    const now = new Date();
    startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
    );
  }
  
  for (let i = 0; i < fillCount; i++) {
    // ИСПРАВЛЕНО: используем Date.UTC для создания даты
    const start = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth() + i,
        1,
        0,
        0,
        0
      )
    );
    /*
    const start = 
      new Date(
        Date.UTC(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth() + i,
          (months.length && (i == 0)) ? (startDate.getUTCDate() + 1) : 1,
          (months.length && (i == 0)) ? startDate.getUTCHours() : 0,
          (months.length && (i == 0)) ? startDate.getUTCMinutes() : 0,
          (months.length && (i == 0)) ? startDate.getUTCSeconds() : 0,
        )
      );
    */
    const end = new Date(
      Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth() + 1,
        0,
        23,
        59,
        59
      )
    );
    
    filled.push({
      start: start.toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
      end: end.toISOString().slice(0, 16),
      rate: ''
    });
  }
  
  setMonths(prev => [...prev, ...filled]);
};

  const handleAddBatch = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const startTimes = months.map(m => convertToUnix(m.start));
      const endTimes = months.map(m => convertToUnix(m.end));
      const rates = months.map(m => parseInt(m.rateBps) || 0);
      
      console.log('>> submit', startTimes, endTimes, rates)
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
        },
        onError: () => {}
      }).catch((err) => {
        addNotification('error', 'Fail add months')
        setIsAdding(false);
      })
    } finally {
      setIsAdding(false);
    }
  };

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
              Test Fill
            </button>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={fillRealMonths}
              className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded"
            >
              Real Months
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 relative">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Len</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Rate (bps)</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {months.map((row, index) => {
                const isBC = (row.monthId !== undefined) ? true : false
                return (
                  <tr key={index} className="hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <UTCDatePicker
                        value={row.start}
                        onChange={(date) => updateRow(index, 'start', date)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        readOnly={isBC}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <UTCDatePicker
                        value={row.end}
                        onChange={(date) => updateRow(index, 'end', date)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        readOnly={isBC}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getIntervalLength(row.start, row.end)}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row.rateBps}
                        readOnly={isBC}
                        onChange={(e) => updateRow(index, 'rateBps', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                        placeholder="Rate in bps"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {(index == (months.length - 1)) && (
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
        
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={addRow}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
          >
            Add Row
          </button>
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
              {isAdding ? 'Adding...' : 'Add All Months'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageMonths