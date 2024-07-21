'use client';

import { Id } from '../../../../convex/_generated/dataModel';

import { NavigationBar } from '@/components/navigation-bar';
import { ChatContent } from '@/components/chat-content';
import { NewGroup } from '@/components/new-group';

const ChatId = ({
  params: { chatId },
}: {
  params: { chatId: Id<'conversations'> };
}) => {
  return (
    <>
      <div className='hidden md:block'>
        <NavigationBar trigger={<NewGroup />} />
      </div>
      <ChatContent chatId={chatId} />
    </>
  );
};

export default ChatId;
