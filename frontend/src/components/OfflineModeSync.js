import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Cloud as CloudIcon, CloudOff as CloudOffIcon, Sync as SyncIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const OfflineModeSync = ({ token, user }) => {
  const [offlineData, setOfflineData] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [openDetails, setOpenDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchOfflineData();
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) setLastSyncTime(new Date(lastSync).toLocaleString());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchOfflineData = async () => {
    try {
      const response = await axiosConfig.get('/offline-sync/pending');
      setOfflineData(response.data || []);
    } catch (err) {
      console.error('Failed to fetch offline data:', err);
    }
  };

  const handleSyncData = async () => {
    if (!isOnline) {
      setError('Cannot sync while offline. Please check your internet connection.');
      return;
    }

    setSyncStatus('syncing');
    setSyncProgress(0);
    setError('');
    setMessage('');

    try {
      const response = await axiosConfig.post('/offline-sync/sync', {
        data: offlineData,
      });

      setSyncProgress(100);
      setMessage(`Successfully synced ${response.data.synced} items`);
      setLastSyncTime(new Date().toLocaleString());
      localStorage.setItem('lastSyncTime', new Date().toISOString());
      
      setOfflineData([]);
      setSyncStatus('complete');

      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Sync failed. Data will be retried later.');
      setSyncStatus('failed');
    }
  };

  const handleClearOfflineData = () => {
    if (window.confirm('Are you sure? This will delete all pending offline changes.')) {
      setOfflineData([]);
      localStorage.removeItem('offlineData');
      setMessage('Offline data cleared');
    }
  };

  const handleDownloadOfflineApp = () => {
    const dataStr = JSON.stringify(offlineData);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `offline-backup-${new Date().toISOString()}.json`);
    document.body.appendChild(link);
    link.click();
    link.parentElement.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Offline Mode & Sync</Typography>
          <Chip
            icon={isOnline ? <CloudIcon /> : <CloudOffIcon />}
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? 'success' : 'warning'}
            variant="outlined"
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Status</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography color="textSecondary">Pending Changes</Typography>
                <Typography variant="h4">{offlineData.length}</Typography>
              </Box>
              <Box>
                <Typography color="textSecondary">Last Sync</Typography>
                <Typography variant="body2">{lastSyncTime || 'Never'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {syncProgress > 0 && syncProgress < 100 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>Syncing... {syncProgress}%</Typography>
            <LinearProgress variant="determinate" value={syncProgress} />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={handleSyncData}
            disabled={!isOnline || syncStatus === 'syncing' || offlineData.length === 0}
          >
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setOpenDetails(true)}
            disabled={offlineData.length === 0}
          >
            View Details
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleDownloadOfflineApp}
            disabled={offlineData.length === 0}
          >
            Backup
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearOfflineData}
            disabled={offlineData.length === 0}
          >
            Clear
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>How It Works</Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
            <ul>
              <li>Changes made while offline are automatically queued</li>
              <li>When online, click "Sync Now" to upload pending changes</li>
              <li>All data is encrypted and stored locally in your browser</li>
              <li>Use Backup to export pending changes as backup</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>

      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>Pending Offline Changes</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Type</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offlineData.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.action}</TableCell>
                    <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                    <TableCell><code>{JSON.stringify(item.data).substring(0, 50)}...</code></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OfflineModeSync;
