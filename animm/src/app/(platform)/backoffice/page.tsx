'use client';
import { useState, useEffect } from 'react';
import { ContentWrapper } from '@/components/ui/content-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { platformStore } from '@/stores/platformStore';
import useCollectionsService from '@/app/services/CollectionsService';
import useTemplatesService from '@/app/services/TemplatesService';
import {
  Collection,
  ApiCollections,
  ApiTemplate,
  Template,
  Module,
  TemplateVariable,
  TemplateVariableTypeEnum,
  ModuleTypeEnum,
} from '@/types/collections';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Settings,
  FileText,
  Image,
  Video,
  Music,
  Link,
  Grid,
} from 'lucide-react';

export default function BackofficePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('collections');
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editMode, setEditMode] = useState<
    'collection' | 'template' | 'module' | 'variable'
  >('collection');

  const {
    getAll: getCollections,
    create: createCollection,
    update: updateCollection,
    delete: deleteCollection,
  } = useCollectionsService();
  const {
    get: getTemplate,
    create: createTemplate,
    update: updateTemplate,
    delete: deleteTemplate,
  } = useTemplatesService();
  const { setPageTitle } = platformStore(state => state);

  // Set page title
  useEffect(() => {
    setPageTitle('Backoffice');
    return () => setPageTitle(undefined);
  }, [setPageTitle]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const collectionsData = await getCollections();
      setCollections(collectionsData?.Result || []);

      // Use templates from collections data instead of making individual API calls
      const allTemplates: Template[] = [];
      for (const collection of collectionsData?.Result || []) {
        for (const template of collection.templates) {
          const templateData = await getTemplate(template.id.toString());
          if (templateData?.Result)
            allTemplates.push(templateData?.Result || []);
        }
      }
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Collection Management
  const handleCreateCollection = () => {
    setEditingItem({
      id: 0,
      name: '',
      description: '',
      thumbnail: '',
      userId: 0,
      templates: [],
    });
    setEditMode('collection');
    setIsEditing(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingItem({ ...collection });
    setEditMode('collection');
    setIsEditing(true);
  };

  const handleSaveCollection = async () => {
    try {
      if (editingItem.id === 0) {
        await createCollection(editingItem);
      } else {
        await updateCollection(editingItem.id, editingItem);
      }
      setIsEditing(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving collection:', error);
    }
  };

  const handleDeleteCollection = async (id: number) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      try {
        await deleteCollection(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting collection:', error);
      }
    }
  };

  // Template Management
  const handleCreateTemplate = (collectionId: number) => {
    setEditingItem({
      id: 0,
      name: '',
      thumbnail: '',
      collectionId: collectionId,
      modules: [],
    });
    setEditMode('template');
    setIsEditing(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingItem({ ...template });
    setEditMode('template');
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingItem.id === 0) {
        await createTemplate(editingItem);
      } else {
        await updateTemplate(editingItem.id, editingItem);
      }
      setIsEditing(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  // Module Management
  const handleCreateModule = (templateId: number) => {
    setEditingItem({
      id: 0,
      moduleType: ModuleTypeEnum.Rive,
      file: '',
      templateId: templateId,
      variables: [],
      images: [],
    });
    setEditMode('module');
    setIsEditing(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingItem({ ...module });
    setEditMode('module');
    setIsEditing(true);
  };

  const handleSaveModule = async () => {
    try {
      // For now, we'll update the template that contains this module
      const template = templates.find(t =>
        t.modules?.some(m => m.id === editingItem.id)
      );
      if (template) {
        const updatedModules = template.modules?.map(m =>
          m.id === editingItem.id ? editingItem : m
        ) || [editingItem];

        await updateTemplate(template.id, {
          ...template,
          modules: updatedModules,
        });
      }
      setIsEditing(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving module:', error);
    }
  };

  const handleDeleteModule = async (templateId: number, moduleId: number) => {
    if (confirm('Are you sure you want to delete this module?')) {
      try {
        const template = templates.find(t => t.id === templateId);
        if (template) {
          const updatedModules =
            template.modules?.filter(m => m.id !== moduleId) || [];
          await updateTemplate(templateId, {
            ...template,
            modules: updatedModules,
          });
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting module:', error);
      }
    }
  };

  // Variable Management
  const handleCreateVariable = (moduleId: number) => {
    setEditingItem({
      id: 0,
      name: '',
      type: TemplateVariableTypeEnum.TextArea,
      defaultValue: '',
      section: '',
      moduleId: moduleId,
    });
    setEditMode('variable');
    setIsEditing(true);
  };

  const handleEditVariable = (variable: TemplateVariable) => {
    setEditingItem({ ...variable });
    setEditMode('variable');
    setIsEditing(true);
  };

  const handleSaveVariable = async () => {
    try {
      // Find the template and module that contains this variable
      const template = templates.find(t =>
        t.modules?.some(m => m.variables?.some(v => v.id === editingItem.id))
      );
      const module = template?.modules?.find(m =>
        m.variables?.some(v => v.id === editingItem.id)
      );

      if (template && module) {
        const updatedVariables = module.variables?.map(v =>
          v.id === editingItem.id ? editingItem : v
        ) || [editingItem];

        const updatedModules =
          template.modules?.map(m =>
            m.id === module.id ? { ...m, variables: updatedVariables } : m
          ) || [];

        await updateTemplate(template.id, {
          ...template,
          modules: updatedModules,
        });
      }
      setIsEditing(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving variable:', error);
    }
  };

  const handleDeleteVariable = async (
    templateId: number,
    moduleId: number,
    variableId: number
  ) => {
    if (confirm('Are you sure you want to delete this variable?')) {
      try {
        const template = templates.find(t => t.id === templateId);
        if (template) {
          const updatedModules =
            template.modules?.map(m =>
              m.id === moduleId
                ? {
                    ...m,
                    variables:
                      m.variables?.filter(v => v.id !== variableId) || [],
                  }
                : m
            ) || [];

          await updateTemplate(templateId, {
            ...template,
            modules: updatedModules,
          });
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting variable:', error);
      }
    }
  };

  const getVariableTypeIcon = (type: TemplateVariableTypeEnum) => {
    switch (type) {
      case TemplateVariableTypeEnum.TextArea:
      case TemplateVariableTypeEnum.Input:
        return <FileText className="w-4 h-4" />;
      case TemplateVariableTypeEnum.Selector:
        return <Settings className="w-4 h-4" />;
      case TemplateVariableTypeEnum.Boolean:
        return <Settings className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Backoffice</h1>
            <p className="text-muted-foreground">
              Manage collections, templates, and content
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
          </TabsList>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Collections</h2>
              <Button onClick={handleCreateCollection}>
                <Plus className="w-4 h-4 mr-2" />
                New Collection
              </Button>
            </div>

            {/* Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map(collection => (
                <Card
                  key={collection.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {collection.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCollection(collection)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCollection(collection.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{collection.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Templates:
                        </span>
                        <Badge variant="secondary">
                          {collection.templates?.length || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-mono">{collection.id}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleCreateTemplate(collection.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Templates</h2>
            </div>

            {/* Templates by Collection */}
            {collections.map(collection => (
              <Card key={collection.id} className="space-y-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{collection.name}</span>
                    <Badge variant="outline">
                      {collection.templates?.length || 0} templates
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {collection.templates && collection.templates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collection.templates.map(template => (
                        <Card
                          key={template.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                {template.name}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTemplate(template)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteTemplate(template.id)
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <CardDescription>
                              Template ID: {template.id}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Modules:
                                </span>
                                <Badge variant="secondary">
                                  {template.modules?.length || 0}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleCreateModule(template.id)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Module
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No templates in this collection
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Modules</h2>
            </div>

            {/* Modules by Template */}
            {templates.map(template => (
              <Card key={template.id} className="space-y-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{template.name}</span>
                    <Badge variant="outline">
                      {template.modules?.length || 0} modules
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {template.modules && template.modules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {template.modules.map(module => (
                        <Card
                          key={module.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                {ModuleTypeEnum[module.moduleType]}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditModule(module)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteModule(template.id, module.id)
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <CardDescription>
                              Module ID: {module.id}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Variables:
                                </span>
                                <Badge variant="secondary">
                                  {module.variables?.length || 0}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleCreateVariable(module.id)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Variable
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No modules in this template
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Variables Tab */}
          <TabsContent value="variables" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Variables</h2>
            </div>

            {/* Variables by Module */}
            {templates.map(
              template =>
                template.modules &&
                template.modules.length > 0 && (
                  <Card key={template.id} className="space-y-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>{template.name}</span>
                        <Badge variant="outline">
                          {template.modules.reduce(
                            (acc, module) =>
                              acc + (module.variables?.length || 0),
                            0
                          )}{' '}
                          variables
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {template.modules.map(
                        module =>
                          module.variables &&
                          module.variables.length > 0 && (
                            <Card key={module.id} className="mb-4">
                              <CardHeader>
                                <CardTitle className="text-base">
                                  {ModuleTypeEnum[module.moduleType]}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {module.variables.map(variable => (
                                    <Card
                                      key={variable.id}
                                      className="hover:shadow-md transition-shadow"
                                    >
                                      <CardHeader>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            {getVariableTypeIcon(variable.type)}
                                            <CardTitle className="text-sm">
                                              {variable.name}
                                            </CardTitle>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleEditVariable(variable)
                                              }
                                            >
                                              <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleDeleteVariable(
                                                  template.id,
                                                  module.id,
                                                  variable.id
                                                )
                                              }
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        <CardDescription>
                                          <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                              <span>Type:</span>
                                              <Badge variant="outline">
                                                {variable.type}
                                              </Badge>
                                            </div>
                                            {variable.section && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span>Section:</span>
                                                <span>{variable.section}</span>
                                              </div>
                                            )}
                                            {variable.defaultValue && (
                                              <div className="flex items-center justify-between text-xs">
                                                <span>Default:</span>
                                                <span className="truncate max-w-20">
                                                  {variable.defaultValue}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </CardDescription>
                                      </CardHeader>
                                    </Card>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )
                      )}
                    </CardContent>
                  </Card>
                )
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Modal */}
        {isEditing && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {editingItem.id === 0
                    ? `Create ${
                        editMode.charAt(0).toUpperCase() + editMode.slice(1)
                      }`
                    : `Edit ${
                        editMode.charAt(0).toUpperCase() + editMode.slice(1)
                      }`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Collection Form */}
                {editMode === 'collection' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editingItem.name}
                        onChange={e =>
                          setEditingItem({
                            ...editingItem,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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
                  </>
                )}

                {/* Template Form */}
                {editMode === 'template' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editingItem.name}
                        onChange={e =>
                          setEditingItem({
                            ...editingItem,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
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
                  </>
                )}

                {/* Module Form */}
                {editMode === 'module' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="moduleType">Module Type</Label>
                      <Select
                        value={editingItem.moduleType?.toString() || '0'}
                        onValueChange={value =>
                          setEditingItem({
                            ...editingItem,
                            moduleType: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select module type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(ModuleTypeEnum)
                            .filter(value => typeof value === 'string')
                            .map((type, index) => (
                              <SelectItem key={type} value={index.toString()}>
                                {type}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">File</Label>
                      <Input
                        id="file"
                        value={editingItem.file}
                        onChange={e =>
                          setEditingItem({
                            ...editingItem,
                            file: e.target.value,
                          })
                        }
                        placeholder="File path or URL"
                      />
                    </div>
                  </>
                )}

                {/* Variable Form */}
                {editMode === 'variable' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editingItem.name}
                        onChange={e =>
                          setEditingItem({
                            ...editingItem,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={editingItem.type?.toString() || '0'}
                        onValueChange={value =>
                          setEditingItem({
                            ...editingItem,
                            type: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TemplateVariableTypeEnum)
                            .filter(value => typeof value === 'string')
                            .map((type, index) => (
                              <SelectItem key={type} value={index.toString()}>
                                {type}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultValue">Default Value</Label>
                      <Input
                        id="defaultValue"
                        value={editingItem.defaultValue}
                        onChange={e =>
                          setEditingItem({
                            ...editingItem,
                            defaultValue: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Input
                        id="section"
                        value={editingItem.section}
                        onChange={e =>
                          setEditingItem({
                            ...editingItem,
                            section: e.target.value,
                          })
                        }
                        placeholder="Leave empty for 'Variables' section"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 pt-4">
                  <Button
                    onClick={
                      editMode === 'collection'
                        ? handleSaveCollection
                        : editMode === 'template'
                        ? handleSaveTemplate
                        : editMode === 'module'
                        ? handleSaveModule
                        : handleSaveVariable
                    }
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingItem(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}
