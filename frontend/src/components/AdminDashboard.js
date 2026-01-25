import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  Container,
  Grid,
  Paper,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
  Toolbar,
  AppBar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Gavel as GavelIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Analytics as AnalyticsIcon,
  LocationCity as LocationCityIcon,
  Warning as WarningIcon,
  VerifiedUser as VerifiedUserIcon,
  AssignmentInd as AssignmentIcon,
  Note as NoteIcon,
  DocumentScanner as DocumentIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Language as LanguageIcon,
  CloudSync as CloudSyncIcon,
  LocationOn as LocationOnIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import NotificationCenter from './NotificationCenter';

// Lazy load components for better performance
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
const PoliceClearanceCheck = lazy(() => import('./PoliceClearanceCheck'));
const DepartmentDashboard = lazy(() => import('./DepartmentDashboard'));
const FlaggedIndividuals = lazy(() => import('./FlaggedIndividuals'));
const CaseAssignmentPage = lazy(() => import('./CaseAssignmentPage'));
const CaseNotesPage = lazy(() => import('./CaseNotesPage'));
const DocumentTemplatesPage = lazy(() => import('./DocumentTemplatesPage'));
const SearchPage = lazy(() => import('./SearchPage'));
const AuditLogsPage = lazy(() => import('./AuditLogsPage'));
const MultiLanguageSupport = lazy(() => import('./MultiLanguageSupport'));
const OfflineModeSync = lazy(() => import('./OfflineModeSync'));
const GeolocationTagging = lazy(() => import('./GeolocationTagging'));
const EvidenceManagement = lazy(() => import('./EvidenceManagement'));
const CaseClosureWorkflow = lazy(() => import('./CaseClosureWorkflow'));
import LoadingFallback from './LoadingFallback';

const API_BASE = 'http://localhost:3001/api';

