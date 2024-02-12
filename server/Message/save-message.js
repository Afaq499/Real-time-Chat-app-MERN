const Message = require('../modal/message');

const SaveMessage = ({ message, username, room }) => {
  // Create a new message
  const newMessage = new Message({
    message,
    username,
    room
  });

  // Save the message to the database
  newMessage.save()
    .then(message => console.log('Message saved:', message))
    .catch(err => console.error('Error saving message:', err));
}

module.exports = SaveMessage;
