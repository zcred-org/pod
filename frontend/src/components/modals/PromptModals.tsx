/* eslint-disable @typescript-eslint/no-explicit-any,react-refresh/only-export-components */
import { Button, type ButtonProps, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { signal } from '@preact/signals-react';
import type { ReactNode } from 'react';
import type { SetOptional } from 'type-fest';
import { getId } from '@/util/independent/id.ts';


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
  isNoClosable?: boolean;
  actions: Action[];
  resolve: (action: Action) => void;
}

type PromptNew<
  Value extends string = string,
  Action extends TAction<Value> = TAction<Value>
> = Omit<SetOptional<Prompt<Value, Action>, 'id'>, 'resolve'>;

const prompts = signal<Prompt[]>([]);

export const promptModal = async <
  Value extends string,
  Action extends TAction<Value>,
  IsUnrejectable extends boolean = false,
>(promptNew: PromptNew<Value, Action> & { isNoClosable?: IsUnrejectable }): Promise<
  (Action extends object ? Action['value'] : Action)
  | (IsUnrejectable extends true ? never : 'Cancel')
> => {
  return new Promise((resolve) => prompts.value = [...prompts.value, {
    ...promptNew,
    id: getId(),
    resolve: resolve as any,
  }]);
};

const onClose = (prompt: Prompt, action: string) => {
  prompts.value = prompts.value.filter((a) => a.id !== prompt.id);
  prompt.resolve(action);
};

export function PromptModals(): ReactNode {
  return <>{prompts.value.map((prompt) => (
    <Modal
      isOpen
      hideCloseButton={prompt.isNoClosable}
      backdrop="blur"
      placement="center"
      key={prompt.id}
      onClose={prompt.isNoClosable ? undefined : () => onClose(prompt, 'Cancel')}
    >
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
