import React, { useEffect, useState } from 'react';

interface IPrivateMessage {
  id: string;
  receiver: string;
  sender: string;
  message: string;
  dateAndTime: number | null; // Update the dateAndTime property to allow null values
}

interface Props {
  chatSessions: { [key: string]: IPrivateMessage[] };
  dbCombinedId: string;
}

const UnreadMessagesEmailSender: React.FC<Props> = ({ chatSessions, dbCombinedId }) => {
  const [unreadMessagesToSend, setUnreadMessagesToSend] = useState<IPrivateMessage[]>([]);

  useEffect(() => {
    const currentTime = Date.now();
    const filteredMessages = chatSessions[dbCombinedId]?.filter(message => message.dateAndTime !== null && (currentTime - message.dateAndTime) <= 30000);
    if (filteredMessages && filteredMessages.length > 0) {
      setUnreadMessagesToSend(filteredMessages);
      // Here you can send an email with the unread messages
      // Example: sendEmail(filteredMessages);
    }
  }, [chatSessions, dbCombinedId]);

  // Function to send email with unread messages
  const sendEmail = (messages: IPrivateMessage[]) => {
    // Implement your email sending logic here
  };

  return null; // Replace null with your JSX for the component
};

export default UnreadMessagesEmailSender;
