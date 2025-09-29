import { useState, useCallback, useEffect } from 'react';
import languageService from '@/app/services/LanguageService';
import {
  TemplateVariable,
  TemplateVariableTypeEnum,
  Template,
  Language,
} from '@/types/collections';

interface UseLanguageContentProps {
  template: Template;
  changeText: (text: string, variableToModify: TemplateVariable) => void;
  variables: TemplateVariable[];
  onImageChange?: (imageName: string, imageUrl: string) => void;
}

interface UseLanguageContentReturn {
  selectedLanguage: string;
  availableLanguages: Language[];
  hasLanguageConfig: boolean;
  setLanguage: (languageName: string) => void;
  applyLanguageContent: () => void;
}

export const useLanguageContent = ({
  template,
  changeText,
  variables,
  onImageChange,
}: UseLanguageContentProps): UseLanguageContentReturn => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  // Initialize language service with template data
  useEffect(() => {
    if (template) {
      languageService.setTemplate(template);

      // Set image change callback if provided
      if (onImageChange) {
        languageService.setImageChangeCallback(onImageChange);
      }
    }
  }, [template, onImageChange]);

  // Get available languages for this template
  const availableLanguages = languageService.getAvailableLanguages();
  const hasLanguageConfig = languageService.hasLanguageConfig();

  // Set the first available language as default if none is selected
  useEffect(() => {
    if (!selectedLanguage && availableLanguages.length > 0) {
      setSelectedLanguage(availableLanguages[0].name);
    }
  }, [selectedLanguage, availableLanguages]);

  const setLanguage = useCallback((languageName: string) => {
    setSelectedLanguage(languageName);
  }, []);

  const applyLanguageContent = useCallback(() => {
    if (!selectedLanguage) {
      return;
    }

    const languageContent =
      languageService.getLanguageContent(selectedLanguage);
    if (!languageContent) {
      console.warn(
        `No language content found for language ${selectedLanguage}`
      );
      return;
    }

    // Apply language content to all text variables
    variables.forEach(variable => {
      if (
        variable.type === TemplateVariableTypeEnum.TextArea ||
        variable.type === TemplateVariableTypeEnum.Input
      ) {
        const content = languageContent.variables[variable.name];
        if (content !== undefined) {
          changeText(content, variable);
        }
      }
    });
  }, [selectedLanguage, changeText, variables]);

  return {
    selectedLanguage,
    availableLanguages,
    hasLanguageConfig,
    setLanguage,
    applyLanguageContent,
  };
};
