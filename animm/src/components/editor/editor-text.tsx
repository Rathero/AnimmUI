import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  ChangeEvent,
} from 'react';
import { Textarea } from '../ui/textarea';

export function EditorText(props: {
  variable: {
    path: string | undefined;
    name: string | undefined;
    defaultValue: string | number | readonly string[] | undefined;
  };
  changeText: (
    arg0: ChangeEvent<HTMLTextAreaElement>,
    arg1: number,
    arg2: number
  ) => void;
  moduleId: number;
  moduleType: number;
}) {
  return (
    <div className="grid w-full gap-1.5">
      <label
        className="text-sm text-sidebar-foreground"
        htmlFor={props.variable.path}
      >
        {props.variable.name}
      </label>
      <Textarea
        id={props.variable.path}
        defaultValue={props.variable.defaultValue}
        onChange={e => props.changeText(e, props.moduleId, props.moduleType)}
      />
    </div>
  );
}
