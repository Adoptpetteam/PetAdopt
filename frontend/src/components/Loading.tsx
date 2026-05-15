import React from 'react';
import { Spin, SpinProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingProps extends SpinProps {
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  text = 'Đang tải...', 
  fullScreen = false, 
  overlay = false,
  size = 'default',
  ...props 
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

  const spinElement = (
    <Spin 
      indicator={antIcon} 
      description={text}
      size={size}
      {...props}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="text-center">
          {spinElement}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
        <div className="text-center">
          {spinElement}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinElement}
    </div>
  );
};

// Skeleton loading components
export const CardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gray-300 h-48 w-full rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-gray-300 h-12 w-12"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="animate-pulse">
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Loading;