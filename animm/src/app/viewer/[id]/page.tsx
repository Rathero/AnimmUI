'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileAsset, Rive } from '@rive-app/react-canvas';

import {
  ApiTemplate,
  TemplateVariable,
  TemplateVariableTypeEnum,
} from '@/types/collections';
import RiveComp from '@/components/editor/rive-component';
import useTemplatesService from '@/app/services/TemplatesService';

export default function Viewer() {
  const params = useParams<{ id: string }>();

  const [template, setTemplate] = useState<ApiTemplate | undefined>(undefined);

  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const [rivesStates, setRiveStates] = useState<Rive[]>([]);

  const { get } = useTemplatesService();
  async function initializeTemplate() {
    const template = await get(params.id);
    setTemplate(template);
  }
  async function changeText(text: string, variableToModify: TemplateVariable) {
    if (rivesStates) {
      rivesStates.forEach(riveState => {
        if (riveState) {
          text = text === '' ? ' ' : text;
          if (variableToModify.paths.length > 0) {
            variableToModify.paths.map(path => {
              riveState!.setTextRunValueAtPath(
                variableToModify.value,
                text,
                path.path
              );
            });
          } else riveState.setTextRunValue(variableToModify.value, text);
        }
      });
      variableToModify.defaultValue = text;
      setTemplate(template);
    }
  }

  useEffect(() => {
    initializeTemplate();
  }, []);

  useEffect(() => {
    if (template && rivesStates && rivesStates.length > 0) {
      const mainCan: any = document.querySelector('#MainCanvas');
      if (mainCan) {
        mainCan.style.width = window.innerWidth + 'px';
        mainCan.style.height = window.innerHeight + 'px';
      }

      const queryString =
        typeof window !== 'undefined' ? window.location.search : '';
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        const variableToModify = template.Result.modules
          .flatMap(module => module.variables)
          .find(variable => variable.name === key);
        if (variableToModify) {
          if (variableToModify.type === TemplateVariableTypeEnum.TextArea) {
            changeText(value, variableToModify);
          }
        }
      });
    }
  }, [template, rivesStates]);

  const queryString =
    typeof window !== 'undefined' ? window.location.search : '';
  const urlParams = new URLSearchParams(queryString);
  const shouldAutoplay = urlParams.get('autoplay') === 'true';

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
              autoplay={shouldAutoplay}
            />
          )}
      </div>
    </>
  );
}
