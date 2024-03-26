/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, type ButtonProps, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { signal } from '@preact/signals-react';
import type { ReactNode } from 'react';
import type { SetOptional } from 'type-fest';

type TAction<Action extends string = string> = Action | {
  label?: string;
  value: Action;
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
}

type Prompt<
  Value extends string = string,
  Action extends TAction<Value> = TAction<Value>
> = {
  id: string;
  title?: ReactNode;
  text: ReactNode;
  actions: Action[];
  resolve: (action: Action) => void;
}

type PromptNew<
  Value extends string = string,
  Action extends TAction<Value> = TAction<Value>
> = Omit<SetOptional<Prompt<Value, Action>, 'id'>, 'resolve'>;

const prompts = signal<Prompt[]>([]);

export const prompt = async <
  Value extends string = string,
  Action extends TAction<Value> = TAction<Value>
>(prompt: PromptNew<Value, Action>) => {
  const id = Math.random().toString(36).substring(7);
  return new Promise<(Action extends object ? Action['value'] : Action) | 'Cancel'>((resolve) => {
    prompts.value = [...prompts.value, { ...prompt, id, resolve: resolve as any }];
  });
};

const onClose = (prompt: Prompt, action: string) => {
  prompts.value = prompts.value.filter((a) => a.id !== prompt.id);
  prompt.resolve(action);
};

export function PromptModals(): ReactNode {
  return <>{prompts.value.map((prompt) => (
    <Modal isOpen placement="center" key={prompt.id} onClose={() => onClose(prompt, 'Cancel')}>
      <ModalContent>
        <ModalHeader>
          {prompt.title || 'Prompt'}
        </ModalHeader>
        <ModalBody>
          {prompt.text}
        </ModalBody>
        <ModalFooter>
          {prompt.actions.map((btn) => {
            const action = typeof btn === 'string' ? { value: btn } : btn;
            action.label ??= action.value;
            return <Button
              key={action.value}
              onClick={() => onClose(prompt, action.value)}
              variant={action.variant}
              color={action.color}
            >{action.label}</Button>;
          })}
        </ModalFooter>
      </ModalContent>
    </Modal>
  ))}</>;
}
