import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserCog, Shield, Users, Briefcase, User, UserPlus, Loader2 } from 'lucide-react';

/**
 * AdminDashboard - Admin page for viewing user stats and creating new users
 */
const AdminDashboard = () => {
  const { getUserCounts, createUser } = useAuthStore();
  
  // User counts state
  const [counts, setCounts] = useState({
    total: 0,
    ADMIN: 0,
    MAKER: 0,
    CHECKER: 0,
    USER: 0,
  });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  
  // Create user form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    setIsLoadingCounts(true);
    const data = await getUserCounts();
    setCounts(data);
    setIsLoadingCounts(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!password.trim()) {
      toast.error('Password is required');
      return;
    }
    if (!role) {
      toast.error('Please select a role');
      return;
    }

    setIsCreating(true);
    const result = await createUser(username.trim(), password, role);
    setIsCreating(false);

    if (result.success) {
      toast.success(`User "${username}" created successfully as ${role}`);
      // Clear form
      setUsername('');
      setPassword('');
      setRole('');
      // Refresh counts
      loadCounts();
    } else {
      toast.error(result.error || 'Failed to create user');
    }
  };

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setRole('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">View user statistics and create new users</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Users className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">
                    {isLoadingCounts ? '...' : counts.total}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-8 w-8 text-red-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-3xl font-bold text-red-600">
                    {isLoadingCounts ? '...' : counts.ADMIN}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Briefcase className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Makers</p>
                  <p className="text-3xl font-bold text-green-600">
                    {isLoadingCounts ? '...' : counts.MAKER}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <UserCog className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Checkers</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {isLoadingCounts ? '...' : counts.CHECKER}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <User className="h-8 w-8 text-purple-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {isLoadingCounts ? '...' : counts.USER}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create User Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create New User
              </CardTitle>
              <CardDescription>
                Add a new user to the system with a specific role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="h-11"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="h-11"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            User
                          </div>
                        </SelectItem>
                        <SelectItem value="MAKER">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Maker
                          </div>
                        </SelectItem>
                        <SelectItem value="CHECKER">
                          <div className="flex items-center gap-2">
                            <UserCog className="h-4 w-4" />
                            Checker
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={isCreating || !username.trim() || !password.trim() || !role}
                    className="min-w-[140px]"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={clearForm}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Role Descriptions:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>User:</strong> Can parse SMS and view transaction history</li>
                  <li><strong>Maker:</strong> Can create and edit regex patterns</li>
                  <li><strong>Checker:</strong> Can approve or reject patterns created by makers</li>
                  <li><strong>Admin:</strong> Can create new users and view statistics</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
