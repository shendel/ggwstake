import React from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  text?: string;
  circle?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  color = 'text-indigo-500',
  className = '',
  width,
  height,
  showText = true,
  circle = true,
  text = 'Loading...'
}) => {
  const sizes = {
    sm: { width: 16, height: 16 },
    md: { width: 24, height: 24 },
    lg: { width: 32, height: 32 }
  };

  const dimensions = width && height ? { width, height } : sizes[size];

  return (
    <div className={`inline-flex mr-1 items-center ${className}`}>
      {circle && (
        <div 
          className={`relative ${color} animate-pulse`}
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          <div className="absolute inset-0 rounded-full bg-current opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
          </div>
        </div>
      )}
      {showText && (
        <span className={`ml-1 text-sm ${color} animate-pulse`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingIndicator;