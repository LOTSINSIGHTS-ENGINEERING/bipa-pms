import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import User from '../../../../shared/models/User';
import './UserDisplay.scss';
import { IPrivateMessage } from '../../../../shared/models/three-sixty-feedback-models/messages/MessagesModel';
import LastMessage from '../LastMessage/LastMessage';

interface UserDisplayProps {
  users: { value: string; label: string }[];
  handleSelectedUserClick: (selectedUserId: string) => Promise<void>;
  receiver: string;
  allUsers: User[];
  chatSessions: { [key: string]: IPrivateMessage[] };
}

const UserDisplay: React.FC<UserDisplayProps> = observer(({ users, handleSelectedUserClick, receiver, allUsers, chatSessions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [notificationCounts, setNotificationCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (selectedUser) {
      handleSelectedUserClick(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    const newNotificationCounts: { [key: string]: number } = {};
    users.forEach(user => {
      const combinedId = getCombinedId(user.value);
      const lastMessage = getLastMessage(combinedId);
      const unreadCount = getUnreadMessageCount(combinedId, lastMessage);
      newNotificationCounts[combinedId] = unreadCount;
    });
    setNotificationCounts(newNotificationCounts);
  }, [users, chatSessions]);

  const filteredUsers = users.filter(user =>
    user.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop += event.deltaY;
    }
  };

  const getCombinedId = (userId: string) => {
    return [userId, receiver].sort().join("");
  };

  const getLastMessage = (combinedId: string) => {
    const messages = chatSessions[combinedId] || [];
    return messages[messages.length - 1];
  };

  const getUnreadMessageCount = (combinedId: string, lastMessage: IPrivateMessage | null) => {
    const messages = chatSessions[combinedId] || [];
    const unreadMessages = messages.filter((message) => !message.read && message.receiver === receiver);
    if (lastMessage && unreadMessages.some(message => message.id === lastMessage.id)) {
      return unreadMessages.length - 1;
    }
    return unreadMessages.length;
  };

  const handleUpdateLastMessage = (combinedId: string, lastMessage: IPrivateMessage) => {
    const newNotificationCounts = { ...notificationCounts };
    const unreadCount = getUnreadMessageCount(combinedId, lastMessage);
    newNotificationCounts[combinedId] = unreadCount;
    setNotificationCounts(newNotificationCounts);
  };

  return (
    <div className="user-display-container">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="user-scrollview" onWheel={handleScroll} ref={scrollRef}>
        {filteredUsers.map(user => {
          const combinedId = getCombinedId(user.value);
          const unreadCount = notificationCounts[combinedId] || 0;
          return (
            <div
              key={user.value}
              className={`user-box ${receiver === user.value ? 'selected' : ''}`}
              onClick={() => setSelectedUser(user.value)}
            >
              <div className="user-initials">{user.label.substring(0, 2)}</div>
              <div className="user-info">
                <p className="user-name">{user.label}</p>
                <p className="user-role">{allUsers.find(u => u.asJson.uid === user.value)?.asJson.role}</p>
                {/* <LastMessage userId={user.value} combinedId={combinedId} chatSessions={chatSessions} onUpdateLastMessage={handleUpdateLastMessage} /> */}
              </div>
              {unreadCount > 0 && (
                <div className="unread-count">
                  <span>{unreadCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default UserDisplay;
