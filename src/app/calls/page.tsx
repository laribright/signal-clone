'use client';

import { NavigationBar } from '@/components/navigation-bar';
import { NewGroup } from '@/components/new-group';
import { CallContent } from '@/components/call-content';

const Calls = () => {
  return (
    <>
      <NavigationBar trigger={<NewGroup />} />
      <CallContent />
    </>
  );
};

export default Calls;
