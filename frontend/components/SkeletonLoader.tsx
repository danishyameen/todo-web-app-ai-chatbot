import React from 'react';

interface SkeletonProps {
  className?: string;
}

const SkeletonLoader = ({ className = '' }: SkeletonProps) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};

export default SkeletonLoader;