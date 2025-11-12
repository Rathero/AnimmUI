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
import TemplatesView from './components/templates/TemplatesView';
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
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const collectionsData = await getAllBackoffice();
      const newCollections = collectionsData?.Result || [];
      setCollections(newCollections);
      
      if (selectedCollection) {
        const updatedCollection = newCollections.find(
          (c: Collection) => c.id === selectedCollection.id
        );
        if (updatedCollection) {
          setSelectedCollection(updatedCollection);
          
          if (selectedTemplate) {
            const updatedTemplate = updatedCollection.templates?.find(
              (t: Template) => t.id === selectedTemplate.id
            );
            if (updatedTemplate) {
              setSelectedTemplate(updatedTemplate);
              
              if (selectedModule) {
                const updatedModule = updatedTemplate.modules?.find(
                  (m: Module) => m.id === selectedModule.id
                );
                if (updatedModule) {
                  setSelectedModule(updatedModule);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
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
    fetchData();
  }, []);

  const goToTemplates = (collection?: Collection) => {
    if (collection) {
      setSelectedCollection(collection);
    }
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
          onDataChange={fetchData}
        />
      )}

      {viewMode === 'templates' && selectedCollection && (
        <TemplatesView
          collection={selectedCollection}
          onBack={goToCollections}
          onDataChange={fetchData}
          onTemplateClick={goToModules}
        />
      )}
      
      {viewMode === 'modules' && selectedTemplate && (
        <ModulesView
          template={selectedTemplate}
          onBack={goBackToTemplates}
          onDataChange={fetchData}
          onModuleClick={goToVariables}
        />
      )}

      {viewMode === 'variables' && selectedModule && (
        <VariablesView
          variables={selectedModule.variables || []}
          onBack={goBackToModules}
          onDataChange={fetchData}
          title={`Variables del Módulo #${selectedModule.id}`}
        />
      )}
    </ContentWrapper>
  );
}