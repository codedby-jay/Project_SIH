// Crop Recommendation System - JavaScript

// Global variables

// Add typing animation effect
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.innerHTML = '';
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

// Add particle effect on button click
function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.background = '#27ae60';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    
    // Generate random movement
    const randomX = Math.random() * 200 - 100;
    const randomY = Math.random() * 200 - 100;
    particle.style.setProperty('--random-x', randomX + 'px');
    particle.style.setProperty('--random-y', randomY + 'px');
    particle.style.animation = 'particleFloat 1s ease-out forwards';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 1000);
  }
}

// Check server status
async function checkServerStatus() {
  try {
    const response = await fetch("http://127.0.0.1:5000/health", { timeout: 3000 });
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running');
    return false;
  }
  return false;
}

// Main crop recommendation function
async function getCrop() {
  console.log('getCrop function called');
  
  const form = document.getElementById('cropForm');
  const submitBtn = document.querySelector('.btn-primary');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  
  console.log('Elements found:', {
    form: !!form,
    submitBtn: !!submitBtn,
    loading: !!loading,
    result: !!result
  });
  
  // Get form inputs
  const inputs = {
    N: document.getElementById('N'),
    P: document.getElementById('P'),
    K: document.getElementById('K'),
    temp: document.getElementById('temp'),
    humidity: document.getElementById('humidity'),
    ph: document.getElementById('ph'),
    rain: document.getElementById('rain')
  };

  console.log('Input elements:', inputs);
  console.log('Input values:', {
    N: inputs.N?.value,
    P: inputs.P?.value,
    K: inputs.K?.value,
    temp: inputs.temp?.value,
    humidity: inputs.humidity?.value,
    ph: inputs.ph?.value,
    rain: inputs.rain?.value
  });

  // Validate all inputs are filled
  let isValid = true;
  for (const [key, input] of Object.entries(inputs)) {
    if (!input) {
      console.error(`Input element ${key} not found`);
      isValid = false;
      continue;
    }
    
    if (!input.value || input.value === '') {
      input.classList.add('invalid');
      showInputError(input, 'This field is required');
      isValid = false;
      console.log(`${key} is empty`);
    } else {
      input.classList.remove('invalid');
      hideInputError(input);
    }
  }

  if (!isValid) {
    console.log('Form validation failed');
    if (submitBtn) {
      submitBtn.classList.add('shake');
      setTimeout(() => submitBtn.classList.remove('shake'), 500);
    }
    return;
  }

  console.log('Form validation passed, proceeding with API call');

  // Add particle effect on button click
  if (submitBtn) {
    const rect = submitBtn.getBoundingClientRect();
    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Analyzing...</span>';
  }
  if (loading) {
    loading.classList.add('show');
  }
  if (result) {
    result.classList.remove('show');
  }
  
  try {
    // Prepare data for API
    const formData = {
      N: parseFloat(inputs.N.value),
      P: parseFloat(inputs.P.value),
      K: parseFloat(inputs.K.value),
      temperature: parseFloat(inputs.temp.value),
      humidity: parseFloat(inputs.humidity.value),
      ph: parseFloat(inputs.ph.value),
      rainfall: parseFloat(inputs.rain.value)
    };

    console.log('Sending data:', formData);

    // Check server status first
    const serverRunning = await checkServerStatus();
    console.log('Server running:', serverRunning);
    
    if (!serverRunning) {
      console.log('Server not running, showing mock result');
      // Show mock result when server is not running
      const mockResult = {
        recommended_crop: 'Rice',
        confidence: 85,
        message: 'Based on your soil conditions, Rice is recommended (Demo Mode - Server Offline)'
      };
      
      setTimeout(() => {
        if (loading) loading.classList.remove('show');
        displayResult(mockResult, formData);
      }, 1500);
      return;
    }

    // Make API request
    const response = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response:', data);

    // Hide loading with delay for better UX
    setTimeout(() => {
      if (loading) loading.classList.remove('show');
    }, 500);
    
    // Display result with enhanced animation
    setTimeout(() => {
      displayResult(data, formData);
    }, 800);
    
  } catch (error) {
    console.error('Error:', error);
    if (loading) loading.classList.remove('show');
    
    // Show mock result on error
    const mockResult = {
      recommended_crop: 'Cotton',
      confidence: 78,
      message: 'Based on your soil conditions, Cotton is recommended (Demo Mode - API Error)'
    };
    displayResult(mockResult, formData);
  } finally {
    // Restore button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-magic"></i> <span>Analyze & Recommend</span>';
    }
  }
}

