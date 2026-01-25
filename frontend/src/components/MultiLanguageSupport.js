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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Download as DownloadIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const MultiLanguageSupport = ({ token, user }) => {
  const [translations, setTranslations] = useState([]);
  const [languages, setLanguages] = useState(['English', 'Kpelle', 'Mandingo']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    english: '',
    kpelle: '',
    mandingo: '',
    context: '',
  });

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const response = await axiosConfig.get('/multi-language/translations');
      setTranslations(response.data);
    } catch (err) {
      setError('Failed to load translations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTranslation = () => {
    setEditingTranslation(null);
    setFormData({
      key: '',
      english: '',
      kpelle: '',
      mandingo: '',
      context: '',
    });
    setOpenDialog(true);
  };

  const handleEditTranslation = (translation) => {
    setEditingTranslation(translation);
    setFormData(translation);
    setOpenDialog(true);
  };

  const handleSaveTranslation = async () => {
    if (!formData.key || !formData.english) {
      setError('Key and English translation are required');
      return;
    }

    try {
      if (editingTranslation) {
        await axiosConfig.put(`/multi-language/translations/${editingTranslation.id}`, formData);
        setMessage('Translation updated successfully');
      } else {
        await axiosConfig.post('/multi-language/translations', formData);
        setMessage('Translation created successfully');
      }
      setOpenDialog(false);
      fetchTranslations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save translation');
    }
  };

  const handleDeleteTranslation = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axiosConfig.delete(`/multi-language/translations/${id}`);
      setMessage('Translation deleted successfully');
      fetchTranslations();
    } catch (err) {
      setError('Failed to delete translation');
    }
  };

  const handleExportTranslations = async () => {
    try {
      const response = await axiosConfig.get('/multi-language/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'translations.json');
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      setMessage('Translations exported successfully');
    } catch (err) {
      setError('Failed to export translations');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Multi-Language Support</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportTranslations}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTranslation}
          >
            Add Translation
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Key</TableCell>
              <TableCell>English</TableCell>
              <TableCell>Kpelle</TableCell>
              <TableCell>Mandingo</TableCell>
              <TableCell>Context</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {translations.map((translation) => (
              <TableRow key={translation.id} hover>
                <TableCell><code>{translation.key}</code></TableCell>
                <TableCell>{translation.english}</TableCell>
                <TableCell>{translation.kpelle || '-'}</TableCell>
                <TableCell>{translation.mandingo || '-'}</TableCell>
                <TableCell>{translation.context || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditTranslation(translation)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteTranslation(translation.id)}
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
          {editingTranslation ? 'Edit Translation' : 'Add Translation'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Translation Key"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            fullWidth
            margin="normal"
            disabled={!!editingTranslation}
            placeholder="e.g., case.status.open"
          />
          <TextField
            label="English"
            value={formData.english}
            onChange={(e) => setFormData({ ...formData, english: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Kpelle"
            value={formData.kpelle}
            onChange={(e) => setFormData({ ...formData, kpelle: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Mandingo"
            value={formData.mandingo}
            onChange={(e) => setFormData({ ...formData, mandingo: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Context (optional)"
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
            fullWidth
            margin="normal"
            placeholder="e.g., Used in case management UI"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTranslation} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiLanguageSupport;
