import {
  Template,
  Product,
  Language,
  ProductVariable,
} from '@/types/collections';

export interface LanguageContent {
  variables: Record<string, string>;
  images: Record<string, string>;
}

class LanguageService {
  private template: Template | null = null;
  private selectedProduct: Product | null = null;
  private onImageChange:
    | ((imageName: string, imageUrl: string) => void)
    | null = null;

  /**
   * Set the current template data
   * @param template - The template data from API
   */
  setTemplate(template: Template): void {
    this.template = template;
  }

  /**
   * Set the selected product
   * @param product - The selected product
   */
  setSelectedProduct(product: Product): void {
    this.selectedProduct = product;
  }

  /**
   * Set the image change callback
   * @param callback - Function to call when an image needs to be replaced
   */
  setImageChangeCallback(
    callback: (imageName: string, imageUrl: string) => void
  ): void {
    this.onImageChange = callback;
  }

  /**
   * Check if a variable name represents an image variable (IMAGE#XXXX format)
   * @param variableName - The variable name to check
   * @returns true if it's an image variable, false otherwise
   */
  private isImageVariable(variableName: string): boolean {
    return variableName.startsWith('IMAGE#');
  }

  /**
   * Extract the image name from an image variable (IMAGE#XXXX -> XXXX)
   * @param variableName - The image variable name
   * @returns The image name without the IMAGE# prefix
   */
  private extractImageName(variableName: string): string {
    return variableName.replace('IMAGE#', '');
  }

  /**
   * Get all available languages for the current template
   * @returns Array of Language objects available for the template
   */
  getAvailableLanguages(): Language[] {
    if (!this.template?.languages) {
      return [];
    }
    return this.template.languages;
  }

  /**
   * Get all available products for the current template
   * @returns Array of Product objects available for the template
   */
  getAvailableProducts(): Product[] {
    if (!this.template?.products) {
      return [];
    }
    return this.template.products;
  }

  /**
   * Check if the template has language configuration
   * @returns boolean indicating if the template has languages
   */
  hasLanguageConfig(): boolean {
    return !!(this.template?.languages && this.template.languages.length > 0);
  }

  /**
   * Check if the template has products
   * @returns boolean indicating if the template has products
   */
  hasProducts(): boolean {
    return !!(this.template?.products && this.template.products.length > 0);
  }

  /**
   * Get language content for a specific language and product
   * @param languageName - The name of the language
   * @param productId - The ID of the product (optional, uses selected product if not provided)
   * @returns LanguageContent object with variables mapping, or null if not found
   */
  getLanguageContent(
    languageName: string,
    productId?: number
  ): LanguageContent | null {
    if (!this.template?.products) {
      console.warn('No products available for this template');
      return null;
    }

    const product = productId
      ? this.template.products.find(p => p.id === productId)
      : this.selectedProduct;

    if (!product) {
      console.warn(`Product not found for ID: ${productId || 'selected'}`);
      return null;
    }

    // Filter product variables by language
    const languageVariables = product.productVariables.filter(
      pv => pv.language === languageName
    );

    // Get image variables (no language filter - they apply to all languages)
    const imageVariables = product.productVariables.filter(pv =>
      this.isImageVariable(pv.name)
    );

    if (languageVariables.length === 0 && imageVariables.length === 0) {
      console.warn(`No variables found for language: ${languageName}`);
      return null;
    }

    // Convert to the expected format
    const variables: Record<string, string> = {};
    const images: Record<string, string> = {};

    // Process text variables
    languageVariables.forEach(pv => {
      variables[pv.name] = pv.value;
    });

    // Process image variables
    imageVariables.forEach(pv => {
      const imageName = this.extractImageName(pv.name);
      images[imageName] = pv.value;

      // Trigger image replacement if callback is set
      if (this.onImageChange) {
        this.onImageChange(imageName, pv.value);
      }
    });

    return { variables, images };
  }

  /**
   * Get variable content for a specific language, product, and variable name
   * @param languageName - The name of the language
   * @param variableName - The name of the variable
   * @param productId - The ID of the product (optional, uses selected product if not provided)
   * @returns The content for the variable, or null if not found
   */
  getVariableContent(
    languageName: string,
    variableName: string,
    productId?: number
  ): string | null {
    const languageContent = this.getLanguageContent(languageName, productId);
    if (!languageContent) {
      return null;
    }

    return languageContent.variables[variableName] || null;
  }

  /**
   * Get image content for a specific product and image name
   * @param imageName - The name of the image (without IMAGE# prefix)
   * @param productId - The ID of the product (optional, uses selected product if not provided)
   * @returns The image URL, or null if not found
   */
  getImageContent(imageName: string, productId?: number): string | null {
    if (!this.template?.products) {
      return null;
    }

    const product = productId
      ? this.template.products.find(p => p.id === productId)
      : this.selectedProduct;

    if (!product) {
      return null;
    }

    // Find image variable with IMAGE# prefix
    const imageVariable = product.productVariables.find(
      pv => pv.name === `IMAGE#${imageName}`
    );

    return imageVariable?.value || null;
  }

  /**
   * Apply all image variables for the current product (language-independent)
   * @param productId - The ID of the product (optional, uses selected product if not provided)
   */
  applyImageVariables(productId?: number): void {
    if (!this.template?.products || !this.onImageChange) {
      return;
    }

    const product = productId
      ? this.template.products.find(p => p.id === productId)
      : this.selectedProduct;

    if (!product) {
      return;
    }

    // Get all image variables for this product
    const imageVariables = product.productVariables.filter(pv =>
      this.isImageVariable(pv.name)
    );

    // Apply each image variable
    imageVariables.forEach(pv => {
      const imageName = this.extractImageName(pv.name);
      this.onImageChange!(imageName, pv.value);
    });
  }

  /**
   * Get the current selected product
   * @returns The currently selected product, or null if none selected
   */
  getSelectedProduct(): Product | null {
    return this.selectedProduct;
  }

  /**
   * Get the current template
   * @returns The current template, or null if none set
   */
  getCurrentTemplate(): Template | null {
    return this.template;
  }
}

// Export a singleton instance
const languageService = new LanguageService();
export default languageService;