function AdminDashboard({ token, user, onLogout }) {
  const [currentTab, setCurrentTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingCase, setEditingCase] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [bulkUsers, setBulkUsers] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    badge_number: '',
    role: 'officer',
    county_id: '',
    status: 'active',
  });
  const [caseFormData, setCaseFormData] = useState({
    case_number: '',
    county: '',
    case_type: '',
    details: '',
    disposition: 'Open',
    investigator: '',
    priority: 'normal',
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async (page = 1, search = '', role = '', status = '') => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Build users query with filters and pagination
      const userParams = new URLSearchParams();
      userParams.append('page', page);
      userParams.append('limit', 50);
      if (search) userParams.append('search', search);
      if (role) userParams.append('role', role);
      if (status) userParams.append('status', status);

      const [usersRes, casesRes, countiesRes] = await Promise.all([
        axios.get(`${API_BASE}/users?${userParams.toString()}`, { headers }),
        axios.get(`${API_BASE}/cases`, { headers }),
        axios.get(`${API_BASE}/counties`, { headers }),
      ]);
      
      // Handle paginated response
      if (usersRes.data.data) {
        setUsers(usersRes.data.data);
        setPagination(usersRes.data.pagination);
      } else {
        setUsers(usersRes.data);
      }
      
      // Handle cases response - could be paginated or direct array
      if (casesRes.data.data) {
        setCases(casesRes.data.data);
      } else if (Array.isArray(casesRes.data)) {
        setCases(casesRes.data);
      } else {
        setCases([]);
      }
      
      setCounties(countiesRes.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setMessage('Error loading data: ' + errorMsg);
      // If token is expired or invalid, logout
      if (err.response?.status === 401 && errorMsg.includes('token')) {
        console.warn('Token is invalid or expired, logging out');
        setTimeout(() => onLogout(), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!formData.first_name || !formData.last_name || !formData.username) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingUser) {
        await axios.put(`${API_BASE}/users/${editingUser.id}`, formData, { headers });
        setMessage('User updated successfully');
      } else {
        if (!formData.password) {
          setMessage('Password is required for new users');
          return;
        }
        await axios.post(`${API_BASE}/users`, formData, { headers });
        setMessage('User created successfully');
      }
      setOpenUserDialog(false);
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        badge_number: '',
        role: 'officer',
        county_id: '',
        status: 'active',
      });
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'An error occurred';
      setMessage('Error: ' + errorMsg);
      console.error('User save error:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API_BASE}/users/${userId}`, { headers });
        setMessage('User deleted successfully');
        fetchData();
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message || 'Failed to delete user';
        setMessage('Error: ' + errorMsg);
        console.error('Delete user error:', err);
      }
    }
  };

  const handleEditUser = (userData) => {
    setEditingUser(userData);
    setFormData({
      username: userData.username,
      password: '',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      badge_number: userData.badge_number || '',
      role: userData.role,
      county_id: userData.county_id || '',
      status: userData.status,
    });
    setOpenUserDialog(true);
  };

  const handleBulkCreateUsers = async () => {
    if (!bulkUsers.trim()) {
      setMessage('Please enter user data');
      return;
    }

    try {
      // Parse CSV or JSON format
      let usersToCreate = [];
      const lines = bulkUsers.trim().split('\n');
      
      // Try to detect format (CSV or JSON)
      try {
        usersToCreate = JSON.parse(bulkUsers);
      } catch {
        // Assume CSV format: username,password,first_name,last_name,role
        usersToCreate = lines.map(line => {
          const [username, password, first_name, last_name, role = 'officer'] = line.split(',').map(s => s.trim());
          return { username, password, first_name, last_name, role };
        }).filter(u => u.username && u.password && u.first_name && u.last_name);
      }

      if (usersToCreate.length === 0) {
        setMessage('No valid users to create');
        return;
      }

      if (usersToCreate.length > 10000) {
        setMessage('Maximum 10,000 users per batch');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${API_BASE}/users/bulk/create`, { users: usersToCreate }, { headers });
      
      setMessage(`Success! ${response.data.created.length} users created${response.data.failed.length > 0 ? `, ${response.data.failed.length} failed` : ''}`);
      setBulkUsers('');
      setOpenBulkDialog(false);
      setTimeout(() => fetchData(1, userSearch, userRoleFilter, userStatusFilter), 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Bulk create failed';
      setMessage('Error: ' + errorMsg);
      console.error('Bulk create error:', err);
    }
  };

  const handleSearchUsers = (search) => {
    setUserSearch(search);
    fetchData(1, search, userRoleFilter, userStatusFilter);
  };

  const handleFilterUsers = (role, status) => {
    setUserRoleFilter(role);
    setUserStatusFilter(status);
    fetchData(1, userSearch, role, status);
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage, userSearch, userRoleFilter, userStatusFilter);
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : status === 'inactive' ? 'default' : 'error';
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'error' : 'primary';
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <List>
      <ListItem
        button
        selected={currentTab === 0}
        onClick={() => {
          setCurrentTab(0);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 1}
        onClick={() => {
          setCurrentTab(1);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="User Management" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 2}
        onClick={() => {
          setCurrentTab(2);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <GavelIcon />
        </ListItemIcon>
        <ListItemText primary="Case Management" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 3}
        onClick={() => {
          setCurrentTab(3);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <LocationCityIcon />
        </ListItemIcon>
        <ListItemText primary="Department Dashboard" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 4}
        onClick={() => {
          setCurrentTab(4);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <WarningIcon />
        </ListItemIcon>
        <ListItemText primary="Flagged Individuals" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 5}
        onClick={() => {
          setCurrentTab(5);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <AnalyticsIcon />
        </ListItemIcon>
        <ListItemText primary="Analytics" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 6}
        onClick={() => {
          setCurrentTab(6);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <VerifiedUserIcon />
        </ListItemIcon>
        <ListItemText primary="Clearance Check" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 7}
        onClick={() => {
          setCurrentTab(7);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Case Assignments" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 8}
        onClick={() => {
          setCurrentTab(8);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <NoteIcon />
        </ListItemIcon>
        <ListItemText primary="Case Notes" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 9}
        onClick={() => {
          setCurrentTab(9);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <DocumentIcon />
        </ListItemIcon>
        <ListItemText primary="Document Templates" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 10}
        onClick={() => {
          setCurrentTab(10);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <SearchIcon />
        </ListItemIcon>
        <ListItemText primary="Search Cases" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 11}
        onClick={() => {
          setCurrentTab(11);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <HistoryIcon />
        </ListItemIcon>
        <ListItemText primary="Audit Logs" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 12}
        onClick={() => {
          setCurrentTab(12);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <LanguageIcon />
        </ListItemIcon>
        <ListItemText primary="Multi-Language" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 13}
        onClick={() => {
          setCurrentTab(13);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <CloudSyncIcon />
        </ListItemIcon>
        <ListItemText primary="Offline Sync" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 14}
        onClick={() => {
          setCurrentTab(14);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <LocationOnIcon />
        </ListItemIcon>
        <ListItemText primary="Geolocation" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 15}
        onClick={() => {
          setCurrentTab(15);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <StorageIcon />
        </ListItemIcon>
        <ListItemText primary="Evidence" />
      </ListItem>
      <ListItem
        button
        selected={currentTab === 16}
        onClick={() => {
          setCurrentTab(16);
          setMobileOpen(false);
        }}
      >
        <ListItemIcon>
          <CheckCircleIcon />
        </ListItemIcon>
        <ListItemText primary="Case Closure" />
      </ListItem>
      <ListItem button onClick={onLogout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItem>
    </List>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            LNP Admin Dashboard (17 Features)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationCenter />
            <Typography variant="body2">
              {user?.username} ({user?.role})
            </Typography>
            <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {drawer}
      </Drawer>

      <Box
        component="nav"
        sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 240,
              mt: 8,
              overflowY: 'auto',
              height: 'calc(100vh - 64px)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { xs: '100%', md: 'calc(100% - 240px)' },
        }}
      >
        <Container maxWidth="lg">
          {message && (
            <Alert
              severity={message.includes('Error') ? 'error' : 'success'}
              onClose={() => setMessage('')}
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {currentTab === 0 && <DashboardTab users={users} cases={cases} />}
              {currentTab === 1 && (
                <UserManagementTab
                  users={users}
                  counties={counties}
                  pagination={pagination}
                  userSearch={userSearch}
                  userRoleFilter={userRoleFilter}
                  userStatusFilter={userStatusFilter}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onSearch={handleSearchUsers}
                  onFilter={handleFilterUsers}
                  onPageChange={handlePageChange}
                  onBulkAdd={() => setOpenBulkDialog(true)}
                  onAdd={() => {
                    setEditingUser(null);
                    setFormData({
                      username: '',
                      password: '',
                      first_name: '',
                      last_name: '',
                      email: '',
                      phone: '',
                      badge_number: '',
                      role: 'officer',
                      county_id: '',
                      status: 'active',
                    });
                    setOpenUserDialog(true);
                  }}
                />
              )}
              {currentTab === 2 && <CaseManagementTab cases={cases} counties={counties} token={token} />}
              {currentTab === 3 && <Suspense fallback={<LoadingFallback />}><DepartmentDashboard token={token} user={user} /></Suspense>}
              {currentTab === 4 && <Suspense fallback={<LoadingFallback />}><FlaggedIndividuals token={token} /></Suspense>}
              {currentTab === 5 && <Suspense fallback={<LoadingFallback />}><AnalyticsDashboard token={token} /></Suspense>}
              {currentTab === 6 && <Suspense fallback={<LoadingFallback />}><PoliceClearanceCheck token={token} /></Suspense>}
              {currentTab === 7 && <Suspense fallback={<LoadingFallback />}><CaseAssignmentPage token={token} user={user} /></Suspense>}
              {currentTab === 8 && <Suspense fallback={<LoadingFallback />}><CaseNotesPage token={token} user={user} /></Suspense>}
              {currentTab === 9 && <Suspense fallback={<LoadingFallback />}><DocumentTemplatesPage token={token} user={user} /></Suspense>}
              {currentTab === 10 && <Suspense fallback={<LoadingFallback />}><SearchPage token={token} /></Suspense>}
              {currentTab === 11 && <Suspense fallback={<LoadingFallback />}><AuditLogsPage token={token} user={user} /></Suspense>}
              {currentTab === 12 && <Suspense fallback={<LoadingFallback />}><MultiLanguageSupport token={token} user={user} /></Suspense>}
              {currentTab === 13 && <Suspense fallback={<LoadingFallback />}><OfflineModeSync token={token} user={user} /></Suspense>}
              {currentTab === 14 && <Suspense fallback={<LoadingFallback />}><GeolocationTagging token={token} user={user} /></Suspense>}
              {currentTab === 15 && <Suspense fallback={<LoadingFallback />}><EvidenceManagement token={token} user={user} /></Suspense>}
              {currentTab === 16 && <Suspense fallback={<LoadingFallback />}><CaseClosureWorkflow token={token} user={user} /></Suspense>}
            </>
          )}
        </Container>

        {/* User Dialog */}
        <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {editingUser ? 'Edit User' : 'Add New User'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                fullWidth
                required
                disabled={editingUser ? true : false}
              />
              {!editingUser && (
                <TextField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  fullWidth
                  required
                />
              )}
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
              />
              <TextField
                label="Badge Number"
                value={formData.badge_number}
                onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="officer">Officer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>County</InputLabel>
                <Select
                  value={formData.county_id}
                  onChange={(e) => setFormData({ ...formData, county_id: e.target.value })}
                  label="County"
                >
                  <MenuItem value="">None</MenuItem>
                  {counties.map((county) => (
                    <MenuItem key={county.id} value={county.id}>
                      {county.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
                <Button onClick={handleSaveUser} variant="contained" color="primary">
                  Save
                </Button>
              </Box>
            </Box>
          </Box>
        </Dialog>

        {/* Bulk Create Dialog */}
        <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)} maxWidth="md" fullWidth>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bulk Create Users (Up to 10,000)
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Format: CSV (one per line) or JSON array. CSV format: username,password,first_name,last_name,role<br/>
              Example CSV:<br/>
              john.doe,Pass123!,John,Doe,officer<br/>
              jane.smith,Pass456!,Jane,Smith,admin
            </Typography>
            <TextField
              label="Paste user data here"
              value={bulkUsers}
              onChange={(e) => setBulkUsers(e.target.value)}
              multiline
              rows={12}
              fullWidth
              placeholder="username,password,first_name,last_name,role"
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setOpenBulkDialog(false)}>Cancel</Button>
              <Button onClick={handleBulkCreateUsers} variant="contained" color="primary">
                Create Users
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    </Box>
  );
}

function DashboardTab({ users, cases }) {
  // Ensure users and cases are arrays
  const safeUsers = Array.isArray(users) ? users : [];
  const safeCases = Array.isArray(cases) ? cases : [];
  
  const adminCount = safeUsers.filter((u) => u.role === 'admin').length;
  const officerCount = safeUsers.filter((u) => u.role === 'officer').length;
  const activeUserCount = safeUsers.filter((u) => u.status === 'active').length;
  const openCaseCount = safeCases.filter((c) => c.status === 'open').length;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h5">{safeUsers.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Users
            </Typography>
            <Typography variant="h5">{activeUserCount}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Cases
            </Typography>
            <Typography variant="h5">{safeCases.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Open Cases
            </Typography>
            <Typography variant="h5">{safeCases.filter((c) => c.status === 'open').length}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function UserManagementTab({ users, counties, pagination, userSearch, userRoleFilter, userStatusFilter, onEdit, onDelete, onAdd, onSearch, onFilter, onPageChange, onBulkAdd }) {
  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">User Management</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={onBulkAdd}
          >
            Bulk Create (Up to 10,000)
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search (username, name, email)"
          value={userSearch}
          onChange={(e) => onSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={userRoleFilter}
            onChange={(e) => onFilter(e.target.value, userStatusFilter)}
            label="Role"
            size="small"
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="officer">Officer</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={userStatusFilter}
            onChange={(e) => onFilter(userRoleFilter, e.target.value)}
            label="Status"
            size="small"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>County</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={getStatusColor(user.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.county_name || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
          <Button
            disabled={pagination.page === 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <Typography>
            Page {pagination.page} of {pagination.pages} ({pagination.total} total users)
          </Typography>
          <Button
            disabled={pagination.page === pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
}

function CaseManagementTab({ cases, counties, token }) {
  const [editingCase, setEditingCase] = useState(null);
  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [caseFormData, setCaseFormData] = useState({
    case_number: '',
    county: '',
    case_type: '',
    details: '',
    disposition: 'Open',
    investigator: '',
    priority: 'normal',
  });

  const handleAddCase = () => {
    setEditingCase(null);
    setCaseFormData({
      case_number: '',
      county: '',
      case_type: '',
      details: '',
      disposition: 'Open',
      investigator: '',
      priority: 'normal',
    });
    setOpenCaseDialog(true);
  };

  const handleSaveCase = async () => {
    if (!caseFormData.county || !caseFormData.case_type || !caseFormData.details) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingCase) {
        await axios.put(`${API_BASE}/cases/${editingCase.id}`, caseFormData, { headers });
        setMessage('Case updated successfully');
      } else {
        await axios.post(`${API_BASE}/cases`, caseFormData, { headers });
        setMessage('Case created successfully');
      }
      setOpenCaseDialog(false);
      setCaseFormData({
        case_number: '',
        county: '',
        case_type: '',
        details: '',
        disposition: 'Open',
        investigator: '',
        priority: 'normal',
      });
      // Re-fetch data if there's a fetchData function available
      if (typeof window !== 'undefined') {
        window.location.reload(); // Refresh to get updated data
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to save case';
      setMessage('Error: ' + errorMsg);
      console.error('Case save error:', err);
    }
  };

  const handleDeleteCase = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API_BASE}/cases/${caseId}`, { headers });
        setMessage('Case deleted successfully');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message || 'Failed to delete case';
        setMessage('Error: ' + errorMsg);
        console.error('Delete case error:', err);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Case Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddCase}
        >
          Add Case
        </Button>
      </Box>
      {message && (
        <Alert
          severity={message.includes('Error') ? 'error' : 'success'}
          onClose={() => setMessage('')}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Case #</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>County</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Disposition</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cases && cases.length > 0 ? (
              cases.map((caseItem) => (
                <TableRow key={caseItem.id} hover>
                  <TableCell>{caseItem.case_number || `#${caseItem.id}`}</TableCell>
                  <TableCell>{caseItem.case_type}</TableCell>
                  <TableCell>{caseItem.county}</TableCell>
                  <TableCell>{caseItem.details?.substring(0, 50)}...</TableCell>
                  <TableCell>{caseItem.disposition}</TableCell>
                  <TableCell>
                    <Chip
                      label={caseItem.priority || 'normal'}
                      size="small"
                      color={
                        caseItem.priority === 'critical'
                          ? 'error'
                          : caseItem.priority === 'high'
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={caseItem.status || 'open'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setEditingCase(caseItem);
                        setCaseFormData(caseItem);
                        setOpenCaseDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCase(caseItem.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No cases found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Case Dialog */}
      <Dialog open={openCaseDialog} onClose={() => setOpenCaseDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {editingCase ? 'Edit Case' : 'Add New Case'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Case Number"
              value={caseFormData.case_number}
              onChange={(e) => setCaseFormData({ ...caseFormData, case_number: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>County</InputLabel>
              <Select
                value={caseFormData.county}
                onChange={(e) => setCaseFormData({ ...caseFormData, county: e.target.value })}
                label="County"
              >
                {counties.map((county) => (
                  <MenuItem key={county.id} value={county.name}>
                    {county.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Case Type"
              value={caseFormData.case_type}
              onChange={(e) => setCaseFormData({ ...caseFormData, case_type: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Details"
              value={caseFormData.details}
              onChange={(e) => setCaseFormData({ ...caseFormData, details: e.target.value })}
              fullWidth
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Disposition</InputLabel>
              <Select
                value={caseFormData.disposition}
                onChange={(e) => setCaseFormData({ ...caseFormData, disposition: e.target.value })}
                label="Disposition"
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
                <MenuItem value="Under Investigation">Under Investigation</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Investigator"
              value={caseFormData.investigator}
              onChange={(e) => setCaseFormData({ ...caseFormData, investigator: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={caseFormData.priority}
                onChange={(e) => setCaseFormData({ ...caseFormData, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setOpenCaseDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveCase} variant="contained" color="primary">
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

function getRoleColor(role) {
  return role === 'admin' ? 'error' : 'primary';
}

function getStatusColor(status) {
  return status === 'active' ? 'success' : status === 'inactive' ? 'default' : 'error';
}

export default AdminDashboard;
