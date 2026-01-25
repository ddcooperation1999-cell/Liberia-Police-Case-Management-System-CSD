import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Typography,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Edit, Delete, Logout, People } from '@mui/icons-material';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function CasesAdmin({ token, user, onLogout }) {
  // ... existing code ...

  const exportToCSV = () => {
    const headers = ['ID', 'County', 'Case Type', 'Details', 'Month', 'Disposition', 'Investigator'];
    const csvContent = [
      headers.join(','),
      ...filteredCases.map(caseItem => [
        caseItem.id,
        `"${caseItem.county}"`,
        `"${caseItem.case_type}"`,
        `"${caseItem.details}"`,
        `"${caseItem.month || ''}"`,
        `"${caseItem.disposition || ''}"`,
        `"${caseItem.investigator || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'police_cases.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [formData, setFormData] = useState({ county: '', case_type: '', details: '', month: '', disposition: '', investigator: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = (Array.isArray(cases) ? cases : []).filter(caseItem =>
    caseItem.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.case_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (caseItem.month && caseItem.month.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (caseItem.disposition && caseItem.disposition.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (caseItem.investigator && caseItem.investigator.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const [saving, setSaving] = useState(false);

  // User management state
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [counties, setCounties] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({ username: '', password: '', county_id: '' });
  const [userSaving, setUserSaving] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiUrl}/api/cases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure cases is always an array
      const casesData = Array.isArray(res.data) ? res.data : (res.data?.cases || []);
      setCases(casesData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch cases');
      setCases([]);
      if (err.response?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [token]);

  const handleOpenDialog = (caseItem = null) => {
    setEditingCase(caseItem);
    const initialData = caseItem ? { county: caseItem.county, case_type: caseItem.case_type, details: caseItem.details, month: caseItem.month || '', disposition: caseItem.disposition || '', investigator: caseItem.investigator || '' } : { county: user?.role === 'officer' ? user.county_name || '' : '', case_type: '', details: '', month: '', disposition: '', investigator: '' };
    setFormData(initialData);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCase(null);
    setFormData({ county: '', case_type: '', details: '', month: '', disposition: '', investigator: '' });
  };

  const handleSave = async () => {
    // Trim inputs
    const trimmedData = {
      county: formData.county.trim(),
      case_type: formData.case_type.trim(),
      details: formData.details.trim(),
      month: formData.month.trim(),
      disposition: formData.disposition.trim(),
      investigator: formData.investigator.trim()
    };

    if (!trimmedData.county || !trimmedData.case_type || !trimmedData.details) {
      setError('County, case type, and details are required and cannot be empty');
      return;
    }

    if (trimmedData.county.length > 100 || trimmedData.case_type.length > 100 || trimmedData.details.length > 1000) {
      setError('Input fields exceed maximum length');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingCase) {
        await axios.put(`${apiUrl}/api/cases/${editingCase.id}`, trimmedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${apiUrl}/api/cases`, trimmedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchCases();
      handleCloseDialog();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save case. Please check your connection and try again.';
      setError(errorMsg);
      if (err.response?.status === 401) onLogout();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this case?')) return;
    try {
      await axios.delete(`${apiUrl}/api/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete case');
      if (err.response?.status === 401) onLogout();
    }
  };

  // User management functions
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      if (err.response?.status === 401) onLogout();
    }
  };

  const fetchCounties = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/counties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCounties(res.data);
    } catch (err) {
      console.error('Failed to fetch counties:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && users.length === 0) {
      fetchUsers();
      fetchCounties();
    }
  };

  const handleOpenUserDialog = (userItem = null) => {
    setEditingUser(userItem);
    setUserFormData(userItem ? { username: userItem.username, password: '', county_id: userItem.county_id || '' } : { username: '', password: '', county_id: '' });
    setUserDialogOpen(true);
  };

  const handleCloseUserDialog = () => {
    setUserDialogOpen(false);
    setEditingUser(null);
    setUserFormData({ username: '', password: '', county_id: '' });
  };

  const handleSaveUser = async () => {
    const trimmedData = {
      username: userFormData.username.trim(),
      password: userFormData.password.trim(),
      county_id: userFormData.county_id
    };

    if (!trimmedData.username || (!editingUser && !trimmedData.password)) {
      setError('Username and password are required');
      return;
    }

    if (trimmedData.username.length > 50 || trimmedData.password.length > 100) {
      setError('Input fields exceed maximum length');
      return;
    }

    setUserSaving(true);
    setError(null);
    try {
      if (editingUser) {
        await axios.put(`${apiUrl}/api/users/${editingUser.id}`, trimmedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${apiUrl}/api/auth/register`, trimmedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchUsers();
      handleCloseUserDialog();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save user. Please check your connection and try again.';
      setError(errorMsg);
      if (err.response?.status === 401) onLogout();
    } finally {
      setUserSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${apiUrl}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
      if (err.response?.status === 401) onLogout();
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Liberia National Police - Case Management System</Typography>
        <Box>
          <Button variant="outlined" startIcon={<Logout />} onClick={onLogout}>
            Logout ({user?.username})
          </Button>
        </Box>
      </Box>

      {user?.role === 'admin' && (
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Cases" />
          <Tab label="User Management" />
        </Tabs>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Cases</Typography>
        <Box>
          <TextField
            label="Search Cases"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button variant="outlined" onClick={exportToCSV} sx={{ mr: 1 }}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Add Case
          </Button>
          <Button variant="outlined" startIcon={<Logout />} onClick={onLogout} sx={{ ml: 1 }}>
            Logout
          </Button>
        </Box>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>County</TableCell>
                <TableCell>Case Type</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Month</TableCell>
                <TableCell>Disposition</TableCell>
                <TableCell>Investigator</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell>{caseItem.county}</TableCell>
                  <TableCell>{caseItem.case_type}</TableCell>
                  <TableCell>{caseItem.details}</TableCell>
                  <TableCell>{caseItem.month}</TableCell>
                  <TableCell>{caseItem.disposition}</TableCell>
                  <TableCell>{caseItem.investigator}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleOpenDialog(caseItem)}>
                      <Edit />
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(caseItem.id)}>
                      <Delete />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingCase ? 'Edit Case' : 'Add Case'}</DialogTitle>
        <DialogContent>
          <TextField
            label="County"
            fullWidth
            margin="normal"
            required
            value={formData.county}
            onChange={(e) => setFormData({ ...formData, county: e.target.value })}
            disabled={user?.role === 'officer'}
          />
          <TextField
            label="Case Type"
            fullWidth
            margin="normal"
            required
            value={formData.case_type}
            onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
          />
          <TextField
            label="Details"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            required
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          />
          <TextField
            label="Month"
            fullWidth
            margin="normal"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
          />
          <TextField
            label="Disposition"
            fullWidth
            margin="normal"
            value={formData.disposition}
            onChange={(e) => setFormData({ ...formData, disposition: e.target.value })}
          />
          <TextField
            label="Investigator"
            fullWidth
            margin="normal"
            value={formData.investigator}
            onChange={(e) => setFormData({ ...formData, investigator: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}