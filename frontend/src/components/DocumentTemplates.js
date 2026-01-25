import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon, FileCopy as FileCopyIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const DocumentTemplates = ({ open = false, onClose, onSelectTemplate = () => {} }) => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: '',
    templateContent: '',
    description: ''
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchTemplates();
    }
  }, [open]);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axiosConfig.get('/document-templates/categories/list');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await axiosConfig.get('/document-templates', { params });
      setTemplates(response.data.templates || []);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.category || !newTemplate.templateContent) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await axiosConfig.post('/document-templates', newTemplate);
      setNewTemplate({
        name: '',
        category: '',
        templateContent: '',
        description: ''
      });
      setShowNewForm(false);
      setError('');
      fetchCategories();
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create template');
      console.error('Error creating template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      await axiosConfig.put(`/document-templates/${editingId}`, {
        name: newTemplate.name,
        category: newTemplate.category,
        templateContent: newTemplate.templateContent,
        description: newTemplate.description
      });
      setEditingId(null);
      setNewTemplate({
        name: '',
        category: '',
        templateContent: '',
        description: ''
      });
      setError('');
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Delete this template?')) return;

    setLoading(true);
    try {
      await axiosConfig.delete(`/document-templates/${templateId}`);
      setAnchorEl(null);
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateTemplate = async (templateId) => {
    setLoading(true);
    try {
      await axiosConfig.post(`/document-templates/${templateId}/duplicate`, {});
      setAnchorEl(null);
      fetchTemplates();
    } catch (err) {
      setError('Failed to duplicate template');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template) => {
    setEditingId(template.id);
    setNewTemplate({
      name: template.name,
      category: template.category,
      templateContent: template.template_content,
      description: template.description || ''
    });
    setAnchorEl(null);
  };

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Document Templates</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* New/Edit Template Form */}
        {(showNewForm || editingId) && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <h4>{editingId ? 'Edit Template' : 'Create New Template'}</h4>
            
            <TextField
              fullWidth
              label="Template Name *"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Category *"
              value={newTemplate.category}
              onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Template Content *"
              value={newTemplate.templateContent}
              onChange={(e) => setNewTemplate({ ...newTemplate, templateContent: e.target.value })}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={editingId ? handleUpdateTemplate : handleCreateTemplate}
                disabled={loading}
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setShowNewForm(false);
                  setNewTemplate({
                    name: '',
                    category: '',
                    templateContent: '',
                    description: ''
                  });
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        {/* Category Filter */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant={selectedCategory === '' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setSelectedCategory('')}
            sx={{ mr: 1 }}
          >
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.category}
              variant={selectedCategory === cat.category ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedCategory(cat.category)}
              sx={{ mr: 1 }}
            >
              {cat.category} ({cat.template_count})
            </Button>
          ))}
        </Box>

        {/* New Template Button */}
        {!showNewForm && !editingId && (
          <Button
            variant="contained"
            color="success"
            onClick={() => setShowNewForm(true)}
            fullWidth
            sx={{ mb: 2 }}
          >
            Create New Template
          </Button>
        )}

        {/* Templates List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : templates.length === 0 ? (
          <Alert severity="info">No templates found</Alert>
        ) : (
          <List>
            {templates.map((template) => (
              <Card key={template.id} sx={{ mb: 1 }}>
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <span style={{ fontWeight: 'bold' }}>{template.name}</span>
                        <Chip label={template.category} size="small" variant="outlined" />
                      </Box>
                      {template.description && (
                        <span style={{ color: '#666', fontSize: '0.9em' }}>{template.description}</span>
                      )}
                      <Box sx={{ color: '#999', fontSize: '0.85em', mt: 0.5 }}>
                        Created by {template.first_name} {template.last_name} • Used {template.usage_count} times
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setSelectedTemplate(template);
                          setAnchorEl(e.currentTarget);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={!!selectedTemplate}
          onClose={() => {
            setAnchorEl(null);
            setSelectedTemplate(null);
          }}
        >
          <MenuItem onClick={() => handleSelectTemplate(selectedTemplate)}>
            Use Template
          </MenuItem>
          <MenuItem onClick={() => handleEditTemplate(selectedTemplate)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => handleDuplicateTemplate(selectedTemplate.id)}>
            <FileCopyIcon fontSize="small" sx={{ mr: 1 }} />
            Duplicate
          </MenuItem>
          <MenuItem
            onClick={() => handleDeleteTemplate(selectedTemplate.id)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentTemplates;