// Display result with enhanced animations
function displayResult(resultData, inputData) {
  const result = document.getElementById('result');
  const cropName = resultData.recommended_crop || 'Unknown';
  
  // Get crop emoji based on crop name
  const cropEmojis = {
    'rice': '🌾', 'maize': '🌽', 'chickpea': '🫘', 'kidneybeans': '🫘',
    'pigeonpeas': '🫘', 'mothbeans': '🫘', 'mungbean': '🫘', 'blackgram': '🫘',
    'lentil': '🫘', 'pomegranate': '🍎', 'banana': '🍌', 'mango': '🥭',
    'grapes': '🍇', 'watermelon': '🍉', 'muskmelon': '🍈', 'apple': '🍎',
    'orange': '🍊', 'papaya': '🥭', 'coconut': '🥥', 'cotton': '🌿',
    'jute': '🌿', 'coffee': '☕', 'sugarcane': '🎋'
  };
  
  const cropEmoji = cropEmojis[cropName.toLowerCase()] || '🌱';
  
  result.innerHTML = `
    <div class="crop-icon">${cropEmoji}</div>
    <div><strong>Recommended Crop:</strong> <span style="text-transform: capitalize; color: #1a5f3f;">${cropName}</span></div>
    <div style="margin-top: 15px; font-size: 1rem; opacity: 0.9; background: rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 20px; display: inline-block;">
      <i class="fas fa-chart-line"></i> Confidence: <strong>${(resultData.confidence * 100).toFixed(1)}%</strong>
    </div>
    <div style="margin-top: 15px; font-size: 0.9rem; opacity: 0.8;">
      <i class="fas fa-lightbulb"></i> Based on your soil and weather conditions
    </div>
  `;
  
  result.classList.add('show', 'success');
  
  // Add celebration animation
  setTimeout(() => {
    result.style.transform = 'scale(1.02)';
    setTimeout(() => {
      result.style.transform = 'scale(1)';
    }, 200);
  }, 100);
  
  // Scroll to result with smooth animation
  setTimeout(() => {
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

// Display error message
function displayError(message) {
  const result = document.getElementById('result');
  result.innerHTML = `
    <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
    <div>${message}</div>
  `;
  result.classList.add('show', 'error');
}

// Helper function to show input errors
function showInputError(input, message) {
  let errorElement = input.parentNode.querySelector('.input-error');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'input-error';
    errorElement.style.color = '#ef4444';
    errorElement.style.fontSize = '0.75rem';
    errorElement.style.marginTop = '0.25rem';
    input.parentNode.appendChild(errorElement);
  }
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

// Helper function to hide input errors
function hideInputError(input) {
  const errorElement = input.parentNode.querySelector('.input-error');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

// Scroll to section function
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Open chatbot function
function openChatbot() {
  const chatbotContainer = document.getElementById('chatbotContainer');
  const chatbotToggle = document.getElementById('chatbotToggle');
  
  if (chatbotContainer) {
    chatbotContainer.classList.add('show');
  }
  if (chatbotToggle) {
    chatbotToggle.style.transform = 'scale(0.9)';
  }
}

// Update server status display
function updateServerStatus(isConnected) {
  const statusElement = document.getElementById('serverStatus');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  
  if (isConnected) {
    statusElement.className = 'server-status connected';
    statusIcon.textContent = '✅';
    statusText.textContent = 'Server connected';
  } else {
    statusElement.className = 'server-status disconnected';
    statusIcon.textContent = '❌';
    statusText.textContent = 'Server disconnected - Run "python launch_app.py"';
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
  // Add entrance animation to form elements
  const formElements = document.querySelectorAll('.input-group, .submit-btn');
  formElements.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    setTimeout(() => {
      element.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, index * 100);
  });
  
  // Check server status on page load
  const serverRunning = await checkServerStatus();
  updateServerStatus(serverRunning);
  
  // Add enhanced form validation feedback
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      if (this.checkValidity()) {
        this.style.borderColor = '#27ae60';
        this.style.boxShadow = '0 0 0 3px rgba(39, 174, 96, 0.1)';
      } else {
        this.style.borderColor = '#e74c3c';
        this.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
      }
    });
    
    // Add focus animations
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'scale(1)';
    });
  });
  
});

// Add keyboard shortcut (Enter key)
document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && !document.querySelector('.submit-btn').disabled) {
    getCrop();
  }
});

// AI Farming Assistant Chatbot Functionality

// Chatbot state management
let chatbotState = {
  isOpen: false,
  isTyping: false,
  messageHistory: []
};

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeChatbot();
});

function initializeChatbot() {
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotContainer = document.getElementById('chatbotContainer');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSend = document.getElementById('chatbotSend');
  const suggestionBtns = document.querySelectorAll('.suggestion-btn');
  
  // Toggle chatbot visibility
  chatbotToggle.addEventListener('click', function() {
    toggleChatbot();
  });
  
  // Close chatbot
  chatbotClose.addEventListener('click', function() {
    closeChatbot();
  });
  
  // Send message on button click
  chatbotSend.addEventListener('click', function() {
    sendMessage();
  });
  
  // Send message on Enter key
  chatbotInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Handle suggestion button clicks
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const message = this.getAttribute('data-message');
      chatbotInput.value = message;
      sendMessage();
    });
  });
  
  // Auto-resize input
  chatbotInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });
  
  // Hide notification after first interaction
  chatbotToggle.addEventListener('click', function() {
    const notification = document.getElementById('chatbotNotification');
    if (notification) {
      notification.style.display = 'none';
    }
  });
}

