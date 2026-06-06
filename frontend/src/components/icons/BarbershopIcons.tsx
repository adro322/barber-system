import React from 'react';

export const ScissorsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 7C7.10457 7 8 6.10457 8 5C8 3.89543 7.10457 3 6 3C4.89543 3 4 3.89543 4 5C4 6.10457 4.89543 7 6 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 19C7.10457 19 8 18.1046 8 17C8 15.8954 7.10457 15 6 15C4.89543 15 4 15.8954 4 17C4 18.1046 4.89543 19 6 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 12L8 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 17L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 5L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 17L13 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CombIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
    <line x1="6" y1="8" x2="6" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="9" y1="8" x2="9" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="8" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="15" y1="8" x2="15" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="18" y1="8" x2="18" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
