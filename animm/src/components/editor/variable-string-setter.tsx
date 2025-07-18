'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileAsset, decodeImage, Rive } from '@rive-app/react-canvas';
import {
  useRive,
  useViewModel,
  useViewModelInstanceString,
  useViewModelInstance,
  useViewModelInstanceNumber,
  useViewModelInstanceBoolean,
} from '@rive-app/react-canvas';
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
} from '@/types/collections';
import { ChevronDown, LinkIcon, Loader2 } from 'lucide-react';
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

export function VariableStringSetter({
  variable,
  rive,
  onSetFunctionString,
  onSetFunctionBoolean,
  onSetFunctionNumber,
}: {
  variable: TemplateVariable;
  rive: Rive;
  onSetFunctionString: (setValueFunction: (value: string) => void) => void;
  onSetFunctionBoolean: (setValueFunction: (value: boolean) => void) => void;
  onSetFunctionNumber: (setValueFunction: (value: number) => void) => void;
}) {
  const { setValue: setValueFunctionString } = useViewModelInstanceString(
    variable.value,
    rive?.viewModelInstance
  );
  useEffect(() => {
    if (
      onSetFunctionString &&
      setValueFunctionString &&
      variable.type == TemplateVariableTypeEnum.TextArea
    ) {
      onSetFunctionString(setValueFunctionString);
    }
  }, [setValueFunctionString]);

  const { setValue: setValueFunctionBoolean } = useViewModelInstanceBoolean(
    variable.value,
    rive?.viewModelInstance
  );
  useEffect(() => {
    if (
      onSetFunctionBoolean &&
      variable.type == TemplateVariableTypeEnum.Boolean
    ) {
      onSetFunctionBoolean(setValueFunctionBoolean);
    }
  }, [setValueFunctionBoolean]);

  const { setValue: setValueFunctionNumber } = useViewModelInstanceNumber(
    variable.value,
    rive?.viewModelInstance
  );
  useEffect(() => {
    if (
      onSetFunctionNumber &&
      variable.type == TemplateVariableTypeEnum.Selector
    ) {
      onSetFunctionNumber(setValueFunctionNumber);
    }
  }, [setValueFunctionNumber]);
  return null;
}
