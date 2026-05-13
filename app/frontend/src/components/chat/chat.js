// Chat Component Initialization
import { sendChatMessage } from '../../api/chat.api.js';

export function initChat() {
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const messagesContainer = document.getElementById('chat-messages');
  const startChatBtn = document.getElementById('start-chat');
  
  if (!chatInput) return;
  
  // Send message on button click
  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }
  
  // Send on Enter (Shift+Enter for newline)
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  
  // Auto-resize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
  });
  
  // Handle start chat button
  if (startChatBtn) {
    startChatBtn.addEventListener('click', () => {
      window.navigateTo('chat');
    });
  }
  
  async function handleSend() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
      const response = await sendChatMessage(message);
      removeTypingIndicator();
      
      if (response.message) {
        addMessage('assistant', response.message);
      }
    } catch (error) {
      removeTypingIndicator();
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  }
  
  function addMessage(role, content) {
    if (!messagesContainer) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}`;
    messageEl.textContent = content;
    
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  function showTypingIndicator() {
    if (!messagesContainer) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'chat-message assistant typing';
    indicator.innerHTML = '<span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span>';
    
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  function removeTypingIndicator() {
    const indicator = messagesContainer?.querySelector('.typing');
    if (indicator) indicator.remove();
  }
}

window.initChat = initChat;