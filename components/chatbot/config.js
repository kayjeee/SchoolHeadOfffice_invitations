import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  botName: "SchoolHeadOfficeBot",
  initialMessages: [createChatBotMessage(`Hi! How can I help you today?`)],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#376B7E",
    },
    chatButton: {
      backgroundColor: "#5ccc9d",
    },
  },
};

export default config;