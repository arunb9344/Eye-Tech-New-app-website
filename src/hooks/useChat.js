import { useState, useEffect } from 'react';
import { db, storage } from '../firebase/config';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useChat = () => {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen to all chat threads (Admin)
  const listenToAllThreads = () => {
    const q = query(collection(db, 'chats'), orderBy('lastMessageTime', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const threadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setThreads(threadsData);
    }, (err) => {
      console.error("Error listening to threads:", err);
      setError(err.message);
    });
  };

  // Listen to messages for a specific chat
  const listenToMessages = (customerId, userRole) => {
    const q = query(
      collection(db, 'chats', customerId, 'messages'), 
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
      
      // Mark as read
      markAsRead(customerId, userRole);
    }, (err) => {
      console.error("Error listening to messages:", err);
      setError(err.message);
    });

    return unsubscribe;
  };

  const markAsRead = async (customerId, userRole) => {
    const fieldToReset = userRole === 'Admin' ? 'unreadAdminCount' : 'unreadCustomerCount';
    try {
      await updateDoc(doc(db, 'chats', customerId), {
        [fieldToReset]: 0
      });
    } catch (err) {
      // Ignore if document doesn't exist yet
    }
  };

  const sendMessage = async ({ 
    customerId, 
    customerName, 
    senderId, 
    senderRole, 
    text, 
    file 
  }) => {
    if (!text && !file) return;
    
    setLoading(true);
    setError(null);

    try {
      let attachmentUrl = null;

      if (file) {
        const fileId = Math.random().toString(36).substring(7);
        const storageRef = ref(storage, `chat_attachments/${customerId}/${fileId}_${file.name}`);
        await uploadBytes(storageRef, file);
        attachmentUrl = await getDownloadURL(storageRef);
      }

      const timestamp = Date.now();
      const messageData = {
        senderId,
        senderRole,
        text: text || '',
        attachmentUrl,
        timestamp
      };

      // 1. Add message
      await addDoc(collection(db, 'chats', customerId, 'messages'), messageData);

      // 2. Update thread summary
      const unreadIncrementField = senderRole === 'Customer' ? 'unreadAdminCount' : 'unreadCustomerCount';
      
      await setDoc(doc(db, 'chats', customerId), {
        customerId,
        customerName,
        lastMessage: text || '📷 Image',
        lastMessageTime: timestamp,
        [unreadIncrementField]: increment(1)
      }, { merge: true });

      // 3. Create Notification Signal
      const recipientRole = senderRole === 'Customer' ? 'Admin' : 'Customer';
      const recipientId = recipientRole === 'Customer' ? customerId : null;

      await addDoc(collection(db, 'notification_signals'), {
        title: `New Message from ${senderRole === 'Customer' ? customerName : 'Eye Tech Admin'}`,
        body: text || '📷 Image attached',
        recipientId,
        recipientRole,
        status: 'pending',
        type: 'chat_message',
        createdAt: serverTimestamp()
      });

      setLoading(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return {
    threads,
    messages,
    loading,
    error,
    listenToAllThreads,
    listenToMessages,
    sendMessage
  };
};
