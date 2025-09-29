import React, { useState, useCallback } from 'react';

interface SearchProps {
  algoliaConfig?: {
    appId: string;
    apiKey: string;
    indexName: string;
  };
}

export const Search: React.FC<SearchProps> = ({ algoliaConfig }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Local search implementation
  const handleLocalSearch = useCallback((query: string) => {
    setLocalSearchQuery(query);
    // TODO: Implement local search logic here
    // This could involve searching through a pre-built index of your documentation
  }, []);

  // Always use fallback local search for now to avoid dependency issues
  return (
    <div className="relative">
      <input
        type="search"
        className="w-64 px-4 py-2 text-sm text-gray-900 bg-gray-100 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
        placeholder="Search documentation..."
        value={localSearchQuery}
        onChange={(e) => handleLocalSearch(e.target.value)}
      />
    </div>
  );
};