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
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const AuditLogsPage = ({ token, user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    table_affected: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        ...filters,
      };

      const response = await axiosConfig.get('/audit-logs', { params });
      setLogs(response.data.logs || response.data || []);
      setTotal(response.data.total || response.data.length || 0);
      setError('');
    } catch (err) {
      setError('Failed to load audit logs. Make sure you are an admin.');
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

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(0);
  };

  const handleApplyFilters = () => {
    setPage(0);
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      const response = await axiosConfig.get('/audit-logs/export', {
        params: filters,
        responseType: 'blob',
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
    if (action.includes('LOGIN') || action.includes('CREATE')) return 'success';
    return 'default';
  };

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setOpenDetails(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Audit Logs</Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Filters</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Action</InputLabel>
            <Select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              label="Action"
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="CREATE">Create</MenuItem>
              <MenuItem value="UPDATE">Update</MenuItem>
              <MenuItem value="DELETE">Delete</MenuItem>
              <MenuItem value="LOGIN">Login</MenuItem>
              <MenuItem value="LOGOUT">Logout</MenuItem>
              <MenuItem value="ACCESS">Access</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Table/Resource"
            value={filters.table_affected}
            onChange={(e) => handleFilterChange('table_affected', e.target.value)}
            size="small"
            fullWidth
          />

          <TextField
            label="From Date"
            type="date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="To Date"
            type="date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Button variant="contained" color="primary" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id} hover onClick={() => handleRowClick(log)} style={{ cursor: 'pointer' }}>
                      <TableCell>{new Date(log.timestamp || log.created_at).toLocaleString()}</TableCell>
                      <TableCell>{log.user_id || log.username || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          color={getActionColor(log.action)}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>{log.table_affected || log.resource_type || '-'}</TableCell>
                      <TableCell>{log.details || log.description || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">No audit logs found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

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

      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box>
                <Typography variant="subtitle2">Timestamp</Typography>
                <Typography variant="body2">{new Date(selectedLog.timestamp || selectedLog.created_at).toLocaleString()}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">User</Typography>
                <Typography variant="body2">{selectedLog.user_id || selectedLog.username || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Action</Typography>
                <Chip label={selectedLog.action} size="small" color={getActionColor(selectedLog.action)} />
              </Box>
              <Box>
                <Typography variant="subtitle2">Resource/Table</Typography>
                <Typography variant="body2">{selectedLog.table_affected || selectedLog.resource_type || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Details</Typography>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {selectedLog.details || selectedLog.description || '-'}
                </Typography>
              </Box>
              {selectedLog.old_value && (
                <Box>
                  <Typography variant="subtitle2">Previous Value</Typography>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                    {JSON.stringify(JSON.parse(selectedLog.old_value), null, 2)}
                  </Typography>
                </Box>
              )}
              {selectedLog.new_value && (
                <Box>
                  <Typography variant="subtitle2">New Value</Typography>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                    {JSON.stringify(JSON.parse(selectedLog.new_value), null, 2)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogsPage;
