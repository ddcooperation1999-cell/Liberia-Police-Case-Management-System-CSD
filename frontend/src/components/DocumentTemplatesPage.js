
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon, FileCopy as FileCopyIcon, Add as AddIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const DocumentTemplatesPage = ({ token, user }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    content: '',
    description: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axiosConfig.get('/document-templates');
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        category: template.category,
        content: template.content,
        description: template.description || '',
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        category: '',
        content: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.category || !formData.content) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingTemplate) {
        await axiosConfig.put(`/document-templates/${editingTemplate.id}`, formData);
        setMessage('Template updated successfully');
      } else {
        await axiosConfig.post('/document-templates', formData);
        setMessage('Template created successfully');
      }
      setOpenDialog(false);
      fetchTemplates();
    } catch (err) {
      setError('Failed to save template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('Delete this template?')) {
      try {
        await axiosConfig.delete(`/document-templates/${id}`);
        setMessage('Template deleted');
        fetchTemplates();
      } catch (err) {
        setError('Failed to delete template');
      }
    }
  };

  const handleMenuOpen = (event, template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(selectedTemplate.content);
      setMessage('Template content copied to clipboard');
      handleMenuClose();
    } catch (err) {
      setError('Failed to copy template');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Document Templates</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Template
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
      ) : templates && templates.length > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box>
                    <Typography variant="h6">{template.name}</Typography>
                    <Chip label={template.category} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, template)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {template.description || 'No description'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {template.content}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">No templates found</Typography>
        </Paper>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedTemplate) handleOpenDialog(selectedTemplate);
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleCopyTemplate}>
          <FileCopyIcon fontSize="small" sx={{ mr: 1 }} /> Copy Content
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedTemplate) handleDeleteTemplate(selectedTemplate.id);
          handleMenuClose();
        }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="arrest_report">Arrest Report</MenuItem>
                <MenuItem value="evidence_log">Evidence Log</MenuItem>
                <MenuItem value="witness_statement">Witness Statement</MenuItem>
                <MenuItem value="interview_notes">Interview Notes</MenuItem>
                <MenuItem value="incident_report">Incident Report</MenuItem>
                <MenuItem value="booking_record">Booking Record</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              label="Template Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              fullWidth
              multiline
              rows={8}
              required
              placeholder="Enter your template content here..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained" color="primary">
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentTemplatesPage;
