import languageConfig from '@/data/LanguageConfig.json';

export interface LanguageContent {
  variables: Record<string, string>;
}

export interface TemplateLanguageConfig {
  languages: Record<string, LanguageContent>;
}

export interface LanguageConfig {
  templates: Record<string, TemplateLanguageConfig>;
}

class LanguageService {
  private config: LanguageConfig = languageConfig as LanguageConfig;

  /**
   * Get language content for a specific template and language
   * @param templateId - The ID of the template
   * @param languageId - The ID of the language
   * @returns LanguageContent object with variables mapping, or null if not found
   */
  getLanguageContent(
    templateId: string,
    languageId: string
  ): LanguageContent | null {
    const template = this.config.templates[templateId];
    if (!template) {
      console.warn(
        `Template ${templateId} not found in language configuration`
      );
      return null;
    }

    const language = template.languages[languageId];
    if (!language) {
      console.warn(
        `Language ${languageId} not found for template ${templateId}`
      );
      return null;
    }

    return language;
  }

  /**
   * Get all available languages for a specific template
   * @param templateId - The ID of the template
   * @returns Array of language IDs available for the template
   */
  getAvailableLanguages(templateId: string): string[] {
    const template = this.config.templates[templateId];
    if (!template) {
      return [];
    }

    return Object.keys(template.languages);
  }

  /**
   * Check if a template has language configuration
   * @param templateId - The ID of the template
   * @returns boolean indicating if the template has language configuration
   */
  hasLanguageConfig(templateId: string): boolean {
    const template = this.config.templates[templateId];
    return template && Object.keys(template.languages).length > 0;
  }

  /**
   * Get all configured templates
   * @returns Array of template IDs that have language configuration
   */
  getConfiguredTemplates(): string[] {
    return Object.keys(this.config.templates);
  }

  /**
   * Get variable content for a specific template, language, and variable ID
   * @param templateId - The ID of the template
   * @param languageId - The ID of the language
   * @param variableId - The ID of the variable
   * @returns The content for the variable, or null if not found
   */
  getVariableContent(
    templateId: string,
    languageId: string,
    variableId: string
  ): string | null {
    const languageContent = this.getLanguageContent(templateId, languageId);
    if (!languageContent) {
      return null;
    }

    return languageContent.variables[variableId] || null;
  }
}

// Export a singleton instance
const languageService = new LanguageService();
export default languageService;
