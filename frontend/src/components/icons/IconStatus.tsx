import type { SVGProps } from 'react';
import IconErrorSvg from '@/assets/error.svg?react';
import IconOkSvg from '@/assets/ok.svg?react';
import IconWarnSvg from '@/assets/warn.svg?react';
import { IconStatusEnum } from '@/types/icon-status.enum.ts';


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
