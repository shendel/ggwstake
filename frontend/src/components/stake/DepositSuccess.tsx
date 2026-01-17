import React from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import CircleCheckIcon from '@/components/CircleCheckIcon'

interface DepositSuccessProps {
  amount: string;
  lockMonths: string;
  estimatedReward: string;
  tokenSymbol: string;
  onOk: () => void;
}

const DepositSuccess: React.FC<DepositSuccessProps> = ({ 
  amount, 
  lockMonths, 
  estimatedReward, 
  tokenSymbol, 
  onOk 
}) => {
  const { addNotification } = useNotification();

  const handleOkClick = () => {
    // Добавляем уведомление о завершении
    addNotification('success', `Deposit of ${amount} ${tokenSymbol} created successfully!`);
    onOk();
  };

  return (
    <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-6">
      {/* Иконка успеха */}
      <div className="flex justify-center mb-4">
        <CircleCheckIcon />
      </div>

      <h2 className="text-xl font-semibold text-white mb-4 text-center">Congratulations!</h2>
      
      <div className="space-y-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-1">Deposit Amount</p>
          <p className="text-xl font-bold text-white">{amount} {tokenSymbol}</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-1">Lock Period</p>
          <p className="text-xl font-bold text-white">{lockMonths} months</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-300 mb-1">Estimated Reward</p>
          <p className="text-xl font-bold text-green-400">{estimatedReward} {tokenSymbol}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          Your deposit has been successfully created. The funds are now locked for the specified period and will generate rewards according to the current rate.
        </p>
      </div>

      <button
        onClick={handleOkClick}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg transition"
      >
        OK, Got It!
      </button>
    </div>
  );
};

export default DepositSuccess;