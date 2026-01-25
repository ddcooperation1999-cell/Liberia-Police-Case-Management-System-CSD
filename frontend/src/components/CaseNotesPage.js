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
  Typography,
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

const CaseNotesPage = ({ token, user }) => {
  const [cases, setCases] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedCase, setSelectedCase] = useState('');
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('update');
  const [severity, setSeverity] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await axiosConfig.get('/cases');
      setCases(response.data);
    } catch (err) {
      setError('Failed to load cases');
      console.error(err);
    }
  };

  const fetchNotes = async (caseId) => {
    if (!caseId) {
      setNotes([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/case-notes?case_id=${caseId}`);
      setNotes(response.data);
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseChange = (caseId) => {
    setSelectedCase(caseId);
    fetchNotes(caseId);
  };

  const handleAddNote = async () => {
    if (!selectedCase || !newNote.trim()) {
      setError('Please select a case and enter a note');
      return;
    }

    setLoading(true);
    try {
      await axiosConfig.post('/case-notes', {
        case_id: selectedCase,
        content: newNote,
        note_type: noteType,
        severity,
      });
      setMessage('Note added successfully');
      setNewNote('');
      setNoteType('update');
      setSeverity('normal');
      setOpenDialog(false);
      fetchNotes(selectedCase);
    } catch (err) {
      setError('Failed to add note');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Delete this note?')) {
      try {
        await axiosConfig.delete(`/case-notes/${noteId}`);
        setMessage('Note deleted');
        fetchNotes(selectedCase);
      } catch (err) {
        setError('Failed to delete note');
      }
    }
  };

  const getNoteTypeColor = (type) => {
    const colors = {
      update: 'primary',
      meeting: 'info',
      evidence: 'warning',
      interview: 'secondary',
      suspect_info: 'error',
    };
    return colors[type] || 'default';
  };

  const getSeverityColor = (sev) => {
    const colors = {
      low: 'success',
      normal: 'info',
      high: 'warning',
      critical: 'error',
    };
    return colors[sev] || 'default';
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Case Notes</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={!selectedCase}
        >
          Add Note
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Case</InputLabel>
          <Select
            value={selectedCase}
            onChange={(e) => handleCaseChange(e.target.value)}
            label="Select Case"
          >
            <MenuItem value="">None</MenuItem>
            {cases.map((caseItem) => (
              <MenuItem key={caseItem.id} value={caseItem.id}>
                {caseItem.case_number || `#${caseItem.id}`} - {caseItem.case_type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedCase && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : notes && notes.length > 0 ? (
            <List>
              {notes.map((note) => (
                <Card key={note.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip label={note.note_type} size="small" color={getNoteTypeColor(note.note_type)} />
                          <Chip label={note.severity} size="small" color={getSeverityColor(note.severity)} />
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          By {note.created_by} on {new Date(note.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body1">{note.content}</Typography>
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No notes for this case</Typography>
            </Paper>
          )}
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note to Case</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Note Type</InputLabel>
              <Select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                label="Note Type"
              >
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="evidence">Evidence</MenuItem>
                <MenuItem value="interview">Interview</MenuItem>
                <MenuItem value="suspect_info">Suspect Info</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                label="Severity"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Note Content"
              multiline
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained" color="primary">
            Add Note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseNotesPage;
