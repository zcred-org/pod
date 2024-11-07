import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { batch, signal } from '@preact/signals-react';
import dayjs from 'dayjs';
import { type ChangeEventHandler, type ReactNode } from 'react';
import type { DateInterval, DateIntervalRequiredFields } from '@/types/date-interval.ts';
import { RejectedByUserError } from '@/util/errors.ts';

const request = signal<undefined | {
  title: string;
  enabledFields: DateIntervalRequiredFields;
  resolve: (value: DateInterval) => void;
  reject: (reason?: Error) => void;
}>(undefined);
const from = signal('');
const to = signal('');
const fromError = signal<string | undefined>(undefined);
const toError = signal<string | undefined>(undefined);

request.subscribe(() => batch(() => {
  from.value = '';
  to.value = '';
  fromError.value = undefined;
  toError.value = undefined;
}));

const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
  ({ from: fromError, to: toError })[e.currentTarget.name]!.value = undefined;
  ({ from, to })[e.currentTarget.name]!.value = e.currentTarget.value;
};

const onSubmit = () => {
  const isFromRequired = request.peek()?.enabledFields.from;
  const fromParsed = isFromRequired ? dayjs(from.peek()) : undefined;
  if (fromParsed?.isValid() === false) fromError.value = 'Invalid date';

  const isToRequired = request.peek()?.enabledFields.to;
  const toParsed = isToRequired ? dayjs(to.peek()) : undefined;
  if (toParsed?.isValid() === false) toError.value = 'Invalid date';

  if (fromError.peek() || toError.peek()) return;

  if (isFromRequired && isToRequired
    && (fromParsed!.isAfter(toParsed!) || fromParsed!.isSame(toParsed!))) {
    fromError.value = `Must be before "To date"`;
    toError.value = 'Must be after "From date"';
  }

  if (fromError.peek() || toError.peek()) return;

  request.peek()!.resolve({
    from: fromParsed?.toDate(),
    to: toParsed?.toDate(),
  });
};

const onCancel = () => request.peek()!.reject(new RejectedByUserError());

export function CredentialValidIntervalModal(): ReactNode {
  const { enabledFields, title } = request.value || {};

  return (
    <Modal isOpen={!!enabledFields} backdrop="blur" placement="center" hideCloseButton>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          {enabledFields?.from ? <Input
            name="from"
            label="Valid From"
            type="date"
            value={from as unknown as typeof from.value}
            onChange={onChange}
            isRequired={enabledFields?.from}
            isClearable
            labelPlacement="outside"
            onClear={() => from.value = ''}
            errorMessage={fromError}
            color={fromError.value ? 'danger' : undefined}
            onFocus={() => fromError.value = undefined}
          /> : null}
          {enabledFields?.to ? <Input
            name="to"
            label="Valid Until"
            type="date"
            value={to as unknown as typeof to.value}
            onChange={onChange}
            isRequired={enabledFields?.to}
            isClearable
            labelPlacement="outside"
            onClear={() => to.value = ''}
            errorMessage={toError}
            color={toError.value ? 'danger' : undefined}
            onFocus={() => toError.value = undefined}
          /> : null}
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={onCancel}
            color="danger"
            variant="light"
            size="sm"
          >Cancel</Button>
          <Button
            onClick={onSubmit}
            color="success"
            size="sm"
          >Confirm</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

CredentialValidIntervalModal.open = async (
  enabledFields: DateIntervalRequiredFields,
): Promise<DateInterval | undefined> => new Promise((resolve, reject) => {
  if (!enabledFields.to && !enabledFields.from) {
    resolve(undefined);
    return;
  }
  request.value = {
    title: enabledFields.to && enabledFields.from
      ? 'Credential Valid Interval'
      : enabledFields.from
        ? 'Credential Valid From'
        : enabledFields.to
          ? 'Credential Valid Until'
          : '',
    enabledFields,
    resolve: value => {
      resolve(value);
      request.value = undefined;
    },
    reject: reason => {
      reject(reason);
      request.value = undefined;
    },
  };
});

CredentialValidIntervalModal.close = () => {
  request.value = undefined;
};
