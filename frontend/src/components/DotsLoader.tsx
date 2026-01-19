import React from 'react';

interface DotsLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  dotSpacing?: number;
  speed?: number;
  lineHeight?: number;
}

const DotsLoader: React.FC<DotsLoaderProps> = ({
  size = 'md',
  color = 'text-white',
  className = '',
  dotSpacing = 2,
  speed = 1.5,
  lineHeight = 1
}) => {
  const sizes = {
    sm: { dotSize: 4, lineHeight: 16 },
    md: { dotSize: 6, lineHeight: 20 },
    lg: { dotSize: 8, lineHeight: 24 }
  };

  const { dotSize, lineHeight: defaultLineHeight } = sizes[size];
  const finalLineHeight = lineHeight !== 1 ? lineHeight : defaultLineHeight;

  const dots = Array.from({ length: 3 }, (_, i) => (
    <em
      key={i}
      className={`inline-block bg-current rounded-full ${color} animate-bounce align-middle`}
      style={{
        width: dotSize,
        height: dotSize,
        margin: `0 ${dotSpacing}px`,
        animationDelay: `${i * (speed / 3)}s`,
        animationDuration: `${speed}s`,
        verticalAlign: 'middle'
      }}
    />
  ));

  return (
    <em 
      className={`inline-flex items-center ${className} ml-1 mr-1`}
      style={{ lineHeight: finalLineHeight, verticalAlign: 'baseline' }}
    >
      {dots}
    </em>
  );
};

export default DotsLoader;