'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileAsset, Rive } from '@rive-app/react-webgl2';
import {
  useRive,
  useViewModel,
  useViewModelInstanceString,
  useViewModelInstance,
  useViewModelInstanceNumber,
  useViewModelInstanceBoolean,
} from '@rive-app/react-webgl2';
import { getBaseNameFromPath, replaceRiveImageFromUrl } from '@/lib/rive-image';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import { EditorZoom } from '@/components/editor/editor-zoom';
import { EditorPlay } from '@/components/editor/editor-play';
import { EditorText } from '@/components/editor/editor-text';
import { EditorSelect } from '@/components/editor/editor-select';

import {
  ApiTemplate,
  Module,
  TemplateVariable,
  TemplateVariableTypeEnum,
  TemplateComposition,
  TemplateImage,
} from '@/types/collections';
import {
  ChevronDown,
  LinkIcon,
  Loader2,
  ArrowLeft,
  Upload,
  Save,
  Type,
  Image as ImageIcon,
  Video,
  Music,
  Link,
  Grid3X3,
  FileText,
  Download,
  ChevronRight,
  Settings,
} from 'lucide-react';
import EditorImages from '@/components/editor/editor-images';
import RiveComp from '@/components/editor/rive-component';
import EditorUrl from '@/components/editor/editor-url';
import {
  GeneratedAnimation,
  GeneratedAnimationStatusEnum,
  GeneratedModule,
} from '@/types/generatedAnimations';
import useTemplatesService from '@/app/services/TemplatesService';
import useGeneratedAnimationService from '@/app/services/GeneratedAnimationsService';
import EditorResolution from '@/components/editor/editor-resolution';
import EditorCsv from '@/components/editor/editor-csv';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EditorCheckbox } from '@/components/editor/editor-checkbox';
import React from 'react';
import { VariableStringSetter } from '@/components/editor/variable-string-setter';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Editor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [template, setTemplate] = useState<ApiTemplate | undefined>(undefined);
  const [generatedAnimation, setGeneratedAnimation] = useState<
    GeneratedAnimation | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('text');
  const [isEditMode, setIsEditMode] = useState(true);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('');

  // Get all unique sections from all modules
  const getAllSections = () => {
    if (!template?.Result?.modules) return [];
    const sections = new Set<string>();
    template.Result.modules.forEach(module => {
      module.variables.forEach(variable => {
        const sectionName = variable.section || 'Variables';
        sections.add(sectionName);
      });
    });
    return Array.from(sections);
  };

  // Get variables for a specific section and tab
  const getVariablesForSection = (section: string, tab: string) => {
    if (!template?.Result?.modules) return [];
    const variables: TemplateVariable[] = [];
    template.Result.modules.forEach(module => {
      module.variables.forEach(variable => {
        const variableSection = variable.section || 'Variables';
        if (variableSection === section) {
          if (
            tab === 'text' &&
            (variable.type === TemplateVariableTypeEnum.TextArea ||
              variable.type === TemplateVariableTypeEnum.Input)
          ) {
            variables.push(variable);
          } else if (
            tab === 'triggers' &&
            (variable.type === TemplateVariableTypeEnum.Selector ||
              variable.type === TemplateVariableTypeEnum.Boolean)
          ) {
            variables.push(variable);
          }
        }
      });
    });
    return variables;
  };

  // Get images for a specific section
  const getImagesForSection = (section: string) => {
    if (!template?.Result?.modules) return [];
    const images: TemplateImage[] = [];
    template.Result.modules.forEach(module => {
      module.images.forEach(image => {
        // Note: Images don't have a section attribute, so we'll show all images for now
        // You might need to add section info to images if needed
        images.push(image);
      });
    });
    return images;
  };

  // Check if a tab has any content
  const hasTabContent = (tabId: string) => {
    if (!template?.Result?.modules) return false;

    if (tabId === 'image') {
      return template.Result.modules.some(module => module.images.length > 0);
    }

    return template.Result.modules.some(module =>
      module.variables.some(variable => {
        if (tabId === 'text') {
          return (
            variable.type === TemplateVariableTypeEnum.TextArea ||
            variable.type === TemplateVariableTypeEnum.Input
          );
        } else if (tabId === 'triggers') {
          return (
            variable.type === TemplateVariableTypeEnum.Selector ||
            variable.type === TemplateVariableTypeEnum.Boolean
          );
        }
        return false;
      })
    );
  };

  // Get available tabs based on content
  const getAvailableTabs = () => {
    const allTabs = [
      { id: 'text', icon: Type, label: 'Text' },
      { id: 'image', icon: ImageIcon, label: 'Image' },
      { id: 'triggers', icon: Settings, label: 'Triggers' },
    ];

    return allTabs.filter(tab => hasTabContent(tab.id));
  };

  const tabs = getAvailableTabs();

  // Ensure activeTab is valid
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const [artBoard, setArtBoard] = useState<string>('');
  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const [rivesStates, setRiveStates] = useState<Rive[]>([]);
  const changeImage = async (url: string, _i: number, name: string) => {
    const baseName = getBaseNameFromPath(name);
    if (!baseName) return;
    await replaceRiveImageFromUrl(assets, baseName, url);
  };
  const [playing, setPlaying] = useState(true);
  async function playRive() {
    if (rivesStates) {
      rivesStates.forEach(riveState => {
        if (riveState) {
          riveState.play;
          playing ? riveState.pause() : riveState.play();
        }
      });
      setPlaying(!playing);
    }
  }

  const [functionsToSetBoolean, setFunctionsToSetBoolean] = useState<
    Array<{ x: number; f: (x: boolean) => void }>
  >([]);
  // Reusable function to update variable values state (kept for compatibility)
  const updateGeneratedAnimationVariable = (
    variableId: number,
    value: string | number | boolean
  ) => {
    // This function is kept for compatibility but no longer needed
  };

  async function changeCheckbox(
    value: boolean,
    variableToModify: TemplateVariable
  ) {
    functionsToSetBoolean.forEach(x => {
      if (x.x == variableToModify.id) {
        x.f(value);
      }
    });
    updateGeneratedAnimationVariable(variableToModify.id, value);
  }

  const [functionsToSetNumbers, setFunctionsToSetNumbers] = useState<
    Array<{ x: number; f: (x: number) => void }>
  >([]);
  async function changeSelect(
    value: number,
    variableToModify: TemplateVariable
  ) {
    functionsToSetNumbers.forEach(x => {
      if (x.x == variableToModify.id) {
        x.f(value);
      }
    });
    updateGeneratedAnimationVariable(variableToModify.id, value);
  }
  const [functionsToSetStrings, setFunctionsToSetStrings] = useState<
    Array<{ x: number; f: (x: string) => void }>
  >([]);
  async function changeText(text: string, variableToModify: TemplateVariable) {
    functionsToSetStrings.forEach(x => {
      if (x.x == variableToModify.id) {
        x.f(text);
      }
    });

    updateGeneratedAnimationVariable(variableToModify.id, text);
  }
  const { get } = useTemplatesService();
  async function initializeTemplate() {
    setIsLoading(true);
    try {
      const template = await get(params.id);
      setTemplate(template);
      if (template) {
        // No longer need to initialize variable values state since we read directly from inputs

        if (
          template?.Result.templateCompositions &&
          template.Result.templateCompositions.length > 0
        ) {
          const composition = template?.Result.templateCompositions[0];
          setArtBoard(template?.Result.templateCompositions[0].name);
          setCurrentHeight(composition.templateResolutions[0].height);
          setCurrentWidth(composition.templateResolutions[0].width);
        }
        const newGeneratedAnimation: GeneratedAnimation = {
          baseTemplate: template.Result,
          baseTemplateId: template.Result.id,
          image: template.Result.thumbnail,
          name: '',
          folder: '',
          status: GeneratedAnimationStatusEnum.NoStatus,
          modules: [],
          id: 0,
        };
        template.Result.modules.forEach(module => {
          const newModuleToAdd: GeneratedModule = {
            baseModule: module,
            baseModuleId: module.id,
            file: module.file,
            images: [],
            variables: [],
            moduleType: module.moduleType,
          };
          module.images.forEach(image => {
            newModuleToAdd.images.push({
              image: '',
              templateImage: image,
              tepmlateImageId: image.id,
            });
          });
          module.variables.forEach(variable => {
            newModuleToAdd.variables.push({
              value: '',
              templateVariable: variable,
              tepmlateVariableId: variable.id,
            });
          });
          newGeneratedAnimation.modules.push(newModuleToAdd);
        });
        setGeneratedAnimation(newGeneratedAnimation);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const { setValue: setValueWidth } = useViewModelInstanceNumber(
    'CurrentWidth',
    rivesStates[0]?.viewModelInstance
  );
  const { setValue: setValueHeight } = useViewModelInstanceNumber(
    'CurrentHeight',
    rivesStates[0]?.viewModelInstance
  );
  const [currentWidth, setCurrentWidth] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(0);
  async function changeresolution(
    width: number,
    height: number,
    artBoard: string
  ) {
    setValueWidth(width);
    setValueHeight(height);
    setArtBoard(artBoard);
    const mainCan: any = document.querySelector('#MainCanvas');
    if (mainCan) {
      mainCan.style.width = width + 'px';
      setCurrentWidth(width);
      mainCan.style.height = height + 'px';
      setCurrentHeight(height);
    }
    //if (rivesStates && rivesStates[0]) {
    rivesStates[0].reset({
      artboard: artBoard,
      stateMachines: 'SM',
      autoplay: true,
      autoBind: true,
    });
    //}
  }
  function updateAllVariablesAfterResolutionChange() {
    // Add a small delay to ensure Rive is ready*/
    /*setTimeout(() => {
      if (template?.Result) {
        template?.Result.modules.forEach(module => {
          module.variables.forEach(variable => {
            // Find the input element for this variable
            const inputElement = document.querySelector(
              `[data-variable-id="${variable.id}"]`
            ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

            if (inputElement) {
              let currentValue: string | number | boolean;

              // Get the current value based on input type
              if (inputElement.type === 'checkbox') {
                currentValue = (inputElement as HTMLInputElement).checked;
              } else if (inputElement.tagName === 'SELECT') {
                currentValue = parseInt(
                  (inputElement as HTMLSelectElement).value
                );
              } else {
                currentValue = inputElement.value;
              }
              // Update the variable based on its type
              switch (variable.type) {
                case TemplateVariableTypeEnum.Input:
                case TemplateVariableTypeEnum.TextArea:
                  changeText(currentValue as string, variable);
                  break;
                case TemplateVariableTypeEnum.Boolean:
                  changeCheckbox(currentValue as boolean, variable);
                  break;
                case TemplateVariableTypeEnum.Selector:
                  changeSelect(currentValue as number, variable);
                  break;
              }
            }
          });
        });
      }
    }, 1000);*/
  }
  const { add } = useGeneratedAnimationService();
  async function generateUrlFunction(name: string) {
    if (generatedAnimation) {
      generatedAnimation.name = name;
      add(generatedAnimation);
    }
  }

  // EventListener to Deactivate Zoom Pan to be able to Resize
  const [isResizing, setIsResizing] = useState(false);

  // Initialize template on component mount
  useEffect(() => {
    initializeTemplate();
  }, []);

  // Set up event listeners after template is loaded
  useEffect(() => {
    if (!template) return; // Wait for template to be loaded

    const mainCanvas = document.getElementById('MainCanvas');
    if (!mainCanvas) return;

    const handleMouseEvent = (event: any) => {
      if (event.target.classList.contains('resizeItem')) {
        setIsResizing(true);
      } else {
        setIsResizing(false);
      }
    };

    document.body.addEventListener('mousemove', handleMouseEvent);
    mainCanvas.addEventListener('mousedown', handleMouseEvent);

    // Cleanup function
    return () => {
      mainCanvas.removeEventListener('mousedown', handleMouseEvent);
      document.body.removeEventListener('mousemove', handleMouseEvent);
    };
  }, [template]); // Re-run when template changes

  const generateUrl = async () => {
    if (template) {
      const paramsUrl = new URLSearchParams();
      template.Result.modules.forEach(module => {
        module.variables.forEach(variable => {
          paramsUrl.append(variable.id.toString(), variable.defaultValue || '');
        });
      });
      paramsUrl.append('autoplay', 'true');
      paramsUrl.append('artboard', artBoard);
      window.open(
        '/viewer/' + params.id + '?' + paramsUrl.toString(),
        '_blank'
      );
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingJpeg, setIsExportingJpeg] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Get all variables
      const variables: Record<string, string> = {};
      if (template) {
        template.Result.modules.forEach(module => {
          module.variables.forEach(variable => {
            variables[variable.name] = variable.defaultValue || '';
          });
        });
      }

      // Call export API
      const response = await fetch(
        'https://animmexport.azurewebsites.net/Export',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: params.id,
            variables,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Video exported successfully!');
        // Open the video in a new tab
        window.open(data.videoUrl, '_blank');
      } else {
        toast.error('Failed to export video');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export video');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJpeg = async () => {
    setIsExportingJpeg(true);
    try {
      if (rivesStates && rivesStates.length > 0) {
        rivesStates.forEach(riveState => {
          if (riveState) {
            riveState.pause();
          }
        });
        setPlaying(false);
      }

      const canvas = document.querySelector(
        '#MainCanvas canvas'
      ) as HTMLCanvasElement;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${template?.Result.name || 'export'}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('JPEG exported successfully!');
      } else {
        toast.error('Failed to find canvas element for export.');
      }
    } catch (error) {
      console.error('JPEG export error:', error);
      toast.error('Failed to export JPEG.');
    } finally {
      setIsExportingJpeg(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#f7f8fa]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#f7f8fa]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2 h-auto"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex justify-center">
          <span className="text-sm font-medium">{template?.Result.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setIsSavingImage(true);
              try {
                if (rivesStates && rivesStates.length > 0) {
                  rivesStates.forEach(riveState => {
                    if (riveState) {
                      riveState.pause();
                    }
                  });
                  setPlaying(false);
                }

                const sourceCanvas = document.querySelector(
                  '#MainCanvas canvas'
                ) as HTMLCanvasElement;
                if (!sourceCanvas) {
                  toast.error('Failed to find canvas element for export.');
                } else {
                  const exportCanvas = document.createElement('canvas');
                  // Use the canvas' internal resolution (max available)
                  exportCanvas.width = sourceCanvas.width;
                  exportCanvas.height = sourceCanvas.height;
                  const ctx = exportCanvas.getContext('2d');
                  if (!ctx) {
                    toast.error('Failed to get canvas context for export.');
                  } else {
                    ctx.drawImage(sourceCanvas, 0, 0);
                    exportCanvas.toBlob(blob => {
                      if (!blob) {
                        toast.error('PNG export failed.');
                        return;
                      }
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${
                        template?.Result.name || 'export'
                      }.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      toast.success('PNG saved successfully!');
                    }, 'image/png');
                  }
                }
              } catch (error) {
                console.error('PNG export error:', error);
                toast.error('Failed to save PNG.');
              } finally {
                setIsSavingImage(false);
              }
            }}
            disabled={isSavingImage}
          >
            <Download className="mr-2 h-4 w-4" />
            Save image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvDialogOpen(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {/* <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Project
          </Button> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar: Variables */}
        <div className="w-[320px] bg-white border-r flex flex-col">
          {/* Content Area */}
          <div className="flex flex-1 min-h-0">
            {/* Vertical Tabs - Fixed */}
            <div className="w-16 border-r bg-gray-50 flex-shrink-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex flex-col items-center py-4 px-2 text-xs transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mb-1" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* CSV Import */}
                {/* <div className="mb-4">
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV...
                  </Button>
                </div> */}

                {/* Section Selector */}
                {template?.Result?.modules && getAllSections().length > 1 && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Section
                    </label>
                    <select
                      value={selectedSection}
                      onChange={e => setSelectedSection(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {getAllSections().map((section, index) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Variables */}
                {template?.Result?.modules &&
                  template.Result.modules.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">
                        {selectedSection || getAllSections()[0] || 'Section'}
                      </div>
                      <div className="space-y-3 pl-3">
                        {/* Text Variables */}
                        {activeTab === 'text' &&
                          getVariablesForSection(
                            selectedSection || getAllSections()[0],
                            'text'
                          ).map((v: TemplateVariable, vIdx: number) => (
                            <div key={v.id} className="space-y-2">
                              {v.type === TemplateVariableTypeEnum.TextArea && (
                                <EditorText
                                  variable={v}
                                  changeText={changeText}
                                />
                              )}
                              {v.type === TemplateVariableTypeEnum.Input && (
                                <EditorText
                                  variable={v}
                                  changeText={changeText}
                                />
                              )}
                            </div>
                          ))}

                        {/* Image Variables */}
                        {activeTab === 'image' && (
                          <EditorImages
                            images={getImagesForSection(
                              selectedSection || getAllSections()[0]
                            )}
                            changeImageParent={changeImage}
                          />
                        )}

                        {/* Trigger Variables */}
                        {activeTab === 'triggers' &&
                          getVariablesForSection(
                            selectedSection || getAllSections()[0],
                            'triggers'
                          ).map((v: TemplateVariable, vIdx: number) => (
                            <div key={v.id} className="space-y-2">
                              {v.type === TemplateVariableTypeEnum.Selector && (
                                <EditorSelect
                                  variable={v}
                                  changeInput={changeSelect}
                                />
                              )}
                              {v.type === TemplateVariableTypeEnum.Boolean && (
                                <EditorCheckbox
                                  variable={v}
                                  changeCheckbox={changeCheckbox}
                                />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Preview/Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0 relative">
          <div className="w-full h-full overflow-hidden p-4">
            <div className="w-full h-full relative rounded-lg border bg-sidebar bg-editor">
              {/* Format and Resolution Info */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <span className="text-sm font-medium text-gray-700">
                  {artBoard}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {currentWidth}x{currentHeight}
                </span>
              </div>

              {/* Edit/Preview Controls - Bottom Left */}
              <div className="absolute bottom-4 left-4 z-10">
                <div className="flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2">
                  <button
                    onClick={() => setIsEditMode(true)}
                    className={`px-3 py-1 text-sm font-medium transition-colors rounded ${
                      isEditMode
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className={`px-3 py-1 text-sm font-medium transition-colors rounded ${
                      !isEditMode
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              <TransformWrapper
                disabled={isResizing}
                disablePadding={true}
                centerOnInit={true}
                initialScale={1}
                wheel={{ step: 0.1 }}
                minScale={0.1}
                maxScale={3}
              >
                {({
                  zoomIn,
                  zoomOut,
                  setTransform,
                  resetTransform,
                  centerView,
                  zoomToElement,
                }) => (
                  <>
                    {!template?.Result.static && (
                      <EditorPlay playRive={playRive} playing={playing} />
                    )}
                    <EditorZoom
                      zoomIn={zoomIn}
                      zoomOut={zoomOut}
                      setTransform={setTransform}
                      resetTransform={resetTransform}
                      centerView={centerView}
                      zoomToElement={zoomToElement}
                    />
                    <TransformComponent wrapperClass="!w-full !h-full">
                      <div
                        id="MainCanvas"
                        className="h-[1920px] w-[1080px] flex rounded-lg border shadow-md shadow-slate-500/10"
                      >
                        <div className="size-full">
                          {template &&
                            template.Result.modules.length > 0 &&
                            template.Result.modules[0].file &&
                            artBoard && (
                              <RiveComp
                                src={template.Result.modules[0].file}
                                setAssetsParent={setAssets}
                                setRiveStatesParent={setRiveStates}
                                artboard={artBoard}
                                onStateChange={
                                  updateAllVariablesAfterResolutionChange
                                }
                              />
                            )}
                        </div>
                      </div>
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Formats */}
        <div className="w-[280px] bg-white border-l flex flex-col overflow-y-auto">
          <div className="p-4">
            <div className="text-sm font-semibold mb-4">Formats</div>
            {template?.Result.templateCompositions &&
              template.Result.templateCompositions.length > 0 && (
                <AccordionCompositions
                  compositions={template.Result.templateCompositions}
                  setResolutionFunction={changeresolution}
                />
              )}
          </div>
        </div>
      </div>

      {template?.Result &&
        template?.Result.modules.map(module =>
          module.variables.map(variable => (
            <VariableStringSetter
              key={currentHeight + currentWidth + variable.id}
              variable={variable}
              rive={rivesStates[0]}
              onSetFunctionString={setValueFunction => {
                setFunctionsToSetStrings(prev => [
                  { x: variable.id, f: setValueFunction },
                  ...prev,
                ]);
              }}
              onSetFunctionBoolean={setValueFunction => {
                setFunctionsToSetBoolean(prev => [
                  { x: variable.id, f: setValueFunction },
                  ...prev,
                ]);
              }}
              onSetFunctionNumber={setValueFunction => {
                setFunctionsToSetNumbers(prev => [
                  { x: variable.id, f: setValueFunction },
                  ...prev,
                ]);
              }}
            />
          ))
        )}

      {/* CSV Export Dialog */}
      {template?.Result && (
        <EditorCsv
          template={template.Result}
          open={isCsvDialogOpen}
          onOpenChange={setIsCsvDialogOpen}
        />
      )}
    </div>
  );
}

function AccordionCompositions({
  compositions,
  setResolutionFunction,
}: {
  compositions: TemplateComposition[];
  setResolutionFunction: (
    width: number,
    height: number,
    artBoard: string
  ) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {compositions.map((composition, idx) => (
        <div key={composition.id}>
          <button
            className={`w-full flex items-center justify-between rounded border px-3 py-2 text-sm bg-sidebar hover:bg-muted transition-colors ${
              openIndex === idx ? 'font-semibold' : ''
            }`}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            type="button"
          >
            <span>{composition.name}</span>
            <span
              className={`transition-transform ${
                openIndex === idx ? 'rotate-90' : ''
              }`}
            >
              ▶
            </span>
          </button>
          {openIndex === idx && (
            <div className="pl-4 py-2 space-y-1">
              {composition.templateResolutions.map(resolution => (
                <div
                  key={resolution.id}
                  className="cursor-pointer rounded px-2 py-1 hover:bg-accent text-xs flex justify-between items-center"
                  onClick={() =>
                    setResolutionFunction(
                      resolution.width,
                      resolution.height,
                      composition.name
                    )
                  }
                >
                  <span>{resolution.name}</span>
                  <span>
                    {resolution.width}x{resolution.height}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
