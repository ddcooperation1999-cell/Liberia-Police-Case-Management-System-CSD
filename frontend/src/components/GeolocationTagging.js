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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Map as MapIcon } from '@mui/icons-material';
import axiosConfig from '../api/axiosConfig';

const GeolocationTagging = ({ token, user }) => {
  const [locations, setLocations] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    case_id: '',
    latitude: '',
    longitude: '',
    location_name: '',
    location_type: 'scene',
    description: '',
    timestamp: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [locRes, caseRes] = await Promise.all([
        axiosConfig.get('/geolocation/locations'),
        axiosConfig.get('/cases'),
      ]);
      setLocations(locRes.data);
      setCases(caseRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          });
          setMessage('Location obtained from GPS');
        },
        (err) => {
          setError('Failed to get location: ' + err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setFormData({
      case_id: '',
      latitude: '',
      longitude: '',
      location_name: '',
      location_type: 'scene',
      description: '',
      timestamp: new Date().toISOString().slice(0, 16),
    });
    setOpenDialog(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setFormData(location);
    setOpenDialog(true);
  };

  const handleSaveLocation = async () => {
    if (!formData.case_id || !formData.latitude || !formData.longitude) {
      setError('Case, latitude, and longitude are required');
      return;
    }

    try {
      if (editingLocation) {
        await axiosConfig.put(`/geolocation/locations/${editingLocation.id}`, formData);
        setMessage('Location updated successfully');
      } else {
        await axiosConfig.post('/geolocation/locations', formData);
        setMessage('Location added successfully');
      }
      setOpenDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save location');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axiosConfig.delete(`/geolocation/locations/${id}`);
      setMessage('Location deleted successfully');
      fetchData();
    } catch (err) {
      setError('Failed to delete location');
    }
  };

  const handleViewOnMap = (location) => {
    const mapsUrl = `https://www.google.com/maps/?q=${location.latitude},${location.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Geolocation Tagging</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddLocation}
        >
          Add Location
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Case</TableCell>
              <TableCell>Location Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Coordinates</TableCell>
              <TableCell>Date/Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id} hover>
                <TableCell>{location.case_number || `Case #${location.case_id}`}</TableCell>
                <TableCell>{location.location_name}</TableCell>
                <TableCell>
                  <Chip
                    label={location.location_type}
                    size="small"
                    color={location.location_type === 'scene' ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <code>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</code>
                </TableCell>
                <TableCell>{new Date(location.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleViewOnMap(location)}
                    title="View on Google Maps"
                  >
                    <MapIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditLocation(location)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteLocation(location.id)}
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
          {editingLocation ? 'Edit Location' : 'Add Location'}
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
            label="Location Name"
            value={formData.location_name}
            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
            fullWidth
            margin="normal"
            placeholder="e.g., Crime Scene, Police Station"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Location Type</InputLabel>
            <Select
              value={formData.location_type}
              onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
              label="Location Type"
            >
              <MenuItem value="scene">Crime Scene</MenuItem>
              <MenuItem value="station">Police Station</MenuItem>
              <MenuItem value="arrest">Arrest Location</MenuItem>
              <MenuItem value="evidence">Evidence Location</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 2, mb: 2 }}>
            <TextField
              label="Latitude"
              type="number"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              inputProps={{ step: '0.000001', min: '-90', max: '90' }}
            />
            <TextField
              label="Longitude"
              type="number"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              inputProps={{ step: '0.000001', min: '-180', max: '180' }}
            />
          </Box>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleGetCurrentLocation}
            sx={{ mb: 2 }}
          >
            Get Current Location
          </Button>

          <TextField
            label="Date/Time"
            type="datetime-local"
            value={formData.timestamp}
            onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            placeholder="Additional details about this location"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveLocation} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GeolocationTagging;
