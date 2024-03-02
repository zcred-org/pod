import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { create } from 'zustand';
import { type ChangeEventHandler, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { type RequireAtLeastOne } from 'type-fest';

type EnabledFields = RequireAtLeastOne<{ from?: boolean, to?: boolean }>;
type DateInterval = {
  from?: Date;
  to?: Date;
}
type Resolve = (value: DateInterval) => void;
type Reject = (reason?: Error) => void;

type State = {
  enabledFields: EnabledFields;
  resolve: Resolve | null;
  reject: Reject | null;
}

type Actions = {
  open: (args: { enabledFields: EnabledFields, resolve: Resolve, reject: Reject }) => void;
  close: () => void;
}

const initialState: State = {
  enabledFields: { from: true, to: true },
  resolve: null,
  reject: null,
};

const useModalStore = create<State & Actions>()(set => ({
  ...initialState,
  open: (args) => set(args),
  close: () => set(initialState),
}));

export const CredentialValidIntervalModal = () => {
  const { resolve, reject, enabledFields } = useModalStore();
  const [state, setState] = useState({ from: '', to: '' });

  useEffect(() => setState({ from: '', to: '' }), [resolve]);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setState({ ...state, [e.currentTarget.name]: e.target.value });
  };

  if (!enabledFields.to && !enabledFields.from) {
    throw new Error('At least one field must be enabled for CredentialValidIntervalModal');
  }

  const title = enabledFields.to && enabledFields.from
    ? 'Set Credential Valid Interval'
    : enabledFields.to
      ? 'Set Credential Valid To'
      : enabledFields.from
        ? 'Set Credential Valid From'
        : '';
  const description = enabledFields.to && enabledFields.from
    ? 'Select interval when credential will be valid:'
    : enabledFields.from
      ? 'Select date when credential starts to be valid:'
      : enabledFields.to
        ? 'Select date when credential becames invalid:'
        : '';
  const onCancel = () => reject!(new Error('Cancelled'));
  const onSubmit = () => {
    const from = enabledFields.from ? dayjs(state.from).toDate() : undefined;
    const to = enabledFields.to ? dayjs(state.to).toDate() : undefined;
    resolve!({ from, to } as DateInterval);
  };

  return (
    <Modal isOpen={!!resolve} backdrop="blur" onClose={onCancel} placement="center">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p>{description}</p>
          {enabledFields.from ? <Input
            name="from"
            label="From"
            type="date"
            value={state.from}
            onChange={onChange}
            isRequired={enabledFields.from}
            isClearable
            labelPlacement="outside"
            onClear={() => setState({ ...state, from: '' })}
          /> : null}
          {enabledFields.to ? <Input
            name="to"
            label="To"
            type="date"
            value={state.to}
            onChange={onChange}
            isRequired={enabledFields.to}
            isClearable
            labelPlacement="outside"
            onClear={() => setState({ ...state, to: '' })}
          /> : null}
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={onCancel}
            color="danger"
            variant="light"
          >Cancel</Button>
          <Button
            onClick={onSubmit}
            color="success"
          >Confirm</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

CredentialValidIntervalModal.open = async (
  enabledFields: EnabledFields,
): Promise<DateInterval> => {
  return new Promise((resolve, reject) => {
    useModalStore.getState().open({
      enabledFields,
      resolve: value => {
        resolve(value);
        useModalStore.getState().close();
      },
      reject: reason => {
        reject(reason);
        useModalStore.getState().close();
      },
    });
  });
};
CredentialValidIntervalModal.close = () => useModalStore.getState().close();
