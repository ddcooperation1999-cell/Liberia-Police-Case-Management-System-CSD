import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const DEPARTMENTS = ['CID', 'Traffic', 'Patrol', 'Narcotics', 'Homicide', 'Special Operations'];

function DepartmentDashboard({ token, user }) {
  const [selectedDept, setSelectedDept] = useState(user?.department || 'CID');
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchDepartmentData();
  }, [selectedDept, token]);

  const fetchDepartmentData = async () => {
    setLoading(true);
    setError('');

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch cases for department
      const casesRes = await axios.get(
        `${API_BASE}/cases?department=${selectedDept}${statusFilter ? `&status=${statusFilter}` : ''}`,
        { headers }
      );

      // Fetch department stats
      const statsRes = await axios.get(
        `${API_BASE}/analytics/cases/by-department`,
        { headers }
      );

      // Ensure cases is always an array
      const casesData = Array.isArray(casesRes.data) ? casesRes.data : (casesRes.data?.cases || []);
      setCases(casesData);

      // Get stats for this department
      const statsArray = Array.isArray(statsRes.data) ? statsRes.data : [];
      const deptStat = statsArray.find(d => d.department === selectedDept);
      setStats(deptStat || { department: selectedDept, count: 0 });
    } catch (err) {
      console.error('Error fetching department data:', err);
      setError('Failed to load department data');
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (caseId, newStatus, notes) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `${API_BASE}/cases/${caseId}/status`,
        { new_status: newStatus, notes },
        { headers }
      );

      // Refresh cases
      fetchDepartmentData();
      setOpenCaseDialog(false);
      setEditingCase(null);
    } catch (err) {
      console.error('Error updating case:', err);
      setError('Failed to update case status');
    }
  };

  const handleDeleteCase = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API_BASE}/cases/${caseId}`, { headers });
        fetchDepartmentData();
      } catch (err) {
        console.error('Error deleting case:', err);
        setError('Failed to delete case');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'info',
      'closed': 'success',
      'pending': 'warning',
      'in-progress': 'primary',
      'awaiting-review': 'warning',
      'suspended': 'error'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'error',
      'high': 'warning',
      'normal': 'info',
      'low': 'success'
    };
    return colors[priority] || 'default';
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Department Selection and Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              label="Department"
            >
              {DEPARTMENTS.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status Filter"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Department Stats */}
      {stats && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#2196F3', color: 'white' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">{selectedDept} Department</Typography>
              <Typography variant="h4">{stats.count || (Array.isArray(cases) ? cases.length : 0)} Cases</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                Open: <Chip label={Array.isArray(cases) ? cases.filter(c => c.status === 'open').length : 0} size="small" />
                {' '}
                Closed: <Chip label={Array.isArray(cases) ? cases.filter(c => c.status === 'closed').length : 0} size="small" />
                {' '}
                Pending: <Chip label={Array.isArray(cases) ? cases.filter(c => c.status === 'pending').length : 0} size="small" />
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Cases Table */}
      <Card>
        <CardHeader title={`${selectedDept} Cases`} />
        <CardContent>
          {cases.length === 0 ? (
            <Alert severity="info">No cases found for this department</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Case #</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Victim</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Priority</strong></TableCell>
                    <TableCell><strong>Investigator</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cases.map(caseItem => (
                    <TableRow key={caseItem.id} hover>
                      <TableCell><strong>{caseItem.case_number}</strong></TableCell>
                      <TableCell>{caseItem.case_type}</TableCell>
                      <TableCell>{caseItem.victim_name || 'N/A'}</TableCell>
                      <TableCell>{caseItem.location || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={caseItem.status}
                          color={getStatusColor(caseItem.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={caseItem.priority}
                          color={getPriorityColor(caseItem.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{caseItem.investigator || 'Unassigned'}</TableCell>
                      <TableCell align="center">
                        <Button
                          startIcon={<EditIcon />}
                          size="small"
                          onClick={() => {
                            setEditingCase(caseItem);
                            setOpenCaseDialog(true);
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          startIcon={<DeleteIcon />}
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCase(caseItem.id)}
                        >
                          Delete
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

      {/* Case Status Update Dialog */}
      <CaseStatusDialog
        open={openCaseDialog}
        case={editingCase}
        onClose={() => setOpenCaseDialog(false)}
        onUpdate={handleUpdateStatus}
      />
    </Box>
  );
}

// Case Status Update Dialog Component
function CaseStatusDialog({ open, case: caseItem, onClose, onUpdate }) {
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (caseItem) {
      setNewStatus(caseItem.status);
      setNotes('');
    }
  }, [caseItem]);

  const handleUpdate = () => {
    if (newStatus) {
      onUpdate(caseItem.id, newStatus, notes);
    }
  };

  if (!caseItem) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Case Status</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Case:</strong> {caseItem.case_number} - {caseItem.case_type}
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>New Status</InputLabel>
          <Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            label="New Status"
          >
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="awaiting-review">Awaiting Review</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this status update..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpdate} variant="contained">
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DepartmentDashboard;
