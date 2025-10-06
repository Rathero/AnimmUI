'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import useCollectionsService from '@/app/services/CollectionsService';
import { User } from '@/types/users';
import useUsersService from '@/app/services/UsersService';

interface NewCollectionButtonProps {
  onCreated?: () => void; 
}

export default function NewCollectionButton({ onCreated }: NewCollectionButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const { create, update } = useCollectionsService();
  const { addCollection } = create();
  const { getAll: getAllUsers } = useUsersService();

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData?.Result || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateCollection = () => {
    setEditingItem({
      id: 0,
      name: '',
      description: '',
      thumbnail: '',
      userId: 0,
      templates: [],
    });
    setIsEditing(true);
    setError(null);
  };

  const handleSaveCollection = async () => {
    if (!editingItem) return;
    try {
      if (!editingItem.name) {
        setError('Name is required');
        return;
      }

      const collectionData = {
        name: editingItem.name,
        description: editingItem.description,
        thumbnail: editingItem.thumbnail,
        userId: editingItem.userId,
        templates: editingItem.templates || [],
      };

      if (editingItem.id === 0) {
        await addCollection(collectionData);
      } else {
        await update(editingItem.id, collectionData);
      }

      
      setIsEditing(false);
      setEditingItem(null);
      setError(null);

      
      if (onCreated) onCreated();

    } catch (err) {
      setError('Failed to save collection. Please try again.');
      console.error('Error saving collection:', err);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditingItem(null);
    setError(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Collections</h2>
          <Button onClick={handleCreateCollection}>
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingItem.id === 0 ? 'Create' : 'Edit'} Collection
              </CardTitle>
              {editingItem.userId !== 0 &&
                users.find(user => user.id === editingItem.userId) && (
                  <Badge variant="outline" className="text-xs mt-2">
                    {users.find(user => user.id === editingItem.userId)?.email}
                  </Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingItem.name}
                  onChange={e =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingItem.description}
                  onChange={e =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={editingItem.thumbnail}
                  onChange={e =>
                    setEditingItem({
                      ...editingItem,
                      thumbnail: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="userId">User</Label>
                {isLoadingUsers ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <select
                    id="userId"
                    value={editingItem.userId}
                    onChange={e =>
                      setEditingItem({
                        ...editingItem,
                        userId: parseInt(e.target.value),
                      })
                    }
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value={0}>Select a user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button onClick={handleSaveCollection}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
