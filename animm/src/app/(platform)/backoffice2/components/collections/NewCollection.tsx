import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCollectionService } from '../../services/useCollectionService';



export default function NewCollectionButton() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editMode] = useState<
    'collection' | 'template' | 'module' | 'variable'
  >('collection');

  const { create } = useCollectionService();

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
  };

    const handleSaveCollection = async () => {
      try {
        if (editingItem.id === 0) {
          await create(editingItem);
        } 
        setIsEditing(false);
        setEditingItem(null);
      } catch (error) {
        console.error('Error saving collection:', error);
      }
    };


  const handleClose = () => {
    setIsEditing(false);
    setEditingItem({
      id: 0,
      name: '',
      description: '',
      thumbnail: '',
      userId: 0,
      templates: [],
    });
  };


  return (
    <>
      <div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Collections</h2>
            <Button onClick={handleCreateCollection}>
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </div>
        </div>
      </div>

      
      {isEditing && editMode === 'collection' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={editingItem.thumbnail}
                  onChange={e =>
                    setEditingItem({ ...editingItem, thumbnail: e.target.value })
                  }
                />
                {editingItem.thumbnail && (
                  <img
                    src={editingItem.thumbnail}
                    alt="Thumbnail preview"
                    className="w-full max-w-xs h-32 object-cover rounded-md border mt-2"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
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