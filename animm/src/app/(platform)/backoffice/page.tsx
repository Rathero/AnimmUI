'use client';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ContentWrapper } from '@/components/ui/content-wrapper';
import { platformStore } from '@/stores/platformStore';
import { Collection, Template, Module } from '@/types/collections';
import useCollectionsService from '@/app/services/CollectionsService';
import { User } from '@/types/users';
import useUsersService from '@/app/services/UsersService';
import CollectionsView from './components/collections/CollectionsView';
import TemplatesView from './components/template/TemplatesView';
import ModulesView from './components/modules/ModulesView';
import VariablesView from './components/variables/variablesView';

type ViewMode = 'collections' | 'templates' | 'modules' | 'variables';

export default function NewBackofficePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('collections');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const { setPageTitle } = platformStore(state => state);
  const { getAllBackoffice } = useCollectionsService();
  const { getAll: getAllUsers } = useUsersService();


  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData?.Result || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };


  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const response = await getAllBackoffice();

      const data = response?.Result || [];
      

      const normalized: Collection[] = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        thumbnail: c.thumbnail,
        userId: c.userId,
        templates: c.templates || [], 
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
      
      setCollections(normalized);
      console.log('Collections loaded:', normalized); 
    } catch (err) {
      console.error('Error fetching collections:', err);
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPageTitle('Backoffice');
  }, [setPageTitle]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchCollections();
  }, []);


  const goToTemplates = (collection: Collection) => {
    setSelectedCollection(collection);
    setSelectedTemplate(null);
    setSelectedModule(null);
    setViewMode('templates');
  };

  const goToCollections = () => {
    setSelectedCollection(null);
    setSelectedTemplate(null);
    setSelectedModule(null);
    setViewMode('collections');
  };

  const goToModules = (template: Template) => {
    setSelectedTemplate(template);
    setSelectedModule(null);
    setViewMode('modules');
  };

  const goBackToTemplates = () => {
    setSelectedTemplate(null);
    setSelectedModule(null);
    setViewMode('templates');
  };

  const goToVariables = (module: Module) => {
    setSelectedModule(module);
    setViewMode('variables');
  };

  const goBackToModules = () => {
    setSelectedModule(null);
    setViewMode('modules');
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
      {viewMode === 'collections' && (
        <CollectionsView
          collections={collections}
          users={users}
          isLoadingUsers={isLoadingUsers}
          onCollectionClick={goToTemplates}
          onDataChange={fetchCollections}
        />
      )}

      {viewMode === 'templates' && selectedCollection && (
        <TemplatesView
          collection={selectedCollection}
          onBack={goToCollections}
          onTemplateClick={goToModules}
        />
      )}

      {viewMode === 'modules' && selectedTemplate && (
        <ModulesView
          template={selectedTemplate}
          onBack={goBackToTemplates}
          onDataChange={fetchCollections}
          onModuleClick={goToVariables}
        />
      )}

      {viewMode === 'variables' && selectedModule && (
        <VariablesView
          variables={selectedModule.variables || []}
          onBack={goBackToModules}
          title={`Variables del Módulo #${selectedModule.id}`}
        />
      )}
    </ContentWrapper>
  );
}