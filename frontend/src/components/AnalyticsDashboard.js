import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  TextField,
} from '@mui/material';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0'];

// Helper function to ensure data is an array
const ensureArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
};

function AnalyticsDashboard({ token }) {
  const [stats, setStats] = useState({
    total_cases: 0,
    open_cases: 0,
    closed_cases: 0,
    pending_cases: 0,
    critical_cases: 0,
    avg_resolution_days: 0
  });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [criminalStats, setCriminalStats] = useState([]);
  const [flaggedStats, setFlaggedStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [officerPerformance, setOfficerPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [
        statsRes,
        deptRes,
        typesRes,
        crimRes,
        flagRes,
        activityRes,
        perfRes
      ] = await Promise.all([
        axios.get(`${API_BASE}/analytics/cases/stats`, { headers }).catch(err => ({ data: {} })),
        axios.get(`${API_BASE}/analytics/cases/by-department`, { headers }).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/analytics/cases/by-type`, { headers }).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/analytics/criminal-records/stats`, { headers }).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/analytics/flagged/stats`, { headers }).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/analytics/cases/recent-activity`, { headers }).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/analytics/officers/performance`, { headers }).catch(err => ({ data: [] }))
      ]);

      // Process and validate all data
      const processedStats = {
        total_cases: statsRes.data?.total_cases || 0,
        open_cases: statsRes.data?.open_cases || 0,
        closed_cases: statsRes.data?.closed_cases || 0,
        pending_cases: statsRes.data?.pending_cases || 0,
        critical_cases: statsRes.data?.critical_cases || 0,
        avg_resolution_days: statsRes.data?.avg_resolution_days || 0
      };

      setStats(processedStats);
      setDepartmentStats(ensureArray(deptRes.data));
      setCaseTypes(ensureArray(typesRes.data));
      setCriminalStats(ensureArray(crimRes.data));
      setFlaggedStats(ensureArray(flagRes.data));
      setRecentActivity(ensureArray(activityRes.data));
      setOfficerPerformance(ensureArray(perfRes.data));
      setError('');
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      // Set default empty data
      setStats({
        total_cases: 0,
        open_cases: 0,
        closed_cases: 0,
        pending_cases: 0,
        critical_cases: 0,
        avg_resolution_days: 0
      });
      setDepartmentStats([]);
      setCaseTypes([]);
      setCriminalStats([]);
      setFlaggedStats([]);
      setRecentActivity([]);
      setOfficerPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Key Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#4CAF50', color: 'white' }}>
              <Typography variant="h6">Total Cases</Typography>
              <Typography variant="h4">{stats.total_cases || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#2196F3', color: 'white' }}>
              <Typography variant="h6">Open Cases</Typography>
              <Typography variant="h4">{stats.open_cases || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FF9800', color: 'white' }}>
              <Typography variant="h6">Pending Cases</Typography>
              <Typography variant="h4">{stats.pending_cases || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#F44336', color: 'white' }}>
              <Typography variant="h6">Critical Cases</Typography>
              <Typography variant="h4">{stats.critical_cases || 0}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        {/* Cases by Status */}
        {stats && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Cases by Status" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Open', value: stats.open_cases || 0 },
                        { name: 'Closed', value: stats.closed_cases || 0 },
                        { name: 'Pending', value: stats.pending_cases || 0 }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#4CAF50" />
                      <Cell fill="#F44336" />
                      <Cell fill="#FF9800" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Cases by Department */}
        {departmentStats && departmentStats.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Cases by Department" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Cases by Type */}
        {caseTypes && caseTypes.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Cases by Type" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={caseTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="case_type" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FF9800" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Criminal Records Stats */}
        {criminalStats && criminalStats.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Criminal Records by Severity" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={criminalStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#9C27B0" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Officer Performance */}
        {officerPerformance && officerPerformance.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Officer Performance" />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Officer</strong></TableCell>
                        <TableCell align="center"><strong>Cases Assigned</strong></TableCell>
                        <TableCell align="center"><strong>Cases Closed</strong></TableCell>
                        <TableCell align="center"><strong>Closure Rate</strong></TableCell>
                        <TableCell align="center"><strong>Avg Days to Close</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {officerPerformance.map((perf, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{perf.officer_name || 'Unknown'}</TableCell>
                          <TableCell align="center">{perf.cases_assigned || 0}</TableCell>
                          <TableCell align="center">{perf.cases_closed || 0}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={`${Math.round((perf.closure_rate || 0) * 100)}%`}
                              color={perf.closure_rate > 0.7 ? 'success' : perf.closure_rate > 0.4 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">{Math.round(perf.avg_days_to_close || 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* No Data Message */}
      {!loading && !departmentStats.length && !caseTypes.length && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No analytics data available yet. Create some cases to see charts and statistics.
        </Alert>
      )}
    </Box>
  );
}

export default AnalyticsDashboard;
