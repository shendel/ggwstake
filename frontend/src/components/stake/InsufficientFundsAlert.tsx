// InsufficientFundsAlert.tsx
import React from 'react';

interface InsufficientFundsAlertProps {
  depositAmount: string;
  pendingReward: string;
  tokenSymbol: string;
  onWithdrawPrincipal: () => void;
  onClose: () => void;
}

const InsufficientFundsAlert: React.FC<InsufficientFundsAlertProps> = ({
  depositAmount,
  pendingReward,
  tokenSymbol,
  onWithdrawPrincipal,
  onClose
}) => {
  return (
    <div className="bg-red-50">
      {/* Иконка внимания */}
      <div className="flex items-start mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.11 0 2.008-.89 2.008-2V7.5a2 2 0 00-2-2h-13.876A2 2 0 006 7.5v12a2 2 0 002 2z" />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-red-800">Insufficient Funds in Bank</h3>
          <p className="text-sm text-red-700 mt-1">
            Currently, there are not enough funds in the bank to pay out your reward.
          </p>
        </div>
      </div>

      {/* Основное сообщение */}
      <div className="mb-4">
        <p className="text-sm text-gray-800">
          You can now close your deposit and withdraw your principal amount. The earned reward will be available for withdrawal later when funds are replenished in the bank.
        </p>
      </div>

      {/* Информация о суммах */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded border border-gray-200">
          <span className="text-xs text-gray-500">Principal Amount</span>
          <p className="font-bold text-lg text-green-600">{depositAmount} {tokenSymbol}</p>
        </div>
        <div className="bg-white p-3 rounded border border-gray-200">
          <span className="text-xs text-gray-500">Pending Reward</span>
          <p className="font-bold text-lg text-green-600">+{pendingReward} {tokenSymbol}</p>
        </div>
      </div>

      {/* Кнопки действия */}
      <div className="flex space-x-2">
        <button
          onClick={onWithdrawPrincipal}
          className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition"
        >
          Withdraw Principal Only
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InsufficientFundsAlert;