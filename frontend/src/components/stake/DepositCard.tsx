// @ts-nocheck
import { useState } from 'react';

export default function DepositCard({ deposit }) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const isLocked = new Date(deposit.unlockDate) > new Date();

  return (
    <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white">{deposit.amount} GGW</h3>
            <p className="text-sm text-gray-300 mt-1">
              Locked for {deposit.lockMonths} months
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isLocked ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {isLocked ? 'Locked' : 'Available'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Unlock Date</span>
            <p className="font-medium">{deposit.unlockDate}</p>
          </div>
          <div>
            <span className="text-gray-500">Rewards</span>
            <p className="font-medium text-green-600">+{deposit.reward} GGW</p>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={isLocked}
            className="flex-1 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>
          <button className="flex-1 py-1.5 text-sm bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 rounded">
            Details
          </button>
        </div>
      </div>

      {showWithdraw && (
        <div className="border-t p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Withdraw Options</h4>
          <div className="space-y-2">
            <button className="w-full text-left py-1.5 px-3 bg-white border rounded hover:bg-gray-50 text-sm">
              Rewards only ({deposit.reward} GGW)
            </button>
            <button 
              disabled={isLocked}
              className="w-full text-left py-1.5 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm"
            >
              Principal + Rewards ({parseFloat(deposit.amount) + parseFloat(deposit.reward)} GGW)
            </button>
          </div>
          <button 
            onClick={() => setShowWithdraw(false)}
            className="mt-2 w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}