import React from 'react';

import { SidebarContainer } from '@/components/sidebar-container';
import { ChatList } from '@/components/chat-list';
import { NewGroup } from '@/components/new-group';

const ChatSidebar = () => {
  return (
    <SidebarContainer title='Chats' trigger={<NewGroup />}>
      <ChatList />
    </SidebarContainer>
  );
};

export default ChatSidebar;
