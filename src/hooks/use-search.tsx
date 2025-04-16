
import React, { createContext, useContext, useState } from 'react';
import SearchDialog from '@/components/SearchDialog';

type SearchContextType = {
  openSearch: () => void;
  closeSearch: () => void;
  isSearchOpen: boolean;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <SearchContext.Provider value={{ openSearch, closeSearch, isSearchOpen }}>
      {children}
      <SearchDialog isOpen={isSearchOpen} onClose={closeSearch} />
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
