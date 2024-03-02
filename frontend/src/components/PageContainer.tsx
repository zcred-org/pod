import { type FC, PropsWithChildren } from 'react';

export const PageContainer: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex flex-col sm:self-center sm:min-w-[30rem] px-4 gap-3 my-10">
    {children}
  </div>
);
