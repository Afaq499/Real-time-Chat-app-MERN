const Message = require('../modal/message');

const GetMessages = async (room) => {
  const last100Messages = await Message.find({ room });
  console.log('last100Messages => ', last100Messages);
  return last100Messages;
}

module.exports = GetMessages;
