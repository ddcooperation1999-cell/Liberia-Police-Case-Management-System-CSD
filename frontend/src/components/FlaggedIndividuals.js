import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function FlaggedIndividuals({ token }) {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFlag, setEditingFlag] = useState(null);
  const [suspectSearch, setSuspectSearch] = useState('');
  const [formData, setFormData] = useState({
    suspect_id: '',
    reason: '',
    severity: 'medium',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchFlags();
  }, [token]);

  const fetchFlags = async () => {
    setLoading(true);
    setError('');

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API_BASE}/flagged-individuals`, { headers });
      setFlags(response.data);
    } catch (err) {
      console.error('Error fetching flags:', err);
      setError('Failed to load flagged individuals');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (flag = null) => {
    if (flag) {
      setEditingFlag(flag);
      setFormData({
        suspect_id: flag.suspect_id,
        reason: flag.reason,
        severity: flag.severity,
        status: flag.status,
        notes: flag.notes || ''
      });
    } else {
      setEditingFlag(null);
      setFormData({
        suspect_id: suspectSearch,
        reason: '',
        severity: 'medium',
        status: 'active',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFlag(null);
    setSuspectSearch('');
  };

  const handleSaveFlag = async () => {
    if (!formData.suspect_id || !formData.reason) {
      setError('Suspect ID and reason are required');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (editingFlag) {
        // Update existing flag
        await axios.put(
          `${API_BASE}/flagged-individuals/${editingFlag.id}`,
          formData,
          { headers }
        );
      } else {
        // Create new flag
        await axios.post(
          `${API_BASE}/flagged-individuals`,
          formData,
          { headers }
        );
      }

      fetchFlags();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving flag:', err);
      setError('Failed to save flag');
    }
  };

  const handleDeleteFlag = async (flagId) => {
    if (window.confirm('Are you sure you want to remove this flag?')) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(
          `${API_BASE}/flagged-individuals/${flagId}`,
          { headers }
        );
        fetchFlags();
      } catch (err) {
        console.error('Error deleting flag:', err);
        setError('Failed to delete flag');
      }
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'error',
      'high': 'warning',
      'medium': 'info',
      'low': 'success'
    };
    return colors[severity] || 'default';
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Flagged Individuals"
          action={
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => handleOpenDialog()}
            >
              Flag Individual
            </Button>
          }
        />
        <CardContent>
          {flags.length === 0 ? (
            <Alert severity="info">No flagged individuals currently</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Suspect ID</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell><strong>Severity</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Flagged On</strong></TableCell>
                    <TableCell><strong>Flagged By</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flags.map(flag => (
                    <TableRow key={flag.id} hover sx={{
                      bgcolor: flag.severity === 'critical' ? '#ffebee' : 'inherit'
                    }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {flag.suspect_id}
                        </Typography>
                      </TableCell>
                      <TableCell>{flag.reason}</TableCell>
                      <TableCell>
                        <Chip
                          icon={flag.severity === 'critical' ? <WarningIcon /> : undefined}
                          label={flag.severity.toUpperCase()}
                          color={getSeverityColor(flag.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={flag.status}
                          color={flag.status === 'active' ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(flag.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{flag.flagged_by || 'System'}</TableCell>
                      <TableCell align="center">
                        <Button
                          startIcon={<EditIcon />}
                          size="small"
                          onClick={() => handleOpenDialog(flag)}
                        >
                          Edit
                        </Button>
                        <Button
                          startIcon={<DeleteIcon />}
                          size="small"
                          color="error"
                          onClick={() => handleDeleteFlag(flag.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Flag Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFlag ? 'Edit Flag' : 'Flag Individual'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Suspect ID"
            value={formData.suspect_id}
            onChange={(e) => setFormData({ ...formData, suspect_id: e.target.value })}
            placeholder="National ID or suspect number"
            sx={{ mb: 2 }}
            disabled={!!editingFlag}
          />

          <TextField
            fullWidth
            label="Reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Why is this individual flagged?"
            sx={{ mb: 2 }}
            multiline
            rows={2}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              label="Severity"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveFlag} variant="contained">
            {editingFlag ? 'Update' : 'Flag'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FlaggedIndividuals;
