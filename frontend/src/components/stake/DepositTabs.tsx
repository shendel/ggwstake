import React from 'react';

interface DepositTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DepositTabs: React.FC<DepositTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'withReward', label: 'With Reward' },
    { id: 'unlocked', label: 'Unlocked' },
    { id: 'locked', label: 'Locked' },
    { id: 'closed', label: 'Closed' }
  ];

  return (
    <div className="flex border-b border-gray-700 mb-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 font-medium text-sm transition ${
            activeTab === tab.id
              ? 'border-b-2 border-white text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default DepositTabs;