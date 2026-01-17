import React from 'react';

interface HideShowProps {
  isHidden: boolean;
  onToggle: () => void;
  hideText?: string;
  showText?: string;
}

const HideShow: React.FC<HideShowProps> = ({ 
  isHidden = false, 
  onToggle = () => {}, 
  hideText = "Hide", 
  showText = "Show" 
}) => {
  return (
    <button
      onClick={onToggle}
      className="ml-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center"
      title={isHidden ? `Show ${showText.toLowerCase()}` : `Hide ${hideText.toLowerCase()}`}
    >
      {isHidden ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {showText}
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
          {hideText}
        </>
      )}
    </button>
  );
};

export default HideShow;