function toggleChatbot() {
  const chatbotContainer = document.getElementById('chatbotContainer');
  const chatbotToggle = document.getElementById('chatbotToggle');
  
  if (chatbotState.isOpen) {
    closeChatbot();
  } else {
    openChatbot();
  }
}

function openChatbot() {
  const chatbotContainer = document.getElementById('chatbotContainer');
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotInput = document.getElementById('chatbotInput');
  
  chatbotContainer.classList.add('show');
  chatbotToggle.style.transform = 'scale(0.9)';
  chatbotState.isOpen = true;
  
  // Focus on input after animation
  setTimeout(() => {
    chatbotInput.focus();
  }, 300);
  
  // Add entrance animation
  chatbotContainer.style.animation = 'chatbotSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
}

function closeChatbot() {
  const chatbotContainer = document.getElementById('chatbotContainer');
  const chatbotToggle = document.getElementById('chatbotToggle');
  
  chatbotContainer.classList.remove('show');
  chatbotToggle.style.transform = 'scale(1)';
  chatbotState.isOpen = false;
}

async function sendMessage() {
  const chatbotInput = document.getElementById('chatbotInput');
  const message = chatbotInput.value.trim();
  
  if (!message || chatbotState.isTyping) {
    return;
  }
  
  // Clear input and add to history
  chatbotInput.value = '';
  chatbotInput.style.height = 'auto';
  chatbotState.messageHistory.push({ type: 'user', content: message });
  
  // Display user message
  displayMessage(message, 'user');
  
  // Show typing indicator
  showTypingIndicator();
  
  try {
    // Send message to backend
    const response = await fetch('http://127.0.0.1:5000/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Display bot response
    if (data.response) {
      chatbotState.messageHistory.push({ type: 'bot', content: data.response });
      displayMessage(data.response, 'bot');
    } else {
      displayMessage('Sorry, I couldn\'t process your request. Please try again.', 'bot');
    }
    
  } catch (error) {
    console.error('Chatbot error:', error);
    hideTypingIndicator();
    
    // Display error message
    const errorMessage = `Sorry, I'm having trouble connecting to the server. Please make sure the Flask server is running by executing "python launch_app.py" or "python simple_app.py".`;
    displayMessage(errorMessage, 'bot');
  }
}

function displayMessage(content, type) {
  const messagesContainer = document.getElementById('chatbotMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = type === 'bot' ? '<i class="fas fa-seedling"></i>' : '<i class="fas fa-user"></i>';
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  // Format message content (support for markdown-like formatting)
  const formattedContent = formatMessageContent(content);
  messageContent.innerHTML = formattedContent;
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);
  
  // Add message with animation
  messagesContainer.appendChild(messageDiv);
  
  // Scroll to bottom with smooth animation
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
  
  // Add entrance animation
  messageDiv.style.opacity = '0';
  messageDiv.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    messageDiv.style.transition = 'all 0.3s ease-out';
    messageDiv.style.opacity = '1';
    messageDiv.style.transform = 'translateY(0)';
  }, 50);
}

function formatMessageContent(content) {
  // Convert markdown-like formatting to HTML
  let formatted = content
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Bullet points
    .replace(/^• (.*$)/gim, '<li>$1</li>')
    // Line breaks
    .replace(/\n/g, '<br>');
  
  // Wrap consecutive <li> elements in <ul>
  formatted = formatted.replace(/(<li>.*<\/li>)/gs, function(match) {
    return '<ul>' + match + '</ul>';
  });
  
  // Clean up multiple <br> tags
  formatted = formatted.replace(/(<br>\s*){3,}/g, '<br><br>');
  
  return formatted;
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('chatbotMessages');
  chatbotState.isTyping = true;
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing-message';
  typingDiv.id = 'typingIndicator';
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = '<i class="fas fa-seedling"></i>';
  
  const typingContent = document.createElement('div');
  typingContent.className = 'message-content';
  
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  
  typingContent.appendChild(typingIndicator);
  typingDiv.appendChild(avatar);
  typingDiv.appendChild(typingContent);
  
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
  chatbotState.isTyping = false;
}

