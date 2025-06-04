'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileAsset, Rive } from '@rive-app/react-canvas';

import { ApiTemplate } from '@/types/collections';
import RiveComp from '@/components/editor/rive-component';
import {
  GeneratedAnimation,
  GeneratedAnimationStatusEnum,
  GeneratedModule,
} from '@/types/generatedAnimations';
import useTemplatesService from '@/app/services/TemplatesService';

export default function Viewer() {
  const params = useParams<{ id: string }>();

  const [template, setTemplate] = useState<ApiTemplate | undefined>(undefined);
  const [generatedAnimation, setGeneratedAnimation] = useState<
    GeneratedAnimation | undefined
  >(undefined);

  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const [rivesStates, setRiveStates] = useState<Rive[]>([]);

  const { get } = useTemplatesService();
  async function initializeTemplate() {
    const template = await get(params.id);
    setTemplate(template);
    if (template) {
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
      const mainCan: any = document.querySelector('#MainCanvas');
      if (mainCan) {
        mainCan.style.width = window.innerWidth + 'px';
        mainCan.style.height = window.innerHeight + 'px';
      }
    }
  }

  useEffect(() => {
    initializeTemplate();
  }, []);

  return (
    <>
      <div className="h-full w-full" id="MainCanvas">
        {template &&
          template.Result.modules.length > 0 &&
          template.Result.modules[0].file && (
            <RiveComp
              src={template.Result.modules[0].file}
              setAssetsParent={setAssets}
              setRiveStatesParent={setRiveStates}
            />
          )}
      </div>
    </>
  );
}
