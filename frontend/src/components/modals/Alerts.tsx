/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SetOptional } from 'type-fest';
import type { FC, ReactNode } from 'react';
import { Button, type ButtonProps, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';

type TAction<Action extends string = string> = Action | {
  label?: string;
  value: Action;
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
}

type Alert<
  Value extends string = string,
  Action extends TAction<Value> = TAction<Value>
> = {
  id: string;
  title?: ReactNode;
  text: ReactNode;
  actions: Action[];
  resolve: (action: Action) => void;
}

type AlertNew<
  Value extends string = string,
  Action extends TAction<Value> = TAction<Value>
> = Omit<SetOptional<Alert<Value, Action>, 'id'>, 'resolve'>;

type State = {
  alerts: Alert[],
}

const useAlertStore = create<State>()(devtools((_) => ({
  alerts: [],
}), { name: 'app', store: 'alert-store' }));

export const alert = async <
  Value extends string = string,
  Action extends TAction<Value> = TAction<Value>
>(alert: AlertNew<Value, Action>) => {
  const id = Math.random().toString(36).substring(7);
  return new Promise<(Action extends object ? Action['value'] : Action) | 'Cancel'>((resolve) => {
    useAlertStore.setState((state) => ({ alerts: [...state.alerts, { ...alert, id, resolve: resolve as any }] }));
  });
};

export const Alerts: FC = () => {
  const alerts = useAlertStore((state) => state.alerts);
  const close = (alert: Alert, action: string) => {
    useAlertStore.setState((state) => ({ alerts: state.alerts.filter((a) => a.id !== alert.id) }));
    alert.resolve(action);
  };

  return (
    alerts.map((alert) => (
      <Modal isOpen placement="center" key={alert.id} onClose={() => close(alert, 'Cancel')}>
        <ModalContent>
          <ModalHeader>
            {alert.title || 'Alert'}
          </ModalHeader>
          <ModalBody>
            {alert.text}
          </ModalBody>
          <ModalFooter>
            {alert.actions.map((btn) => {
              const action = typeof btn === 'string' ? { value: btn } : btn;
              action.label ??= action.value;
              return <Button
                key={action.value}
                onClick={() => close(alert, action.value)}
                variant={action.variant}
                color={action.color}
              >{action.label}</Button>;
            })}
          </ModalFooter>
        </ModalContent>
      </Modal>
    ))
  );
};
