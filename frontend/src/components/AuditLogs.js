import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const AuditLogs = ({ userIdFilter = null }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, filters, userIdFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...filters
      };

      if (userIdFilter) {
        params.userId = userIdFilter;
      }

      const response = await axiosConfig.get('/audit-logs', { params });
      setLogs(response.data.logs || []);
      setTotal(response.data.total || 0);
      setError('');
    } catch (err) {
      setError('Failed to load audit logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = async () => {
    try {
      const response = await axiosConfig.get('/audit-logs/export', {
        params: filters,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to export logs');
      console.error('Export error:', err);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('DELETE')) return 'error';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'warning';
    if (action.includes('CREATE') || action.includes('ADD')) return 'success';
    return 'info';
  };

  return (
    <Box>
      <h2>Audit Logs</h2>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f9f9f9' }}>
        <h4>Filters</h4>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
          <TextField
            label="Action"
            size="small"
            value={filters.action}
            onChange={(e) => {
              setFilters({ ...filters, action: e.target.value });
              setPage(0);
            }}
            placeholder="e.g., CREATE, UPDATE, DELETE"
          />

          <TextField
            label="Resource Type"
            size="small"
            value={filters.resourceType}
            onChange={(e) => {
              setFilters({ ...filters, resourceType: e.target.value });
              setPage(0);
            }}
            placeholder="e.g., case, user, document"
          />

          <TextField
            label="From Date"
            type="datetime-local"
            size="small"
            value={filters.dateFrom}
            onChange={(e) => {
              setFilters({ ...filters, dateFrom: e.target.value });
              setPage(0);
            }}
            InputLabelProps={{
              shrink: true
            }}
          />

          <TextField
            label="To Date"
            type="datetime-local"
            size="small"
            value={filters.dateTo}
            onChange={(e) => {
              setFilters({ ...filters, dateTo: e.target.value });
              setPage(0);
            }}
            InputLabelProps={{
              shrink: true
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setFilters({ action: '', resourceType: '', dateFrom: '', dateTo: '' });
              setPage(0);
            }}
          >
            Clear Filters
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </Box>
      </Paper>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Resource ID</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow
                      key={log.id}
                      hover
                      onClick={() => setSelectedLog(log)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {log.username ? (
                          <Box>
                            <div>{log.username}</div>
                            <span style={{ fontSize: '0.85em', color: '#999' }}>{log.email}</span>
                          </Box>
                        ) : (
                          'Unknown'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          color={getActionColor(log.action)}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{log.resource_type}</TableCell>
                      <TableCell>{log.resource_id || '-'}</TableCell>
                      <TableCell>{log.ip_address || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </TableContainer>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <strong>Timestamp:</strong>
                <div>{new Date(selectedLog.timestamp).toLocaleString()}</div>
              </Box>

              <Box sx={{ mb: 2 }}>
                <strong>User:</strong>
                <div>{selectedLog.username || 'Unknown'}</div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{selectedLog.email}</div>
              </Box>

              <Box sx={{ mb: 2 }}>
                <strong>Action:</strong>
                <div>
                  <Chip
                    label={selectedLog.action}
                    color={getActionColor(selectedLog.action)}
                    size="small"
                  />
                </div>
              </Box>

              <Box sx={{ mb: 2 }}>
                <strong>Resource Type:</strong>
                <div>{selectedLog.resource_type}</div>
              </Box>

              <Box sx={{ mb: 2 }}>
                <strong>Resource ID:</strong>
                <div>{selectedLog.resource_id || 'N/A'}</div>
              </Box>

              {selectedLog.old_value && (
                <Box sx={{ mb: 2 }}>
                  <strong>Old Value:</strong>
                  <div style={{ 
                    backgroundColor: '#ffe0e0',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}>
                    {selectedLog.old_value}
                  </div>
                </Box>
              )}

              {selectedLog.new_value && (
                <Box sx={{ mb: 2 }}>
                  <strong>New Value:</strong>
                  <div style={{
                    backgroundColor: '#e0ffe0',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}>
                    {selectedLog.new_value}
                  </div>
                </Box>
              )}

              {selectedLog.ip_address && (
                <Box sx={{ mb: 2 }}>
                  <strong>IP Address:</strong>
                  <div>{selectedLog.ip_address}</div>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogs;
