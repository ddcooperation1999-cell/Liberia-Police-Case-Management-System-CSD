import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const CaseAssignment = ({ caseId, open = false, onClose }) => {
  const [officers, setOfficers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [priority, setPriority] = useState('normal');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && caseId) {
      fetchOfficers();
      fetchAssignments();
    }
  }, [open, caseId]);

  const fetchOfficers = async () => {
    try {
      const response = await axiosConfig.get('/users');
      // Ensure response data is an array
      const usersData = Array.isArray(response.data) ? response.data : (response.data?.users || []);
      const officersList = usersData.filter(u => u.role === 'officer' || u.role === 'supervisor');
      setOfficers(officersList);
    } catch (err) {
      console.error('Error fetching officers:', err);
      setError('Failed to load officers');
      setOfficers([]);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axiosConfig.get(`/case-assignments/${caseId}`);
      // Ensure assignments is an array
      const assignmentsData = Array.isArray(response.data) ? response.data : (response.data?.assignments || []);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setAssignments([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedOfficer) {
      setError('Please select an officer');
      return;
    }

    setLoading(true);
    try {
      await axiosConfig.post('/case-assignments', {
        caseId,
        officerId: parseInt(selectedOfficer),
        priority,
        dueDate: dueDate || null,
        notes
      });

      setSelectedOfficer('');
      setPriority('normal');
      setDueDate('');
      setNotes('');
      setError('');
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign case');
      console.error('Error assigning case:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAssignment = async (assignmentId) => {
    setLoading(true);
    try {
      await axiosConfig.put(`/case-assignments/${assignmentId}`, {
        status: 'completed'
      });
      fetchAssignments();
    } catch (err) {
      setError('Failed to complete assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Remove this assignment?')) {
      setLoading(true);
      try {
        await axiosConfig.delete(`/case-assignments/${assignmentId}`);
        fetchAssignments();
      } catch (err) {
        setError('Failed to delete assignment');
      } finally {
        setLoading(false);
      }
    }
  };

  const getPriorityColor = (p) => {
    const colors = {
      low: 'success',
      normal: 'info',
      high: 'warning',
      critical: 'error'
    };
    return colors[p] || 'default';
  };

  const getStatusColor = (s) => {
    const colors = {
      active: 'primary',
      completed: 'success',
      reassigned: 'warning',
      inactive: 'default'
    };
    return colors[s] || 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Assign Case to Officer</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <TextField
            select
            label="Select Officer"
            value={selectedOfficer}
            onChange={(e) => setSelectedOfficer(e.target.value)}
            disabled={loading}
            fullWidth
            SelectProps={{
              native: true
            }}
          >
            <option value="">Choose an officer...</option>
            {officers.map(officer => (
              <option key={officer.id} value={officer.id}>
                {officer.first_name} {officer.last_name} ({officer.role})
              </option>
            ))}
          </TextField>

          <TextField
            select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={loading}
            fullWidth
            SelectProps={{
              native: true
            }}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </TextField>

          <TextField
            label="Due Date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={loading}
            fullWidth
            InputLabelProps={{
              shrink: true
            }}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Assignment Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for this assignment..."
          disabled={loading}
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 3 }}>
          <h4>Current Assignments</h4>
          {assignments.length === 0 ? (
            <Alert severity="info">No assignments yet</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Officer</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        {assignment.officer_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.priority}
                          color={getPriorityColor(assignment.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.status}
                          color={getStatusColor(assignment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {assignment.status === 'active' && (
                          <IconButton
                            size="small"
                            onClick={() => handleCompleteAssignment(assignment.id)}
                            title="Mark Complete"
                          >
                            <CheckCircleIcon fontSize="small" color="success" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          title="Remove"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          color="primary"
          disabled={loading || !selectedOfficer}
        >
          {loading ? <CircularProgress size={24} /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CaseAssignment;
