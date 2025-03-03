import React, { useEffect, useState } from 'react';
import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

import './OnlineStatusIndicator.scss';
import { firestore } from '../../../shared/config/firebase-config';

interface OnlineStatusIndicatorProps {
  userId: string;
}

const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({ userId }) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const presenceDocRef = doc(firestore, 'presence', userId);

    // Set user's online status to true when component mounts
    setDoc(presenceDocRef, { online: true })
      .then(() => console.log('User online status set to true'))
      .catch(error => console.error('Error setting user online status:', error));

    // Listen for changes in the user's online status
    const unsubscribe = onSnapshot(presenceDocRef, (docSnapshot) => {
      const userData = docSnapshot.data();
      if (userData) {
        setIsOnline(userData.online || false);
      } else {
        console.warn('User presence data not found for userId:', userId);
      }
    }, (error) => console.error('Error listening to user presence changes:', error));

    // Set user's online status to false when component unmounts
    return () => {
      deleteDoc(presenceDocRef)
        .then(() => console.log('User online status deleted'))
        .catch(error => console.error('Error deleting user online status:', error));
      unsubscribe();
    };
  }, [userId]);

  return (
    <div
      className={`online-dot ${isOnline ? 'online' : 'offline'}`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

export default OnlineStatusIndicator;
