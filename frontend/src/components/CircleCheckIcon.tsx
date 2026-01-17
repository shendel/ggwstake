import React from 'react';

interface CircleCheckIconProps {
  className?: string;
}

const CircleCheckIcon: React.FC<CircleCheckIconProps> = ({ className = "h-12 w-12" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
    >
      {/* Круг */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        strokeWidth={2} 
        stroke="currentColor" 
        fill="none" 
        className="text-green-500"
      />
      
      {/* Галочка */}
      <path 
        d="M9 12l2 2 4-4" 
        strokeWidth={2} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-green-500"
      />
    </svg>
  );
};

export default CircleCheckIcon;