import { useState } from 'react';

export const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className="w-full">
      {children({ activeTab, setActiveTab })}
    </div>
  );
};

export const TabsList = ({ children }) => (
  <div className="inline-flex gap-1 border-b border-gray-200">
    {children}
  </div>
);

export const TabsTrigger = ({ value, children, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(value)}
    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
      activeTab === value
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, activeTab }) =>
  activeTab === value ? <div className="mt-4">{children}</div> : null;
