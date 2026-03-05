import { useState, useEffect, useRef } from 'react';
import instance from '../components/axios';

export const useSearch = () => {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState({ tasks: [], categories: [], workspaces: [] });
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen]   = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ tasks: [], categories: [], workspaces: [] });
      setIsOpen(false);
      return;
    }

    // Debounce 300ms pour ne pas spammer l'API
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await instance.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results);
        setIsOpen(true);
      } catch (err) {
        console.error('Erreur recherche:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const totalResults = results.tasks.length + results.categories.length + results.workspaces.length;

  const clearSearch = () => {
    setQuery('');
    setResults({ tasks: [], categories: [], workspaces: [] });
    setIsOpen(false);
  };

  return { query, setQuery, results, searching, isOpen, setIsOpen, totalResults, clearSearch };
};
