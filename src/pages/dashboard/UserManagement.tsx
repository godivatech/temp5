import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole, UserData, UserRole } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { Search, UserCog } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('employee');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    
    try {
      await updateUserRole(selectedUser.uid, newRole);
      toast.success(`${selectedUser.displayName}'s role updated to ${newRole}`);
      setIsEditDialogOpen(false);
      // Update local state
      setUsers(users.map(user => 
        user.uid === selectedUser.uid ? { ...user, role: newRole } : user
      ));
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };

  const columns = [
    {
      key: 'displayName',
      title: 'Name',
      accessorKey: 'displayName',
    },
    {
      key: 'email',
      title: 'Email',
      accessorKey: 'email',
    },
    {
      key: 'phoneNumber',
      title: 'Phone',
      accessorKey: 'phoneNumber',
    },
    {
      key: 'role',
      title: 'Role',
      accessorKey: 'role',
      cell: ({ row }: { row: any }) => (
        <span className={`font-medium ${
          row.original.role === 'master_admin' ? 'text-red-500' : 
          row.original.role === 'admin' ? 'text-blue-500' : 'text-green-500'
        }`}>
          {row.original.role}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Joined',
      accessorKey: 'createdAt',
      cell: ({ row }: { row: any }) => (
        <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: any }) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditDialog(row.original)}
            disabled={row.original.role === 'master_admin' && userData?.role === 'master_admin'}
          >
            <UserCog className="h-4 w-4 mr-1" />
            Edit Role
          </Button>
        </div>
      ),
    },
  ];

  const filteredUsers = users.filter((user) =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">User Management</h1>
              <div className="relative w-64">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredUsers}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit User Role</DialogTitle>
                  <DialogDescription>
                    Change the role for {selectedUser?.displayName}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Current Role: {selectedUser?.role}</p>
                    <Select
                      value={newRole}
                      onValueChange={(value) => setNewRole(value as UserRole)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select new role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="master_admin">Master Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRoleChange}>
                    Update Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
