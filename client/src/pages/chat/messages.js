import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import styles from './styles.module.css';

const Messages = ({ socket }) => {
  const messagesColumnRef = useRef(null);
  const [searchParams] = useSearchParams();
  const room = searchParams.get('room');

  const [messagesReceived, setMessagesReceived] = useState([]);


  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessagesReceived((state) => [
        ...state,
        {
          message: data.message,
          username: data.username,
          createdAt: data.createdAt,
        },
      ]);
    });

    return () => socket.off('receive_message');
  }, [socket]);

  useEffect(() => {
    socket.on('last_100_messages', (last100Messages) => {
      last100Messages = sortMessagesByDate(last100Messages);
      setMessagesReceived([...last100Messages]);
    });

    return () => socket.off('last_100_messages');
  }, [socket]);

  useEffect(() => {
    socket.emit('get_chat_room_info', { room });
  }, []);

  // Scroll to the most recent message
  useEffect(() => {
    messagesColumnRef.current.scrollTop =
      messagesColumnRef.current.scrollHeight;
  }, [messagesReceived]);

  function sortMessagesByDate(messages) {
    return messages.sort(
      (a, b) => parseInt(a.createdAt) - parseInt(b.createdAt)
    );
  }

  // dd/mm/yyyy, hh:mm:ss
  function formatDateFromTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  return (
    // Add ref to this div
    <div className={styles.messagesColumn} ref={messagesColumnRef}>
      {messagesReceived.map((msg, i) => (
        <div className={styles.message} key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className={styles.msgMeta}>{msg.username}</span>
            <span className={styles.msgMeta}>
              {formatDateFromTimestamp(msg.createdAt)}
            </span>
          </div>
          <p className={styles.msgText}>{msg.message}</p>
          <br />
        </div>
      ))}
    </div>
  );
};

export default Messages;