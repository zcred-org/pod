import type { SVGProps } from 'react';
import IconOkSvg from '@/assets/ok.svg?react';
import IconWarnSvg from '@/assets/warn.svg?react';
import IconErrorSvg from '@/assets/error.svg?react';

export enum IconStatusEnum {
  Ok = 'Ok',
  Error = 'Error',
  Warn = 'Warn',
}

type Props = SVGProps<SVGSVGElement> & {
  status: IconStatusEnum;
};

export function IconStatus({ status, ...props }: Props) {
  return ({
    [IconStatusEnum.Ok]: <IconOkSvg {...props} />,
    [IconStatusEnum.Warn]: <IconWarnSvg {...props} />,
    [IconStatusEnum.Error]: <IconErrorSvg {...props} />,
  })[status];
}
