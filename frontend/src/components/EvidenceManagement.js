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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Download as DownloadIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const EvidenceManagement = ({ token, user }) => {
  const [evidence, setEvidence] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState(null);
  const [formData, setFormData] = useState({
    case_id: '',
    evidence_number: '',
    evidence_type: 'physical',
    description: '',
    custody_chain: '',
    location: '',
    collected_date: new Date().toISOString().slice(0, 10),
    collected_by: user?.username || '',
    status: 'collected',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, caseRes] = await Promise.all([
        axiosConfig.get('/evidence/list'),
        axiosConfig.get('/cases'),
      ]);
      // Ensure evidence and cases are always arrays
      const evidenceData = Array.isArray(evRes.data) ? evRes.data : (evRes.data?.evidence || []);
      const casesData = Array.isArray(caseRes.data) ? caseRes.data : (caseRes.data?.cases || []);
      setEvidence(evidenceData);
      setCases(casesData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
      setEvidence([]);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvidence = () => {
    setEditingEvidence(null);
    setFormData({
      case_id: '',
      evidence_number: '',
      evidence_type: 'physical',
      description: '',
      custody_chain: '',
      location: '',
      collected_date: new Date().toISOString().slice(0, 10),
      collected_by: user?.username || '',
      status: 'collected',
    });
    setOpenDialog(true);
  };

  const handleEditEvidence = (item) => {
    setEditingEvidence(item);
    setFormData(item);
    setOpenDialog(true);
  };

  const handleSaveEvidence = async () => {
    if (!formData.case_id || !formData.evidence_number || !formData.description) {
      setError('Case, evidence number, and description are required');
      return;
    }

    try {
      if (editingEvidence) {
        await axiosConfig.put(`/evidence/${editingEvidence.id}`, formData);
        setMessage('Evidence updated successfully');
      } else {
        await axiosConfig.post('/evidence', formData);
        setMessage('Evidence added successfully');
      }
      setOpenDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save evidence');
    }
  };

  const handleDeleteEvidence = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axiosConfig.delete(`/evidence/${id}`);
      setMessage('Evidence deleted successfully');
      fetchData();
    } catch (err) {
      setError('Failed to delete evidence');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axiosConfig.patch(`/evidence/${id}/status`, { status: newStatus });
      setMessage('Evidence status updated');
      fetchData();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleExportEvidence = async () => {
    try {
      const response = await axiosConfig.get('/evidence/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `evidence-report-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      setMessage('Evidence exported successfully');
    } catch (err) {
      setError('Failed to export evidence');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Evidence Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportEvidence}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddEvidence}
          >
            Add Evidence
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Items</Typography>
              <Typography variant="h5">{(Array.isArray(evidence) ? evidence : []).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Physical Items</Typography>
              <Typography variant="h5">{(Array.isArray(evidence) ? evidence : []).filter(e => e.evidence_type === 'physical').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Digital Items</Typography>
              <Typography variant="h5">{(Array.isArray(evidence) ? evidence : []).filter(e => e.evidence_type === 'digital').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>In Storage</Typography>
              <Typography variant="h5">{(Array.isArray(evidence) ? evidence : []).filter(e => e.status === 'stored').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Evidence #</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Case</TableCell>
              <TableCell>Collected By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evidence.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell><strong>{item.evidence_number}</strong></TableCell>
                <TableCell>
                  <Chip
                    label={item.evidence_type}
                    size="small"
                    color={item.evidence_type === 'digital' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>{item.description?.substring(0, 50)}</TableCell>
                <TableCell>{item.case_number || `Case #${item.case_id}`}</TableCell>
                <TableCell>{item.collected_by}</TableCell>
                <TableCell>{new Date(item.collected_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Select
                    value={item.status}
                    onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                    size="small"
                    variant="standard"
                  >
                    <MenuItem value="collected">Collected</MenuItem>
                    <MenuItem value="stored">Stored</MenuItem>
                    <MenuItem value="released">Released</MenuItem>
                    <MenuItem value="destroyed">Destroyed</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditEvidence(item)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteEvidence(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvidence ? 'Edit Evidence' : 'Add Evidence'}
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

          <TextField
            label="Evidence Number"
            value={formData.evidence_number}
            onChange={(e) => setFormData({ ...formData, evidence_number: e.target.value })}
            fullWidth
            margin="normal"
            placeholder="e.g., EV-2024-001"
            disabled={!!editingEvidence}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.evidence_type}
              onChange={(e) => setFormData({ ...formData, evidence_type: e.target.value })}
              label="Type"
            >
              <MenuItem value="physical">Physical</MenuItem>
              <MenuItem value="digital">Digital</MenuItem>
              <MenuItem value="documentary">Documentary</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            required
          />

          <TextField
            label="Location/Storage"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            fullWidth
            margin="normal"
            placeholder="e.g., Evidence Locker A-15"
          />

          <TextField
            label="Collected Date"
            type="date"
            value={formData.collected_date}
            onChange={(e) => setFormData({ ...formData, collected_date: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Collected By"
            value={formData.collected_by}
            onChange={(e) => setFormData({ ...formData, collected_by: e.target.value })}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Custody Chain"
            value={formData.custody_chain}
            onChange={(e) => setFormData({ ...formData, custody_chain: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            placeholder="Record of who handled this evidence"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEvidence} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvidenceManagement;
