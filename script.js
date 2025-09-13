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
