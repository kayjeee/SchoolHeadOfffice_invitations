// components/ChatModal.js
import Modal from './Modal';
import Chatbot from 'react-chatbot-kit';
import config from '../../chatbot/config';
import MessageParser from '../../chatbot/MessageParser';
import ActionProvider from '../../chatbot/ActionProvider';

const ChatModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <Chatbot config={config} messageParser={MessageParser} actionProvider={ActionProvider} />
  </Modal>
);

export default ChatModal;
