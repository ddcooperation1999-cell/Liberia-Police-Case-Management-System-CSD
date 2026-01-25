import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const CaseClosureWorkflow = ({ token, user }) => {
  const [closures, setClosures] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedClosure, setSelectedClosure] = useState(null);
  const [editingClosure, setEditingClosure] = useState(null);
  const [formData, setFormData] = useState({
    case_id: '',
    closing_reason: 'solved',
    closure_date: new Date().toISOString().slice(0, 10),
    disposition: 'guilty',
    notes: '',
    assigned_to: user?.username || '',
  });

  const closureSteps = ['Initiated', 'Evidence Review', 'Final Approval', 'Closed'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [closRes, caseRes] = await Promise.all([
        axiosConfig.get('/case-closure/list'),
        axiosConfig.get('/cases'),
      ]);
      // Ensure closures and cases are always arrays
      const closuresData = Array.isArray(closRes.data) ? closRes.data : (closRes.data?.closures || []);
      const casesData = Array.isArray(caseRes.data) ? caseRes.data : (caseRes.data?.cases || []);
      setClosures(closuresData);
      setCases(casesData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
      setClosures([]);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateClosure = () => {
    setEditingClosure(null);
    setFormData({
      case_id: '',
      closing_reason: 'solved',
      closure_date: new Date().toISOString().slice(0, 10),
      disposition: 'guilty',
      notes: '',
      assigned_to: user?.username || '',
    });
    setOpenDialog(true);
  };

  const handleEditClosure = (closure) => {
    setEditingClosure(closure);
    setFormData(closure);
    setOpenDialog(true);
  };

  const handleSaveClosure = async () => {
    if (!formData.case_id || !formData.closing_reason) {
      setError('Case and closing reason are required');
      return;
    }

    try {
      if (editingClosure) {
        await axiosConfig.put(`/case-closure/${editingClosure.id}`, formData);
        setMessage('Closure updated successfully');
      } else {
        await axiosConfig.post('/case-closure', formData);
        setMessage('Case closure initiated successfully');
      }
      setOpenDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save closure');
    }
  };

  const handleAdvanceStep = async (closureId, nextStep) => {
    try {
      await axiosConfig.patch(`/case-closure/${closureId}/step`, { step: nextStep });
      setMessage('Workflow step updated');
      fetchData();
    } catch (err) {
      setError('Failed to update step');
    }
  };

  const handleApproveClosure = async (closureId) => {
    try {
      await axiosConfig.post(`/case-closure/${closureId}/approve`);
      setMessage('Case closure approved');
      fetchData();
    } catch (err) {
      setError('Failed to approve closure');
    }
  };

  const handleRejectClosure = async (closureId) => {
    try {
      await axiosConfig.post(`/case-closure/${closureId}/reject`);
      setMessage('Case closure rejected');
      fetchData();
    } catch (err) {
      setError('Failed to reject closure');
    }
  };

  const handleDeleteClosure = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axiosConfig.delete(`/case-closure/${id}`);
      setMessage('Closure deleted successfully');
      fetchData();
    } catch (err) {
      setError('Failed to delete closure');
    }
  };

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'solved':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'dismissed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'initiated':
        return 'info';
      case 'review':
        return 'warning';
      case 'approved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Case Closure Workflow</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleInitiateClosure}
        >
          Initiate Closure
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Closures</Typography>
              <Typography variant="h5">{(Array.isArray(closures) ? closures : []).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Closed Cases</Typography>
              <Typography variant="h5">{(Array.isArray(closures) ? closures : []).filter(c => c.status === 'closed').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>In Review</Typography>
              <Typography variant="h5">{(Array.isArray(closures) ? closures : []).filter(c => c.status === 'review').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Solved</Typography>
              <Typography variant="h5">{(Array.isArray(closures) ? closures : []).filter(c => c.closing_reason === 'solved').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Case</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Disposition</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {closures.map((closure) => (
              <TableRow key={closure.id} hover>
                <TableCell>{closure.case_number || `Case #${closure.case_id}`}</TableCell>
                <TableCell>
                  <Chip
                    label={closure.closing_reason}
                    size="small"
                    color={getReasonColor(closure.closing_reason)}
                  />
                </TableCell>
                <TableCell>{closure.disposition}</TableCell>
                <TableCell>
                  <Chip
                    label={closure.status}
                    size="small"
                    color={getStatusColor(closure.status)}
                  />
                </TableCell>
                <TableCell>{closure.assigned_to}</TableCell>
                <TableCell>{new Date(closure.closure_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setSelectedClosure(closure);
                      setOpenDetailsDialog(true);
                    }}
                    title="View Details"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClosure(closure.id)}
                  >
                    <CloseIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingClosure ? 'Edit Case Closure' : 'Initiate Case Closure'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Case</InputLabel>
            <Select
              value={formData.case_id}
              onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
              label="Case"
            >
              {cases.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.case_number || `Case #${c.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Closing Reason</InputLabel>
            <Select
              value={formData.closing_reason}
              onChange={(e) => setFormData({ ...formData, closing_reason: e.target.value })}
              label="Closing Reason"
            >
              <MenuItem value="solved">Solved</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="dismissed">Dismissed</MenuItem>
              <MenuItem value="transferred">Transferred</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Disposition</InputLabel>
            <Select
              value={formData.disposition}
              onChange={(e) => setFormData({ ...formData, disposition: e.target.value })}
              label="Disposition"
            >
              <MenuItem value="guilty">Guilty</MenuItem>
              <MenuItem value="not_guilty">Not Guilty</MenuItem>
              <MenuItem value="acquitted">Acquitted</MenuItem>
              <MenuItem value="insufficient_evidence">Insufficient Evidence</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Closure Date"
            type="date"
            value={formData.closure_date}
            onChange={(e) => setFormData({ ...formData, closure_date: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Assigned To"
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            placeholder="Additional notes about case closure"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveClosure} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Case Closure Details</DialogTitle>
        <DialogContent>
          {selectedClosure && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Workflow Progress</Typography>
                <Stepper activeStep={closureSteps.indexOf(selectedClosure.status || 'Initiated')}>
                  {closureSteps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Case</Typography>
                <Typography variant="body1">{selectedClosure.case_number || `Case #${selectedClosure.case_id}`}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Reason</Typography>
                <Chip label={selectedClosure.closing_reason} color={getReasonColor(selectedClosure.closing_reason)} />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Disposition</Typography>
                <Typography variant="body1">{selectedClosure.disposition}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Notes</Typography>
                <Typography variant="body2">{selectedClosure.notes || 'No notes'}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedClosure?.status !== 'closed' && (
            <>
              <Button
                onClick={() => handleRejectClosure(selectedClosure?.id)}
                color="error"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleApproveClosure(selectedClosure?.id)}
                variant="contained"
                color="success"
              >
                Approve & Advance
              </Button>
            </>
          )}
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseClosureWorkflow;
