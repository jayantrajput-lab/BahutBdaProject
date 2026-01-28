import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserCog, Shield, Users, Briefcase, User } from 'lucide-react';

/**
 * AdminDashboard - Admin page for managing users and roles
 * Allows viewing all users and changing their roles
 */
const AdminDashboard = () => {
  const { getAllUsers, updateUserRole, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  const handleRoleChange = (username, newRole) => {
    setEditingUser(username);
    setSelectedRole(newRole);
  };

  const handleSaveRole = async (username, userId) => {  // Add userId parameter
  
    console.log('userId : ', userId);
  if (username === currentUser?.username) {
    toast.error('Cannot change your own role');
    setEditingUser(null);
    return;
  }

  const success = await updateUserRole(userId, selectedRole);  // Pass userId instead of username

  if (success) {
    toast.success(`Role updated successfully for ${username}`);
    await loadUsers();
    setEditingUser(null);
  } else {
    toast.error('Failed to update role');
  }
};

  const handleCancelEdit = () => {
    setEditingUser(null);
    setSelectedRole('');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'CHECKER':
        return <UserCog className="h-4 w-4" />;
      case 'MAKER':
        return <Briefcase className="h-4 w-4" />;
      case 'USER':
        return <User className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'CHECKER':
        return 'default';
      case 'MAKER':
        return 'secondary';
      case 'USER':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users and assign roles</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Admins</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.role === 'ADMIN').length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Checkers</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.role === 'CHECKER').length}
                    </p>
                  </div>
                  <UserCog className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Makers</p>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.role === 'MAKER').length}
                    </p>
                  </div>
                  <Briefcase className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage user roles. Click on a role to edit it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Username</th>
                      <th className="text-left py-3 px-4 font-semibold">User ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {getRoleIcon(user.role)}
                            </div>
                            <span className="font-medium">{user.username}</span>
                            {user.username === currentUser?.username && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {user.id}
                          </code>
                        </td>
                        <td className="py-4 px-4">
                          {editingUser === user.username ? (
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="CHECKER">Checker</SelectItem>
                                <SelectItem value="MAKER">Maker</SelectItem>
                                <SelectItem value="USER">User</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                              {getRoleIcon(user.role)}
                              {user.role}
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {editingUser === user.username ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveRole(user.username, user.id)}
                                disabled={!selectedRole}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(user.username, user.role)}
                              disabled={user.username === currentUser?.username}
                            >
                              Change Role
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
