import React, { useEffect, useState } from 'react';
import { IPrivateMessage } from '../../../shared/models/three-sixty-feedback-models/messages/MessagesModel';


interface LastMessageProps {
  userId: string;
  combinedId: string;
  chatSessions: { [key: string]: IPrivateMessage[] };
}

const LastMessage: React.FC<LastMessageProps> = ({ userId, combinedId, chatSessions }) => {
  const [lastMessage, setLastMessage] = useState<string>('');
  console.log("chat sessions", chatSessions)

  useEffect(() => {
    console.log(`Fetching last message for userId: ${userId}, combinedId: ${combinedId}`);
    // const messages = chatSessions[combinedId];
    const messages = chatSessions["619LDAKFzIS1H03XAPALvzrv6mF2n4mGEapo6zS89eHbfnUk7JUMPQt1"] || [];

    console.log("messages ",messages)
    if (messages && messages.length > 0) {
      const lastMessageText = messages[messages.length - 1].message;
      console.log(`Last message for ${userId}: ${lastMessageText}`);
      setLastMessage(lastMessageText);
    } else {
      setLastMessage('');
    }
  }, [chatSessions, userId, combinedId]);

  return <p className="last-message">{lastMessage}</p>;
};

export default LastMessage;
