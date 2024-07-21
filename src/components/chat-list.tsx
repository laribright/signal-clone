import { useQuery } from 'convex/react';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { api } from '../../convex/_generated/api';

import { ChatListItem } from '@/components/chat-list-item';

export const ChatList: FC = () => {
  const pathName = usePathname();
  const chatId = pathName.split('/').pop();

  const conversations = useQuery(api.conversations.get);

  const groupMessages = conversations?.filter(msg => msg.conversation.isGroup);

  const directMessages = conversations?.filter(
    msg => !msg.conversation.isGroup
  );

  const hasConversations =
    (groupMessages && groupMessages.length > 0) ||
    (directMessages && directMessages.length > 0);

  return (
    <div className='flex flex-col space-y-2'>
      {!hasConversations ? (
        <div className='text-center text-gray-500'>No conversations yet</div>
      ) : (
        <>
          {directMessages && directMessages.length > 0
            ? directMessages.map(
                ({ conversation, otherMember, unseenCount, lastMessage }) => (
                  <ChatListItem
                    key={conversation._id}
                    name={otherMember?.username || ''}
                    lastMessageContent={lastMessage?.lastMessageContent || ''}
                    avatarUrl={otherMember?.imageUrl || ''}
                    chatId={conversation._id}
                    isActive={chatId === conversation._id}
                    lastMessageSender={lastMessage?.lastMessageSender}
                    timestamp={lastMessage?.lastMessageTimestamp}
                    unseenMessageCount={unseenCount}
                  />
                )
              )
            : null}
          {groupMessages && groupMessages.length > 0
            ? groupMessages.map(
                ({ conversation, unseenCount, lastMessage, otherMember }) => (
                  <ChatListItem
                    key={conversation._id}
                    name={conversation.name || ''}
                    lastMessageContent={lastMessage?.lastMessageContent || ''}
                    avatarUrl={''}
                    chatId={conversation._id}
                    isActive={chatId === conversation._id}
                    lastMessageSender={lastMessage?.lastMessageSender}
                    timestamp={lastMessage?.lastMessageTimestamp}
                    unseenMessageCount={unseenCount}
                  />
                )
              )
            : null}
        </>
      )}
    </div>
  );
};
