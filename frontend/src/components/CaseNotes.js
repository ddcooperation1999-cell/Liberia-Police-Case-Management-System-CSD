import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const CaseNotes = ({ caseId, readOnly = false }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('update');
  const [severity, setSeverity] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [caseId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/case-notes/${caseId}`);
      setNotes(response.data.notes || []);
      setError('');
    } catch (err) {
      setError('Failed to load case notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      await axiosConfig.post('/case-notes', {
        caseId,
        content: newNote,
        noteType,
        severity
      });
      setNewNote('');
      setNoteType('update');
      setSeverity('normal');
      fetchNotes();
    } catch (err) {
      setError('Failed to add note');
      console.error('Error adding note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      await axiosConfig.put(`/case-notes/${noteId}`, {
        content: editContent,
        severity
      });
      setEditingId(null);
      setEditContent('');
      fetchNotes();
    } catch (err) {
      setError('Failed to update note');
      console.error('Error updating note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setLoading(true);
    try {
      await axiosConfig.delete(`/case-notes/${noteId}`);
      setDeleteConfirm(null);
      fetchNotes();
    } catch (err) {
      setError('Failed to delete note');
      console.error('Error deleting note:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNoteTypeColor = (type) => {
    const colors = {
      update: 'info',
      evidence: 'warning',
      witness: 'primary',
      investigation: 'secondary',
      status: 'success',
      other: 'default'
    };
    return colors[type] || 'default';
  };

  const getSeverityColor = (sev) => {
    const colors = {
      low: 'success',
      normal: 'info',
      high: 'warning',
      critical: 'error'
    };
    return colors[sev] || 'default';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <h3>Case Notes</h3>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!readOnly && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Add New Note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter note content..."
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              select
              label="Note Type"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              disabled={loading}
              SelectProps={{
                native: true
              }}
            >
              <option value="update">Update</option>
              <option value="evidence">Evidence</option>
              <option value="witness">Witness</option>
              <option value="investigation">Investigation</option>
              <option value="status">Status</option>
              <option value="other">Other</option>
            </TextField>

            <TextField
              select
              label="Severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              disabled={loading}
              SelectProps={{
                native: true
              }}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </TextField>
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleAddNote}
            disabled={loading || !newNote.trim()}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Add Note'}
          </Button>
        </Paper>
      )}

      {loading && !notes.length && <CircularProgress />}

      {notes.length === 0 && !loading && (
        <Alert severity="info">No notes for this case yet</Alert>
      )}

      <List>
        {notes.map((note) => (
          <Card key={note.id} sx={{ mb: 2 }}>
            <CardContent>
              {editingId === note.id ? (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={loading}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleUpdateNote(note.id)}
                      disabled={loading}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setEditingId(null)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box>
                      <Chip
                        label={note.note_type}
                        color={getNoteTypeColor(note.note_type)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={note.severity}
                        color={getSeverityColor(note.severity)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    {!readOnly && (
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingId(note.id);
                            setEditContent(note.content);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteConfirm(note.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <ListItemText
                    primary={note.content}
                    secondary={`${note.username} • ${new Date(note.created_at).toLocaleString()}`}
                  />
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </List>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this note? This cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={() => handleDeleteNote(deleteConfirm)}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseNotes;
