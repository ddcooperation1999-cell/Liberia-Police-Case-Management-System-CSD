import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const CaseAssignmentPage = ({ token, user }) => {
  const [cases, setCases] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, officersRes, assignmentsRes] = await Promise.all([
        axiosConfig.get('/cases'),
        axiosConfig.get('/users'),
        axiosConfig.get('/case-assignments'),
      ]);
      // Ensure all data is arrays
      const casesData = Array.isArray(casesRes.data) ? casesRes.data : (casesRes.data?.cases || []);
      const officersData = Array.isArray(officersRes.data) ? officersRes.data : (officersRes.data?.users || []);
      const assignmentsData = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : (assignmentsRes.data?.assignments || []);
      
      setCases(casesData);
      setOfficers(officersData.filter(u => u.role === 'officer' || u.role === 'supervisor'));
      setAssignments(assignmentsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
      setCases([]);
      setOfficers([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCase = async () => {
    if (!selectedCase || !selectedOfficer) {
      setError('Please select both a case and an officer');
      return;
    }

    setLoading(true);
    try {
      await axiosConfig.post('/case-assignments', {
        case_id: selectedCase,
        officer_id: selectedOfficer,
        priority,
        notes,
      });
      setMessage('Case assigned successfully');
      setOpenDialog(false);
      setSelectedCase('');
      setSelectedOfficer('');
      setPriority('normal');
      setNotes('');
      fetchData();
    } catch (err) {
      setError('Failed to assign case');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Remove this assignment?')) {
      try {
        await axiosConfig.delete(`/case-assignments/${assignmentId}`);
        setMessage('Assignment deleted');
        fetchData();
      } catch (err) {
        setError('Failed to delete assignment');
      }
    }
  };

  const getCaseNumber = (caseId) => {
    const caseItem = cases.find(c => c.id === caseId);
    return caseItem ? caseItem.case_number || `#${caseId}` : `#${caseId}`;
  };

  const getOfficerName = (officerId) => {
    const officer = officers.find(o => o.id === officerId);
    return officer ? `${officer.first_name} ${officer.last_name}` : `Officer #${officerId}`;
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Case Assignments</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Assign Case
        </Button>
      </Box>

      {message && (
        <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Case #</TableCell>
                <TableCell>Officer</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date Assigned</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments && assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <TableRow key={assignment.id} hover>
                    <TableCell>{getCaseNumber(assignment.case_id)}</TableCell>
                    <TableCell>{getOfficerName(assignment.officer_id)}</TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.priority || 'normal'}
                        size="small"
                        color={
                          assignment.priority === 'critical'
                            ? 'error'
                            : assignment.priority === 'high'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.status || 'active'}
                        size="small"
                        color={assignment.status === 'completed' ? 'success' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>
                      {assignment.assignment_date
                        ? new Date(assignment.assignment_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>{assignment.notes || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">No assignments found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Case to Officer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Case</InputLabel>
              <Select
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                label="Select Case"
              >
                {cases.map((caseItem) => (
                  <MenuItem key={caseItem.id} value={caseItem.id}>
                    {caseItem.case_number || `#${caseItem.id}`} - {caseItem.case_type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Select Officer</InputLabel>
              <Select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                label="Select Officer"
              >
                {officers.map((officer) => (
                  <MenuItem key={officer.id} value={officer.id}>
                    {officer.first_name} {officer.last_name} ({officer.badge_number || 'No badge'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Notes"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignCase} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseAssignmentPage;
