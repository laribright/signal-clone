'use client';

import { FC } from 'react';

import { NavigationBar } from '@/components/navigation-bar';
import { MeetingRoom } from '@/components/meeting-room';

const Room: FC<{ params: { room: string } }> = ({ params: { room } }) => {
  return (
    <>
      <NavigationBar trigger={null} />
      <MeetingRoom chatId={room} />
    </>
  );
};

export default Room;
