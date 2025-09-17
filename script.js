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
  const form = document.getElementById('cropForm');
  const submitBtn = document.querySelector('.submit-btn');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  
  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Add particle effect on button click
  const rect = submitBtn.getBoundingClientRect();
  createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);

  // Check server status first
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    displayError('Server is not running. Please run "python launch_app.py" to start the application.');
    return;
  }

  // Get form data
  let data = {
    N: parseFloat(document.getElementById("N").value),
    P: parseFloat(document.getElementById("P").value),
    K: parseFloat(document.getElementById("K").value),
    temperature: parseFloat(document.getElementById("temp").value),
    humidity: parseFloat(document.getElementById("humidity").value),
    ph: parseFloat(document.getElementById("ph").value),
    rainfall: parseFloat(document.getElementById("rain").value)
  };

  // Show loading state with enhanced animation
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
  loading.style.display = 'block';
  result.classList.remove('show', 'success', 'error');

  // Add loading animation to inputs
  const inputs = document.querySelectorAll('.input-group input');
  inputs.forEach(input => {
    input.style.transform = 'scale(0.98)';
    input.style.transition = 'transform 0.3s ease';
  });

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resultData = await response.json();
    
    // Add success particle effect
    setTimeout(() => {
      createParticles(window.innerWidth / 2, window.innerHeight / 2);
    }, 500);
    
    // Display result with enhanced animation
    displayResult(resultData, data);
    
  } catch (error) {
    console.error('Error:', error);
    displayError('Failed to get recommendation. Please run "python launch_app.py" to start the server.');
  } finally {
    // Hide loading state and restore button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-magic"></i> Get Crop Recommendation';
    loading.style.display = 'none';
    
    // Restore input animations
    inputs.forEach(input => {
      input.style.transform = 'scale(1)';
    });
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
  const gujaratBtn = document.getElementById('gujaratBtn');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  
  // Add particle effect
  const rect = gujaratBtn.getBoundingClientRect();
  createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
  
  // Show loading state
  gujaratBtn.disabled = true;
  gujaratBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="btn-text">Analyzing Gujarat Districts...</span>';
  loading.style.display = 'block';
  result.classList.remove('show', 'success', 'error');
  
  try {
    // Simulate API call delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate comprehensive Gujarat analysis
    const analysis = generateGujaratAnalysis();
    
    // Display results
    displayGujaratResults(analysis);
    
    // Add success particle effect
    setTimeout(() => {
      createParticles(window.innerWidth / 2, window.innerHeight / 2);
    }, 500);
    
  } catch (error) {
    console.error('Gujarat analysis error:', error);
    displayError('Failed to analyze Gujarat districts. Please try again.');
  } finally {
    // Restore button
    gujaratBtn.disabled = false;
    gujaratBtn.innerHTML = `
      <i class="fas fa-map-marked-alt"></i>
      <span class="btn-text">Gujarat: Weather, Soil & Environment → Crop Advice</span>
      <span class="btn-subtext">District-wise analysis for all Gujarat regions</span>
    `;
    loading.style.display = 'none';
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

function displayGujaratResults(analysis) {
  const result = document.getElementById('result');
  
  const topCropsHtml = analysis.topCrops
    .map(([crop, count]) => `
      <div class="crop-stat">
        <span class="crop-name">${crop.charAt(0).toUpperCase() + crop.slice(1)}</span>
        <span class="crop-count">${count}/${analysis.totalDistricts} districts</span>
      </div>
    `).join('');
  
  const districtDetailsHtml = Object.entries(analysis.districts)
    .slice(0, 6) // Show first 6 districts
    .map(([district, data]) => `
      <div class="district-card">
        <h4>${district}</h4>
        <div class="district-info">
          <span><i class="fas fa-thermometer-half"></i> ${data.climate.temp}°C</span>
          <span><i class="fas fa-tint"></i> ${data.climate.rainfall}mm</span>
          <span><i class="fas fa-seedling"></i> ${data.soil.type}</span>
        </div>
        <div class="district-crops">
          ${data.recommended_crops.slice(0, 3).map(crop => 
            `<span class="crop-tag">${crop}</span>`
          ).join('')}
        </div>
      </div>
    `).join('');
  
  result.innerHTML = `
    <div style="font-size: 2.5rem; margin-bottom: 20px;">🗺️</div>
    <div><strong>Gujarat State-wide Crop Analysis Complete!</strong></div>
    <div style="margin: 20px 0; font-size: 1rem; opacity: 0.9;">
      Analyzed ${analysis.totalDistricts} districts with weather, soil & environmental data
    </div>
    
    <div class="analysis-section">
      <h3><i class="fas fa-chart-bar"></i> Top Recommended Crops Across Gujarat</h3>
      <div class="crops-grid">
        ${topCropsHtml}
      </div>
    </div>
    
    <div class="analysis-section">
      <h3><i class="fas fa-map-marker-alt"></i> Sample District Analysis</h3>
      <div class="districts-grid">
        ${districtDetailsHtml}
      </div>
      <div style="margin-top: 15px; font-size: 0.9rem; opacity: 0.8;">
        <i class="fas fa-info-circle"></i> Showing 6 of ${analysis.totalDistricts} districts. 
        Each district analyzed for climate, soil type, and water availability.
      </div>
    </div>
    
    <div class="analysis-section">
      <h3><i class="fas fa-lightbulb"></i> Key Insights</h3>
      <ul style="text-align: left; margin: 15px 0;">
        <li><strong>Cotton</strong> is suitable for ${analysis.topCrops[0][1]} districts (highest adaptability)</li>
        <li><strong>Wheat</strong> recommended for ${analysis.topCrops.find(([crop]) => crop === 'wheat')?.[1] || 0} districts</li>
        <li><strong>South Gujarat</strong> (Valsad, Navsari) ideal for rice and sugarcane</li>
        <li><strong>Kutch region</strong> requires drought-resistant crops like castor and bajra</li>
        <li><strong>Central Gujarat</strong> perfect for cotton and commercial crops</li>
      </ul>
    </div>
  `;
  
  result.classList.add('show', 'success');
  
  // Scroll to result
  setTimeout(() => {
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
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
