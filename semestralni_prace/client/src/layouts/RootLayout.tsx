import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const RootLayout = ({ children }: Props) => {
  return <>{children}</>;
};

export default RootLayout;
