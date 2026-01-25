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
  Tabs,
  Typography,
  Card,
  CardContent,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

function SearchPage({ token }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const tabs = ['Cases', 'Individuals', 'Records', 'Documents', 'Users'];

  const handleSearch = async () => {
    if (query.length < 2) {
      setError('Search query must be at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axiosConfig.post('/search', {
        query,
        searchType: 'all',
      });
      setResults(response.data);
      setSearchPerformed(true);
      setTabValue(0);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderResults = (type) => {
    const data = results[type] || [];
    if (data.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No {type.toLowerCase()} found</Typography>
        </Paper>
      );
    }

    return (
      <List>
        {data.map((item, index) => (
          <Card key={`${type}-${index}`} sx={{ mb: 1 }}>
            <CardContent>
              <Typography variant="h6">
                {item.case_number || item.case_type || item.name || item.username || item.title || `Result ${index + 1}`}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {item.details || item.description || item.email || item.notes || 'No additional details'}
              </Typography>
              {item.status && (
                <Chip label={item.status} size="small" sx={{ mt: 1 }} />
              )}
              {item.case_type && (
                <Chip label={item.case_type} size="small" sx={{ mt: 1, ml: 1 }} />
              )}
              {item.role && (
                <Chip label={item.role} size="small" sx={{ mt: 1, ml: 1 }} />
              )}
            </CardContent>
          </Card>
        ))}
      </List>
    );
  };

  const getTabLabel = (tab, count) => {
    const counts = {
      'Cases': results.cases?.length || 0,
      'Individuals': results.individuals?.length || 0,
      'Records': results.criminal_records?.length || 0,
      'Documents': results.documents?.length || 0,
      'Users': results.users?.length || 0,
    };
    return `${tab} (${counts[tab] || 0})`;
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Search Cases & Individuals</Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search cases, individuals, records, documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
          Enter at least 2 characters to search
        </Typography>
      </Paper>

      {searchPerformed && (
        <>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
            {tabs.map((tab) => (
              <Tab key={tab} label={getTabLabel(tab)} />
            ))}
          </Tabs>

          <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
            {renderResults('cases')}
          </Box>
          <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
            {renderResults('individuals')}
          </Box>
          <Box sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
            {renderResults('criminal_records')}
          </Box>
          <Box sx={{ display: tabValue === 3 ? 'block' : 'none' }}>
            {renderResults('documents')}
          </Box>
          <Box sx={{ display: tabValue === 4 ? 'block' : 'none' }}>
            {renderResults('users')}
          </Box>
        </>
      )}

      {!searchPerformed && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 48, color: 'textSecondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Enter a search query to get started
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default SearchPage;