// Enhanced particle effect for chatbot interactions
function createChatbotParticles(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.width = '6px';
    particle.style.height = '6px';
    particle.style.background = '#27ae60';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    
    const angle = (i / 8) * Math.PI * 2;
    const distance = 50 + Math.random() * 30;
    const randomX = Math.cos(angle) * distance;
    const randomY = Math.sin(angle) * distance;
    
    particle.style.setProperty('--random-x', randomX + 'px');
    particle.style.setProperty('--random-y', randomY + 'px');
    particle.style.animation = 'particleFloat 0.8s ease-out forwards';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 800);
  }
}

// Add chatbot button click effect
document.addEventListener('DOMContentLoaded', function() {
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotSend = document.getElementById('chatbotSend');
  
  if (chatbotToggle) {
    chatbotToggle.addEventListener('click', function() {
      createChatbotParticles(this);
    });
  }
  
  if (chatbotSend) {
    chatbotSend.addEventListener('click', function() {
      createChatbotParticles(this);
    });
  }
});

// Close chatbot when clicking outside
document.addEventListener('click', function(event) {
  const chatbotContainer = document.getElementById('chatbotContainer');
  const chatbotToggle = document.getElementById('chatbotToggle');
  
  if (chatbotState.isOpen && 
      !chatbotContainer.contains(event.target) && 
      !chatbotToggle.contains(event.target)) {
    closeChatbot();
  }
});

// Prevent chatbot from closing when clicking inside
document.getElementById('chatbotContainer')?.addEventListener('click', function(event) {
  event.stopPropagation();
});

// Gujarat District-wise Crop Recommendation System

