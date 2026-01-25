import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Tab,
  Tabs
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const SearchBar = ({ onSelectResult = () => {} }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  const tabs = ['Cases', 'Individuals', 'Records', 'Documents'];

  useEffect(() => {
    if (query.length >= 2) {
      performSearch();
      fetchSuggestions();
    } else {
      setResults({});
      setSuggestions([]);
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await axiosConfig.post('/search', {
        query,
        searchType: 'all',
        limit: 10
      });
      setResults(response.data.results || {});
    } catch (err) {
      console.error('Search error:', err);
      setResults({});
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axiosConfig.get(`/search/autocomplete/${query}`, {
        params: { type: 'all', limit: 5 }
      });
      setSuggestions(response.data.suggestions || {});
    } catch (err) {
      console.error('Autocomplete error:', err);
    }
  };

  const handleSelectResult = (result) => {
    onSelectResult(result);
    setOpen(false);
    setQuery('');
  };

  const getSuggestionsList = () => {
    const all = [];
    if (suggestions.cases) {
      all.push(...suggestions.cases.map(s => ({ type: 'case', value: s })));
    }
    if (suggestions.individuals) {
      all.push(...suggestions.individuals.map(s => ({ type: 'individual', value: s })));
    }
    if (suggestions.charges) {
      all.push(...suggestions.charges.map(s => ({ type: 'charge', value: s })));
    }
    return all;
  };

  const getResultsForTab = () => {
    const tabIndex = tabValue;
    if (tabIndex === 0) return results.cases || [];
    if (tabIndex === 1) return results.individuals || [];
    if (tabIndex === 2) return results.records || [];
    if (tabIndex === 3) return results.documents || [];
    return [];
  };

  const renderResultItem = (result, index) => {
    const tabIndex = tabValue;
    
    if (tabIndex === 0) { // Cases
      return (
        <ListItem key={index} disablePadding>
          <ListItemButton onClick={() => handleSelectResult(result)}>
            <ListItemText
              primary={result.case_number}
              secondary={`${result.status} • ${result.description?.substring(0, 50)}...`}
            />
          </ListItemButton>
        </ListItem>
      );
    }
    
    if (tabIndex === 1) { // Individuals
      return (
        <ListItem key={index} disablePadding>
          <ListItemButton onClick={() => handleSelectResult(result)}>
            <ListItemText
              primary={`${result.first_name} ${result.last_name}`}
              secondary={`${result.email || 'No email'} • ${result.phone || 'No phone'}`}
            />
          </ListItemButton>
        </ListItem>
      );
    }
    
    if (tabIndex === 2) { // Records
      return (
        <ListItem key={index} disablePadding>
          <ListItemButton onClick={() => handleSelectResult(result)}>
            <ListItemText
              primary={result.charge}
              secondary={`${result.first_name} ${result.last_name} • ${result.status}`}
            />
          </ListItemButton>
        </ListItem>
      );
    }
    
    if (tabIndex === 3) { // Documents
      return (
        <ListItem key={index} disablePadding>
          <ListItemButton onClick={() => handleSelectResult(result)}>
            <ListItemText
              primary={result.file_name}
              secondary={result.document_type}
            />
          </ListItemButton>
        </ListItem>
      );
    }
  };

  const resultsForTab = getResultsForTab();

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <TextField
          placeholder="Search cases, individuals, records..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />

        {/* Autocomplete suggestions */}
        {query.length >= 2 && getSuggestionsList().length > 0 && (
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: 200,
              overflow: 'auto',
              zIndex: 1000,
              mt: 0.5
            }}
          >
            <List dense>
              {getSuggestionsList().slice(0, 5).map((suggestion, idx) => (
                <ListItem key={idx} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setQuery(suggestion.value);
                      setOpen(true);
                    }}
                  >
                    <ListItemText
                      primary={suggestion.value}
                      secondary={<Chip label={suggestion.type} size="small" />}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Search Results Dialog */}
      <Dialog open={open && query.length >= 2} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Search Results
          {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
        </DialogTitle>
        <DialogContent dividers>
          <Tabs value={tabValue} onChange={(e, value) => setTabValue(value)}>
            {tabs.map((tab, idx) => (
              <Tab
                key={idx}
                label={`${tab} (${getResultsForTab().length})`}
              />
            ))}
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : resultsForTab.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              No results found
            </Box>
          ) : (
            <List>
              {resultsForTab.map((result, idx) => renderResultItem(result, idx))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchBar;
