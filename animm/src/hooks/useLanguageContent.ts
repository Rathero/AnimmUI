import { useState, useCallback } from 'react';
import languageService from '@/app/services/LanguageService';
import {
  TemplateVariable,
  TemplateVariableTypeEnum,
} from '@/types/collections';

interface UseLanguageContentProps {
  templateId: string;
  changeText: (text: string, variableToModify: TemplateVariable) => void;
  variables: TemplateVariable[];
}

interface UseLanguageContentReturn {
  selectedLanguage: string;
  availableLanguages: string[];
  hasLanguageConfig: boolean;
  setLanguage: (languageId: string) => void;
  applyLanguageContent: () => void;
}

export const useLanguageContent = ({
  templateId,
  changeText,
  variables,
}: UseLanguageContentProps): UseLanguageContentReturn => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  // Get available languages for this template
  const availableLanguages = languageService.getAvailableLanguages(templateId);
  const hasLanguageConfig = languageService.hasLanguageConfig(templateId);

  // Set the first available language as default if none is selected
  if (!selectedLanguage && availableLanguages.length > 0) {
    setSelectedLanguage(availableLanguages[0]);
  }

  const setLanguage = useCallback((languageId: string) => {
    setSelectedLanguage(languageId);
  }, []);

  const applyLanguageContent = useCallback(() => {
    if (!selectedLanguage || !templateId) {
      return;
    }

    const languageContent = languageService.getLanguageContent(
      templateId,
      selectedLanguage
    );
    if (!languageContent) {
      console.warn(
        `No language content found for template ${templateId} and language ${selectedLanguage}`
      );
      return;
    }

    // Apply language content to all text variables
    variables.forEach(variable => {
      if (
        variable.type === TemplateVariableTypeEnum.TextArea ||
        variable.type === TemplateVariableTypeEnum.Input
      ) {
        const content = languageContent.variables[variable.id.toString()];
        if (content !== undefined) {
          changeText(content, variable);
        }
      }
    });
  }, [selectedLanguage, templateId, changeText, variables]);

  return {
    selectedLanguage,
    availableLanguages,
    hasLanguageConfig,
    setLanguage,
    applyLanguageContent,
  };
};