// Gujarat Districts Data with Weather, Soil & Environmental Factors
const GUJARAT_DISTRICTS = {
  'Ahmedabad': {
    climate: { temp: 28, humidity: 65, rainfall: 800 },
    soil: { type: 'alluvial', ph: 7.2, fertility: 'medium' },
    environment: { water_availability: 'moderate', irrigation: 'canal' },
    recommended_crops: ['cotton', 'wheat', 'bajra', 'groundnut']
  },
  'Surat': {
    climate: { temp: 30, humidity: 75, rainfall: 1200 },
    soil: { type: 'alluvial', ph: 6.8, fertility: 'high' },
    environment: { water_availability: 'good', irrigation: 'river' },
    recommended_crops: ['sugarcane', 'cotton', 'rice', 'banana']
  },
  'Vadodara': {
    climate: { temp: 29, humidity: 70, rainfall: 900 },
    soil: { type: 'black_cotton', ph: 7.5, fertility: 'high' },
    environment: { water_availability: 'good', irrigation: 'canal' },
    recommended_crops: ['cotton', 'wheat', 'maize', 'sugarcane']
  },
  'Rajkot': {
    climate: { temp: 27, humidity: 60, rainfall: 600 },
    soil: { type: 'black_cotton', ph: 7.8, fertility: 'medium' },
    environment: { water_availability: 'limited', irrigation: 'groundwater' },
    recommended_crops: ['cotton', 'groundnut', 'castor', 'wheat']
  },
  'Bhavnagar': {
    climate: { temp: 28, humidity: 65, rainfall: 550 },
    soil: { type: 'coastal_alluvial', ph: 7.0, fertility: 'medium' },
    environment: { water_availability: 'limited', irrigation: 'groundwater' },
    recommended_crops: ['cotton', 'groundnut', 'bajra', 'sesame']
  },
  'Jamnagar': {
    climate: { temp: 29, humidity: 70, rainfall: 400 },
    soil: { type: 'sandy_loam', ph: 7.3, fertility: 'low' },
    environment: { water_availability: 'scarce', irrigation: 'drip' },
    recommended_crops: ['groundnut', 'castor', 'bajra', 'cotton']
  },
  'Junagadh': {
    climate: { temp: 26, humidity: 68, rainfall: 900 },
    soil: { type: 'black_cotton', ph: 7.4, fertility: 'high' },
    environment: { water_availability: 'good', irrigation: 'canal' },
    recommended_crops: ['cotton', 'groundnut', 'wheat', 'mango']
  },
  'Gandhinagar': {
    climate: { temp: 28, humidity: 62, rainfall: 750 },
    soil: { type: 'alluvial', ph: 7.1, fertility: 'medium' },
    environment: { water_availability: 'moderate', irrigation: 'canal' },
    recommended_crops: ['wheat', 'bajra', 'cotton', 'vegetables']
  },
  'Anand': {
    climate: { temp: 27, humidity: 68, rainfall: 850 },
    soil: { type: 'alluvial', ph: 6.9, fertility: 'high' },
    environment: { water_availability: 'good', irrigation: 'canal' },
    recommended_crops: ['tobacco', 'cotton', 'wheat', 'sugarcane']
  },
  'Kutch': {
    climate: { temp: 30, humidity: 55, rainfall: 350 },
    soil: { type: 'sandy', ph: 8.0, fertility: 'low' },
    environment: { water_availability: 'very_limited', irrigation: 'drip' },
    recommended_crops: ['castor', 'bajra', 'mustard', 'cumin']
  },
  'Banaskantha': {
    climate: { temp: 26, humidity: 58, rainfall: 650 },
    soil: { type: 'sandy_loam', ph: 7.6, fertility: 'medium' },
    environment: { water_availability: 'moderate', irrigation: 'tube_well' },
    recommended_crops: ['bajra', 'wheat', 'mustard', 'castor']
  },
  'Sabarkantha': {
    climate: { temp: 25, humidity: 62, rainfall: 800 },
    soil: { type: 'red_sandy', ph: 6.5, fertility: 'medium' },
    environment: { water_availability: 'moderate', irrigation: 'tube_well' },
    recommended_crops: ['maize', 'wheat', 'bajra', 'vegetables']
  },
  'Mehsana': {
    climate: { temp: 27, humidity: 60, rainfall: 700 },
    soil: { type: 'alluvial', ph: 7.3, fertility: 'medium' },
    environment: { water_availability: 'moderate', irrigation: 'tube_well' },
    recommended_crops: ['bajra', 'wheat', 'mustard', 'cumin']
  },
  'Patan': {
    climate: { temp: 28, humidity: 58, rainfall: 650 },
    soil: { type: 'sandy_loam', ph: 7.5, fertility: 'medium' },
    environment: { water_availability: 'limited', irrigation: 'tube_well' },
    recommended_crops: ['bajra', 'castor', 'mustard', 'wheat']
  },
  'Kheda': {
    climate: { temp: 28, humidity: 65, rainfall: 800 },
    soil: { type: 'black_cotton', ph: 7.2, fertility: 'high' },
    environment: { water_availability: 'good', irrigation: 'canal' },
    recommended_crops: ['tobacco', 'cotton', 'wheat', 'rice']
  },
  'Panchmahals': {
    climate: { temp: 26, humidity: 70, rainfall: 950 },
    soil: { type: 'red_loam', ph: 6.8, fertility: 'medium' },
    environment: { water_availability: 'good', irrigation: 'canal' },
    recommended_crops: ['maize', 'wheat', 'cotton', 'vegetables']
  },
  'Dahod': {
    climate: { temp: 25, humidity: 72, rainfall: 1000 },
    soil: { type: 'red_loam', ph: 6.6, fertility: 'medium' },
    environment: { water_availability: 'good', irrigation: 'canal' },
    recommended_crops: ['maize', 'wheat', 'cotton', 'soybean']
  },
  'Valsad': {
    climate: { temp: 31, humidity: 80, rainfall: 1800 },
    soil: { type: 'coastal_alluvial', ph: 6.5, fertility: 'high' },
    environment: { water_availability: 'abundant', irrigation: 'river' },
    recommended_crops: ['rice', 'sugarcane', 'coconut', 'mango']
  },
  'Navsari': {
    climate: { temp: 30, humidity: 78, rainfall: 1500 },
    soil: { type: 'alluvial', ph: 6.7, fertility: 'high' },
    environment: { water_availability: 'good', irrigation: 'river' },
    recommended_crops: ['sugarcane', 'rice', 'banana', 'vegetables']
  },
  'Bharuch': {
    climate: { temp: 29, humidity: 72, rainfall: 1100 },
    soil: { type: 'alluvial', ph: 7.0, fertility: 'high' },
    environment: { water_availability: 'good', irrigation: 'river' },
    recommended_crops: ['cotton', 'sugarcane', 'rice', 'banana']
  },
  'Narmada': {
    climate: { temp: 28, humidity: 75, rainfall: 1200 },
    soil: { type: 'alluvial', ph: 6.9, fertility: 'high' },
    environment: { water_availability: 'abundant', irrigation: 'river' },
    recommended_crops: ['rice', 'sugarcane', 'cotton', 'wheat']
  },
  'Tapi': {
    climate: { temp: 29, humidity: 76, rainfall: 1300 },
    soil: { type: 'alluvial', ph: 6.8, fertility: 'high' },
    environment: { water_availability: 'good', irrigation: 'river' },
    recommended_crops: ['rice', 'sugarcane', 'cotton', 'vegetables']
  },
  'Dang': {
    climate: { temp: 24, humidity: 85, rainfall: 2200 },
    soil: { type: 'red_loam', ph: 6.2, fertility: 'medium' },
    environment: { water_availability: 'abundant', irrigation: 'natural' },
    recommended_crops: ['rice', 'maize', 'vegetables', 'fruits']
  }
};

