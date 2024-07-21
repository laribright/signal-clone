import { FC, ReactNode } from 'react';

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <div className='hidden md:flex md:ml-24 px-2 md:px-0 h-dvh'>
        {children}
      </div>
      <div className='md:hidden my-20 md:px-2'>{children}</div>
    </>
  );
};

export default Layout;
