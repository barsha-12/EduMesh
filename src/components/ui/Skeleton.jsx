import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-[rgba(208,170,255,0.12)] rounded-card ${className}`} />
  );
};

export default Skeleton;