// Gujarat District-wise Crop Recommendation Function
async function getGujaratRecommendations() {
  console.log('getGujaratRecommendations function called');
  
  const gujaratBtn = document.querySelector('.btn-secondary');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  
  console.log('Gujarat elements found:', {
    gujaratBtn: !!gujaratBtn,
    loading: !!loading,
    result: !!result
  });
  
  if (!gujaratBtn || !loading || !result) {
    console.error('Required elements not found');
    return;
  }
  
  try {
    // Add particle effect
    const rect = gujaratBtn.getBoundingClientRect();
    createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    
    // Update button state
    gujaratBtn.disabled = true;
    gujaratBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Analyzing Gujarat...</span>';
    
    // Show loading
    loading.classList.add('show');
    result.classList.remove('show');
    
    // Generate analysis data
    const analysisData = generateGujaratAnalysis();
    console.log('Generated analysis data:', analysisData);
    
    // Hide loading and display results
    setTimeout(() => {
      loading.classList.remove('show');
      displayGujaratResults(analysisData);
    }, 1500);
    
    // Add success particle effect
    setTimeout(() => {
      createParticles(window.innerWidth / 2, window.innerHeight / 2);
    }, 2000);
    
  } catch (error) {
    console.error('Gujarat analysis error:', error);
    if (loading) {
      loading.classList.remove('show');
    }
    displayError('Failed to analyze Gujarat districts. Please try again.');
  } finally {
    // Restore button
    setTimeout(() => {
      if (gujaratBtn) {
        gujaratBtn.disabled = false;
        gujaratBtn.innerHTML = '<i class="fas fa-search-location"></i> <span>Analyze Gujarat Districts</span>';
      }
    }, 1600);
  }
}

