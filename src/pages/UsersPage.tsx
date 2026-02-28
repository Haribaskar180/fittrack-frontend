import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, MenuItem, TextField,
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, FormControl, InputLabel,
} from '@mui/material';
import { Block, CheckCircle } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { usersApi } from '../api';
import { User } from '../types';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import dayjs from 'dayjs';

export default function UsersPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState<{ type: 'deactivate' | 'activate' | 'delete'; user: User } | null>(null);
  const [roleDialog, setRoleDialog] = useState<{ user: User; role: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data.data as User[]),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => usersApi.updateRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); enqueueSnackbar('Role updated!', { variant: 'success' }); setRoleDialog(null); },
    onError: () => enqueueSnackbar('Failed to update role', { variant: 'error' }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => usersApi.update(id, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); enqueueSnackbar('User status updated!', { variant: 'success' }); setConfirmAction(null); },
    onError: () => enqueueSnackbar('Failed to update user', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); enqueueSnackbar('User deleted', { variant: 'info' }); setConfirmAction(null); },
    onError: () => enqueueSnackbar('Failed to delete user', { variant: 'error' }),
  });

  if (isLoading) return <LoadingSpinner />;

  const users = (data ?? []).filter((u: User) => {
    const name = `${u.profile?.firstName ?? ''} ${u.profile?.lastName ?? ''} ${u.email}`.toLowerCase();
    if (search && !name.includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <Box>
      <PageHeader title="User Management" subtitle="Manage all platform users" />

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ flex: 1 }} />
        <TextField select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} size="small" sx={{ width: 150 }} label="Role">
          <MenuItem value="all">All Roles</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="coach">Coach</MenuItem>
          <MenuItem value="athlete">Athlete</MenuItem>
        </TextField>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {user.profile?.firstName} {user.profile?.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'admin' ? 'error' : user.role === 'coach' ? 'secondary' : 'default'}
                        onClick={() => setRoleDialog({ user, role: user.role })}
                        sx={{ cursor: 'pointer', textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={user.isActive ? 'Active' : 'Inactive'} size="small" color={user.isActive ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{dayjs(user.createdAt).format('MMM D, YYYY')}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                        color={user.isActive ? 'warning' : 'success'}
                        onClick={() => setConfirmAction({ type: user.isActive ? 'deactivate' : 'activate', user })}
                      >
                        {user.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No users found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      {roleDialog && (
        <Dialog open onClose={() => setRoleDialog(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Change Role</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>Change role for <strong>{roleDialog.user.profile?.firstName} {roleDialog.user.profile?.lastName}</strong></Typography>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={roleDialog.role} label="Role" onChange={(e) => setRoleDialog({ ...roleDialog, role: e.target.value })}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="coach">Coach</MenuItem>
                <MenuItem value="athlete">Athlete</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoleDialog(null)}>Cancel</Button>
            <Button variant="contained" disabled={updateRoleMutation.isPending}
              onClick={() => updateRoleMutation.mutate({ id: roleDialog.user._id, role: roleDialog.role })}>
              Update
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === 'deactivate' ? 'Deactivate User' : confirmAction?.type === 'delete' ? 'Delete User' : 'Activate User'}
        message={`Are you sure you want to ${confirmAction?.type} ${confirmAction?.user.profile?.firstName}?`}
        confirmLabel={confirmAction?.type === 'deactivate' ? 'Deactivate' : confirmAction?.type === 'delete' ? 'Delete' : 'Activate'}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'delete') deleteMutation.mutate(confirmAction.user._id);
          else toggleActiveMutation.mutate({ id: confirmAction.user._id, isActive: confirmAction.type === 'activate' });
        }}
        onCancel={() => setConfirmAction(null)}
        loading={toggleActiveMutation.isPending || deleteMutation.isPending}
      />
    </Box>
  );
}
