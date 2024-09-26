import { Eye, EyeOff } from 'lucide-react';
import type { SVGAttributes } from 'react';


type IconVisibilityProps = SVGAttributes<SVGElement> & {
  isVisible: boolean;
}

export function IconVisibility({ isVisible, ...props }: IconVisibilityProps) {
  return isVisible ? <EyeOff {...props} /> : <Eye {...props} />;
}