function generateGujaratAnalysis() {
  const districts = Object.keys(GUJARAT_DISTRICTS);
  const totalDistricts = districts.length;
  
  // Analyze crop distribution
  const cropFrequency = {};
  const soilTypes = {};
  const irrigationMethods = {};
  
  districts.forEach(district => {
    const data = GUJARAT_DISTRICTS[district];
    
    // Count crop recommendations
    data.recommended_crops.forEach(crop => {
      cropFrequency[crop] = (cropFrequency[crop] || 0) + 1;
    });
    
    // Count soil types
    soilTypes[data.soil.type] = (soilTypes[data.soil.type] || 0) + 1;
    
    // Count irrigation methods
    irrigationMethods[data.environment.irrigation] = (irrigationMethods[data.environment.irrigation] || 0) + 1;
  });
  
  // Get top recommendations
  const topCrops = Object.entries(cropFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  return {
    totalDistricts,
    topCrops,
    soilTypes,
    irrigationMethods,
    districts: GUJARAT_DISTRICTS
  };
}

function displayGujaratResults(analysisData) {
  const result = document.getElementById('result');
  
  const { totalDistricts, topCrops, soilTypes, irrigationMethods } = analysisData;
  
  // Create comprehensive Gujarat analysis display
  result.innerHTML = `
    <div class="success-container">
      <div class="success-icon">🗺️</div>
      <h3 class="success-title">Gujarat Regional Analysis Complete</h3>
      <p class="success-message">Comprehensive district-wise crop recommendations for all ${totalDistricts} districts</p>
      
      <div class="gujarat-analysis-grid">
        <div class="analysis-card">
          <div class="analysis-header">
            <i class="fas fa-seedling"></i>
            <h4>Top Recommended Crops</h4>
          </div>
          <div class="crop-list">
            ${topCrops.map(([crop, count]) => `
              <div class="crop-item">
                <span class="crop-name">${crop.charAt(0).toUpperCase() + crop.slice(1)}</span>
                <span class="crop-count">${count} districts</span>
                <div class="crop-bar">
                  <div class="crop-fill" style="width: ${(count / totalDistricts) * 100}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="analysis-card">
          <div class="analysis-header">
            <i class="fas fa-mountain"></i>
            <h4>Soil Type Distribution</h4>
          </div>
          <div class="soil-list">
            ${Object.entries(soilTypes).map(([soil, count]) => `
              <div class="soil-item">
                <span class="soil-name">${soil.replace('_', ' ').toUpperCase()}</span>
                <span class="soil-count">${count} districts</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="analysis-card">
          <div class="analysis-header">
            <i class="fas fa-tint"></i>
            <h4>Irrigation Methods</h4>
          </div>
          <div class="irrigation-list">
            ${Object.entries(irrigationMethods).map(([method, count]) => `
              <div class="irrigation-item">
                <span class="irrigation-name">${method.replace('_', ' ').toUpperCase()}</span>
                <span class="irrigation-count">${count} districts</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="analysis-card district-highlights">
          <div class="analysis-header">
            <i class="fas fa-star"></i>
            <h4>District Highlights</h4>
          </div>
          <div class="highlight-list">
            <div class="highlight-item">
              <strong>Highest Rainfall:</strong> Dang (2200mm) - Ideal for rice cultivation
            </div>
            <div class="highlight-item">
              <strong>Arid Region:</strong> Kutch (350mm) - Perfect for drought-resistant crops
            </div>
            <div class="highlight-item">
              <strong>Fertile Plains:</strong> Kheda, Anand - High fertility alluvial soil
            </div>
            <div class="highlight-item">
              <strong>Coastal Belt:</strong> Valsad, Navsari - Tropical crop cultivation
            </div>
          </div>
        </div>
      </div>
      
      <div class="analysis-summary">
        <h4><i class="fas fa-chart-line"></i> Key Insights</h4>
        <ul>
          <li><strong>Cotton</strong> is the most widely recommended crop across Gujarat districts</li>
          <li><strong>Alluvial soil</strong> dominates the fertile regions of central Gujarat</li>
          <li><strong>Canal irrigation</strong> is the primary water source for agriculture</li>
          <li><strong>Climate diversity</strong> allows cultivation of both tropical and arid crops</li>
          <li><strong>Water management</strong> varies from abundant rivers to scarce groundwater</li>
        </ul>
      </div>
      
      <div class="analysis-actions">
        <button class="btn btn-primary" onclick="getGujaratRecommendations()">
          <i class="fas fa-refresh"></i> New Analysis
        </button>
        <button class="btn btn-success" onclick="downloadGujaratReport()">
          <i class="fas fa-download"></i> Download Report
        </button>
        <button class="btn btn-secondary" onclick="showDistrictDetails()">
          <i class="fas fa-map"></i> View District Details
        </button>
      </div>
    </div>
  `;
  
  result.classList.add('show');
  
  // Add entrance animation
  setTimeout(() => {
    result.style.transform = 'scale(1.02)';
    setTimeout(() => {
      result.style.transform = 'scale(1)';
    }, 200);
  }, 100);
  
  // Scroll to result
  setTimeout(() => {
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

// Download Gujarat report function
function downloadGujaratReport() {
  const analysisData = generateGujaratAnalysis();
  const reportContent = `
Gujarat Agricultural Analysis Report
Generated on: ${new Date().toLocaleDateString()}

OVERVIEW:
- Total Districts Analyzed: ${analysisData.totalDistricts}
- Comprehensive crop recommendations based on climate, soil, and water resources

TOP RECOMMENDED CROPS:
${analysisData.topCrops.map(([crop, count]) => `- ${crop.toUpperCase()}: Suitable for ${count} districts`).join('\n')}

SOIL DISTRIBUTION:
${Object.entries(analysisData.soilTypes).map(([soil, count]) => `- ${soil.replace('_', ' ').toUpperCase()}: ${count} districts`).join('\n')}

IRRIGATION METHODS:
${Object.entries(analysisData.irrigationMethods).map(([method, count]) => `- ${method.replace('_', ' ').toUpperCase()}: ${count} districts`).join('\n')}

For detailed district-wise recommendations, please refer to the complete analysis.
  `;
  
  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gujarat-agricultural-analysis.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  // Show success message
  const notification = document.createElement('div');
  notification.className = 'download-notification';
  notification.innerHTML = '<i class="fas fa-check"></i> Report downloaded successfully!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Show district details function
function showDistrictDetails() {
  const analysisData = generateGujaratAnalysis();
  const result = document.getElementById('result');
  
  result.innerHTML = `
    <div class="success-container">
      <div class="success-icon">📍</div>
      <h3 class="success-title">Gujarat District Details</h3>
      <p class="success-message">Detailed analysis for all ${analysisData.totalDistricts} districts</p>
      
      <div class="districts-grid">
        ${Object.entries(analysisData.districts).map(([district, data]) => `
          <div class="district-card" onclick="showSingleDistrictDetail('${district}')">
            <div class="district-header">
              <h4 class="district-name">${district}</h4>
              <div class="district-badge">${data.soil.fertility} fertility</div>
            </div>
            <div class="district-info">
              <div class="info-row">
                <span class="info-label">🌡️ Temperature:</span>
                <span class="info-value">${data.climate.temp}°C</span>
              </div>
              <div class="info-row">
                <span class="info-label">💧 Rainfall:</span>
                <span class="info-value">${data.climate.rainfall}mm</span>
              </div>
              <div class="info-row">
                <span class="info-label">🌾 Soil Type:</span>
                <span class="info-value">${data.soil.type.replace(/_/g, ' ')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">💧 Irrigation:</span>
                <span class="info-value">${data.environment.irrigation}</span>
              </div>
              <strong>Recommended Crops:</strong>
              <div class="crop-tags">
                ${data.recommended_crops.map(crop => `<span class="crop-tag">${crop}</span>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="analysis-actions">
        <button class="btn btn-primary" onclick="getGujaratRecommendations()">
          <i class="fas fa-arrow-left"></i> Back to Summary
        </button>
        <button class="btn btn-secondary" onclick="downloadGujaratReport()">
          <i class="fas fa-download"></i> Download Report
        </button>
      </div>
    </div>
  `;
  
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show single district detail function
function showSingleDistrictDetail(districtName) {
  const analysisData = generateGujaratAnalysis();
  const districtData = analysisData.districts[districtName];
  const result = document.getElementById('result');
  
  if (!districtData) return;
  
  result.innerHTML = `
    <div class="success-container">
      <div class="success-icon">🏛️</div>
      <h3 class="success-title">${districtName} District Analysis</h3>
      <p class="success-message">Comprehensive agricultural profile for ${districtName}</p>
      
      <div class="single-district-details">
        <div class="detail-grid">
          <div class="detail-card">
            <h4><i class="fas fa-thermometer-half"></i> Climate Conditions</h4>
            <div class="detail-content">
              <div class="detail-item">
                <span>Temperature:</span>
                <strong>${districtData.climate.temp}°C</strong>
              </div>
              <div class="detail-item">
                <span>Humidity:</span>
                <strong>${districtData.climate.humidity}%</strong>
              </div>
              <div class="detail-item">
                <span>Annual Rainfall:</span>
                <strong>${districtData.climate.rainfall}mm</strong>
              </div>
            </div>
          </div>
          
          <div class="detail-card">
            <h4><i class="fas fa-seedling"></i> Soil Profile</h4>
            <div class="detail-content">
              <div class="detail-item">
                <span>Soil Type:</span>
                <strong>${districtData.soil.type.replace(/_/g, ' ').toUpperCase()}</strong>
              </div>
              <div class="detail-item">
                <span>pH Level:</span>
                <strong>${districtData.soil.ph}</strong>
              </div>
              <div class="detail-item">
                <span>Fertility:</span>
                <strong class="fertility-${districtData.soil.fertility}">${districtData.soil.fertility.toUpperCase()}</strong>
              </div>
            </div>
          </div>
          
          <div class="detail-card">
            <h4><i class="fas fa-tint"></i> Water Resources</h4>
            <div class="detail-content">
              <div class="detail-item">
                <span>Water Availability:</span>
                <strong>${districtData.environment.water_availability.replace(/_/g, ' ')}</strong>
              </div>
              <div class="detail-item">
                <span>Irrigation Method:</span>
                <strong>${districtData.environment.irrigation.toUpperCase()}</strong>
              </div>
            </div>
          </div>
          
          <div class="detail-card full-width">
            <h4><i class="fas fa-leaf"></i> Recommended Crops</h4>
            <div class="recommended-crops-grid">
              ${districtData.recommended_crops.map(crop => `
                <div class="crop-recommendation">
                  <span class="crop-name">${crop}</span>
                  <span class="crop-suitability">Highly Suitable</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      
      <div class="analysis-actions">
        <button class="btn btn-secondary" onclick="showDistrictDetails()">
          <i class="fas fa-arrow-left"></i> Back to All Districts
        </button>
        <button class="btn btn-primary" onclick="getGujaratRecommendations()">
          <i class="fas fa-chart-bar"></i> Back to Analysis
        </button>
      </div>
    </div>
  `;
  
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Initialize Gujarat button tooltip functionality
document.addEventListener('DOMContentLoaded', function() {
  const gujaratBtn = document.getElementById('gujaratBtn');
  const tooltip = document.getElementById('gujaratTooltip');
  
  if (gujaratBtn && tooltip) {
    // Set tooltip title for accessibility
    gujaratBtn.title = "Gujarat: analyze all districts – weather, soil & environment → crop recommendations";
    
    // Show tooltip on hover
    gujaratBtn.addEventListener('mouseenter', function() {
      tooltip.classList.add('show');
    });
    
    // Hide tooltip when not hovering
    gujaratBtn.addEventListener('mouseleave', function() {
      tooltip.classList.remove('show');
    });
    
    // Show tooltip on focus (keyboard navigation)
    gujaratBtn.addEventListener('focus', function() {
      tooltip.classList.add('show');
    });
    
    // Hide tooltip on blur
    gujaratBtn.addEventListener('blur', function() {
      tooltip.classList.remove('show');
    });
  }
});

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle mobile menu
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Enhanced form validation with better UX
    const form = document.getElementById('cropForm');
    const inputs = form.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        // Real-time validation feedback
        input.addEventListener('input', function() {
            validateInput(this);
        });
        
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });

    function validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        
        // Remove previous validation classes
        input.classList.remove('valid', 'invalid');
        
        if (input.value === '') {
            return;
        }
        
        if (isNaN(value) || value < min || value > max) {
            input.classList.add('invalid');
            showInputError(input, `Please enter a value between ${min} and ${max}`);
        } else {
            input.classList.add('valid');
            hideInputError(input);
        }
    }

    function showInputError(input, message) {
        let errorElement = input.parentNode.querySelector('.input-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'input-error';
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function hideInputError(input) {
        const errorElement = input.parentNode.querySelector('.input-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
});
