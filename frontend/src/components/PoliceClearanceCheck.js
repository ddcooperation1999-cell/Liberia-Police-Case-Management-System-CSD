import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function PoliceClearanceCheck({ token }) {
  const [suspectId, setSuspectId] = useState('');
  const [suspectName, setSuspectName] = useState('');
  const [clearanceData, setClearanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openPrintDialog, setOpenPrintDialog] = useState(false);

  const handleSearch = async () => {
    if (!suspectId && !suspectName) {
      setError('Please enter a suspect ID or name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Search for suspect by ID or name
      let searchQuery = suspectId || suspectName;
      const response = await axios.get(
        `${API_BASE}/analytics/clearance-check/${searchQuery}`,
        { headers }
      );

      setClearanceData(response.data);
    } catch (err) {
      console.error('Error checking clearance:', err);
      if (err.response?.status === 404) {
        setError('Suspect not found');
      } else {
        setError('Failed to check clearance status');
      }
      setClearanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Police Clearance Certificate</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #1976d2; }
            .section { margin: 20px 0; }
            .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .verdict { font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; }
            .clear { color: green; }
            .not-clear { color: red; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LIBERIA NATIONAL POLICE</h1>
            <p>Police Clearance Certificate</p>
          </div>
          
          <div class="section">
            <h3>Suspect Information</h3>
            <p><strong>Name:</strong> ${clearanceData.name || 'Unknown'}</p>
            <p><strong>National ID:</strong> ${clearanceData.national_id || 'N/A'}</p>
            <p><strong>DOB:</strong> ${clearanceData.dob || 'Unknown'}</p>
          </div>

          ${clearanceData.criminal_records && clearanceData.criminal_records.length > 0 ? `
            <div class="section">
              <h3>Criminal Records</h3>
              <table>
                <tr><th>Charge</th><th>Severity</th><th>Date</th></tr>
                ${clearanceData.criminal_records.map(rec => `
                  <tr>
                    <td>${rec.charge}</td>
                    <td>${rec.severity}</td>
                    <td>${rec.date_charged}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          ` : ''}

          ${clearanceData.flags && clearanceData.flags.length > 0 ? `
            <div class="section">
              <h3>Active Flags</h3>
              <table>
                <tr><th>Reason</th><th>Severity</th><th>Flagged On</th></tr>
                ${clearanceData.flags.map(flag => `
                  <tr>
                    <td>${flag.reason}</td>
                    <td>${flag.severity}</td>
                    <td>${flag.created_at}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          ` : ''}

          <div class="verdict ${clearanceData.is_clear ? 'clear' : 'not-clear'}">
            Status: ${clearanceData.is_clear ? 'CLEAR' : 'NOT CLEAR'}
          </div>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>This document is valid for official purposes only.</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Police Clearance Check" />
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Suspect ID"
                value={suspectId}
                onChange={(e) => setSuspectId(e.target.value)}
                placeholder="Enter national ID or suspect ID"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Or Name"
                value={suspectName}
                onChange={(e) => setSuspectName(e.target.value)}
                placeholder="Enter suspect name"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Grid>
          </Grid>

          {error && <Alert severity="error">{error}</Alert>}

          {clearanceData && (
            <Box>
              {/* Verdict Card */}
              <Card sx={{ mb: 2, p: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  {clearanceData.is_clear ? (
                    <>
                      <CheckCircleIcon sx={{ fontSize: 48, color: '#4CAF50' }} />
                      <Box>
                        <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                          CLEAR
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          No active flags or criminal records
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      <ErrorIcon sx={{ fontSize: 48, color: '#F44336' }} />
                      <Box>
                        <Typography variant="h5" sx={{ color: '#F44336' }}>
                          NOT CLEAR
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Active flags or criminal records found
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Card>

              {/* Suspect Info */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Suspect Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Name:</strong> {clearanceData.name || 'Unknown'}</Typography>
                    <Typography><strong>National ID:</strong> {clearanceData.national_id || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>DOB:</strong> {clearanceData.dob || 'Unknown'}</Typography>
                    <Typography><strong>Age:</strong> {clearanceData.age || 'Unknown'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Criminal Records */}
              {clearanceData.criminal_records && clearanceData.criminal_records.length > 0 && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Criminal Records ({clearanceData.criminal_records.length})</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell><strong>Charge</strong></TableCell>
                          <TableCell><strong>Severity</strong></TableCell>
                          <TableCell><strong>Date Charged</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clearanceData.criminal_records.map((rec, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{rec.charge}</TableCell>
                            <TableCell>
                              <Chip
                                label={rec.severity}
                                color={
                                  rec.severity === 'critical' ? 'error' :
                                  rec.severity === 'high' ? 'warning' :
                                  'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{new Date(rec.date_charged).toLocaleDateString()}</TableCell>
                            <TableCell>{rec.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Active Flags */}
              {clearanceData.flags && clearanceData.flags.length > 0 && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: '#F44336' }}>
                    ⚠️ Active Flags ({clearanceData.flags.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#ffebee' }}>
                          <TableCell><strong>Reason</strong></TableCell>
                          <TableCell><strong>Severity</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Flagged On</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clearanceData.flags.map((flag, idx) => (
                          <TableRow key={idx} sx={{ bgcolor: '#fff3e0' }}>
                            <TableCell>{flag.reason}</TableCell>
                            <TableCell>
                              <Chip
                                label={flag.severity}
                                color="error"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{flag.status}</TableCell>
                            <TableCell>{new Date(flag.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Related Cases */}
              {clearanceData.related_cases && clearanceData.related_cases.length > 0 && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Related Cases ({clearanceData.related_cases.length})</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell><strong>Case #</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Date</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clearanceData.related_cases.map((caseItem, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{caseItem.case_number}</TableCell>
                            <TableCell>{caseItem.case_type}</TableCell>
                            <TableCell>
                              <Chip
                                label={caseItem.status}
                                color={caseItem.status === 'closed' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{new Date(caseItem.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              <Button
                variant="contained"
                onClick={() => setOpenPrintDialog(true)}
              >
                Print Certificate
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Print Dialog */}
      <Dialog open={openPrintDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Print Clearance Certificate</DialogTitle>
        <DialogContent>
          <Typography>
            Click "Print" to open the print dialog and generate a PDF or print the clearance certificate.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            handlePrint();
            setOpenPrintDialog(false);
          }} variant="contained">
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PoliceClearanceCheck;
