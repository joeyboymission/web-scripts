// ==UserScript==
// @name         Teetime AutoLogin and AutoBook
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  AutoLogin and AutoBook for Teetime Golf Booking System
// @author       JOIBOI
// @match        https://tagaytayhighlands-teetime.com/
// @match        https://tagaytayhighlands-teetime.com/index.php?w=1
// @match        https://tagaytayhighlands-teetime.com/index.php
// @match        https://tagaytayhighlands-teetime.com/t/index.php?v=1
// @match        https://tagaytayhighlands-teetime.com/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// @grant        none
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

// Store credentials and scheduling info
let userName = '';
let password = '';
let dateTrigger = '';
let timeTrigger = '';
let selectedCourse = '';
let isAutomationActive = false;

// Add floating window state
let isFormVisible = true;

// Add stop functionality state
let automationTimeout = null;

// Add clock timer variable
let clockTimer = null;

// Golf course configuration
const GOLF_COURSES = {
    HIGHLANDS: '1',      // Highlands Golf Course
    MIDLANDS_FB: '2',    // Midlands Front 9 - Back 9
    MIDLANDS_BL: '3',    // Midlands Back 9 - Lucky 9
    MIDLANDS_LF: '4'     // Midlands Lucky 9 - Front 9
};

// Add golf course names for display
const GOLF_COURSE_NAMES = {
    '1': 'Highlands Golf Course',
    '2': 'Midlands Front 9 - Back 9',
    '3': 'Midlands Back 9 - Lucky 9',
    '4': 'Midlands Lucky 9 - Front 9'
};

// Add session tracking
const SESSION_KEY = 'teetime_session';
const STATE_KEY = 'teetime_state';

// Store automation state
function saveState() {
    const state = {
        userName,
        password,
        dateTrigger,
        timeTrigger,
        selectedCourse,
        isAutomationActive,
        isFormVisible,
        lastPage: getCurrentPage(),
        timestamp: new Date().getTime()
    };
    
    // Save to both session and local storage
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    
    // Set session flag
    sessionStorage.setItem(SESSION_KEY, 'active');
}

// Load automation state
function loadState() {
    // Check if we're in an active session
    const isActiveSession = sessionStorage.getItem(SESSION_KEY) === 'active';
    
    // Get state from storage
    let state = sessionStorage.getItem(STATE_KEY);
    if (!state && isActiveSession) {
        state = localStorage.getItem(STATE_KEY);
    }
    
    if (state) {
        const parsed = JSON.parse(state);
        // Only restore if state is from current session or within last hour
        const isRecent = (new Date().getTime() - parsed.timestamp) < 3600000;
        
        if (isActiveSession || isRecent) {
            userName = parsed.userName || '';
            password = parsed.password || '';
            dateTrigger = parsed.dateTrigger || '';
            timeTrigger = parsed.timeTrigger || '';
            selectedCourse = parsed.selectedCourse || '';
            isAutomationActive = parsed.isAutomationActive || false;
            isFormVisible = parsed.isFormVisible !== undefined ? parsed.isFormVisible : true;
            return true;
        }
    }
    return false;
}

// Page detection
function getPageByURL() {
    const currentURL = window.location.href;
    if (currentURL.includes('/t/index.php')) {
        return 'course-selection';
    } else if (currentURL.includes('tagaytayhighlands-teetime.com')) {
        return 'login';
    }
    return 'unknown';
}

// Modified getCurrentPage function
function getCurrentPage() {
    // First check URL
    const urlPage = getPageByURL();
    if (urlPage !== 'unknown') {
        return urlPage;
    }
    
    // Fallback to DOM checking
    const loginForm = document.querySelector('form input[name="membersid"]');
    const courseSelect = document.querySelector('select[name="golfcourse"]');
    
    if (loginForm) return 'login';
    if (courseSelect) return 'course-selection';
    return 'unknown';
}

// Add initial cleanup
function cleanupAutomation() {
    sessionStorage.removeItem('teetime_automation');
    localStorage.removeItem('teetime_automation');
    if (automationTimeout) {
        clearTimeout(automationTimeout);
    }
    isAutomationActive = false;
    userName = '';
    password = '';
    dateTrigger = '';
    timeTrigger = '';
    selectedCourse = '';
}

// Add clock update function
function startClock() {
    if (clockTimer) clearInterval(clockTimer);
    updateStatus('Ready to start automation');
    clockTimer = setInterval(() => {
        const status = document.getElementById('status');
        if (status) {
            const now = new Date();
            const dateString = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                fractionalSecondDigits: 3
            });
            
            const currentPage = getCurrentPage();
            const stateMessage = isAutomationActive ? '🟢 Active' : '⚪ Standby';
            
            const lastMessage = status.querySelector('.status-message')?.textContent || 'Ready';
            
            status.innerHTML = `
                <div class="status-message" style="margin-bottom: 4px;">${lastMessage}</div>
                <div style="color: #888; font-size: 11px; display: flex; flex-direction: column; gap: 2px;">
                    <div>Status: ${stateMessage}</div>
                    <div>Page: ${currentPage}</div>
                    <div>Date: ${dateString} | Time: ${timeString}</div>
                </div>
            `;
        }
    }, 100); // Update every 100ms for smooth time display
}

// Modified updateStatus function
function updateStatus(message) {
    const status = document.getElementById('status');
    if (status) {
        const statusMessage = status.querySelector('.status-message');
        if (statusMessage) {
            statusMessage.textContent = message;
        } else {
            startClock(); // Start clock if status element exists but message doesn't
        }
    }
}

// Modified createCredentialForm function
function createCredentialForm() {
    // Check if form already exists
    if (document.getElementById('credentialForm')) {
        return;
    }

    const formHTML = `
      <div id="credentialForm" style="position: fixed; top: 20px; right: 20px; background: white; padding: 15px; border: 1px solid #ccc; border-radius: 5px; z-index: 99999; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 280px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <h3 style="margin: 0; font-size: 18px;">Automated Login and Scheduler</h3>
          <button id="minimizeForm" style="background: none; border: 1px solid #ddd; cursor: pointer; font-size: 16px; font-weight: bold; padding: 0 8px; border-radius: 4px; transition: background 0.3s;">−</button>
        </div>
        <div id="formContent">
          <p style="font-size: 12px; margin-bottom: 10px; color: #666;">Please fill all required fields</p>
          <div style="margin-bottom: 10px;">
            <label style="display: block; font-size: 12px; margin: 5px 0;">Login Credentials:</label>
            <input type="text" id="userNameInput" placeholder="Username" style="margin-bottom: 5px; width: 100%; padding: 5px;">
            <input type="password" id="passwordInput" placeholder="Password" style="margin-bottom: 5px; width: 100%; padding: 5px;">

            <label style="display: block; font-size: 12px; margin: 5px 0;">Trigger Time:</label>
            <input type="date" id="dateInput" style="margin-bottom: 5px; width: 100%; padding: 5px;">
            <input type="time" id="timeInput" style="margin-bottom: 5px; width: 100%; padding: 5px;">

            <label style="display: block; font-size: 12px; margin: 5px 0;">Golf Course:</label>
            <select id="golfCourseSelect" style="width: 100%; padding: 5px; margin-bottom: 10px;">
              <option value="" selected disabled>Select Golf Course</option>
              ${Object.entries(GOLF_COURSE_NAMES).map(([value, name]) => 
                `<option value="${value}">${name}</option>`
              ).join('')}
            </select>
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 10px;">
            <button id="confirmCredentials" style="flex: 1; padding: 8px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; transition: background-color 0.3s;">Start Automation</button>
            <button id="stopAutomation" style="flex: 1; padding: 8px; background: #6c757d; color: white; border: none; border-radius: 3px; cursor: not-allowed; opacity: 0.65;">Stop</button>
          </div>
        </div>
        <div id="status" style="margin-top: 10px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 8px;">
            <div style="margin-bottom: 4px;">Status: ${isAutomationActive ? '🟢 Active' : '⚪ Standby'}</div>
            <div style="color: #888; font-size: 11px; display: flex; flex-direction: column; gap: 2px;">
                <div>Page: <span id="currentPage">-</span></div>
                <div>Date: <span id="currentDate">-</span> | Time: <span id="currentTime">-</span></div>
            </div>
        </div>
        <div style="margin-top: 8px; font-size: 10px; color: #999; text-align: right; border-top: 1px solid #eee; padding-top: 8px;">
            Author: JOIBOI<br>2025
        </div>
      </div>
    `;
    
    const div = document.createElement('div');
    div.innerHTML = formHTML;
    document.body.appendChild(div);
    startClock(); // Start clock immediately after creating form

    // Add minimize button handler
    const minimizeBtn = document.getElementById('minimizeForm');
    const formContent = document.getElementById('formContent');
    
    minimizeBtn.addEventListener('click', () => {
        isFormVisible = !isFormVisible;
        formContent.style.display = isFormVisible ? 'block' : 'none';
        minimizeBtn.textContent = isFormVisible ? '−' : '+';
        
        // Keep status visible
        const status = document.getElementById('status');
        if (status) {
            status.style.marginTop = isFormVisible ? '10px' : '0';
            status.style.borderTop = isFormVisible ? '1px solid #eee' : 'none';
        }
        
        localStorage.setItem('formVisible', isFormVisible.toString());
    });

    // Restore previous state
    isFormVisible = localStorage.getItem('formVisible') !== 'false';
    formContent.style.display = isFormVisible ? 'block' : 'none';
    minimizeBtn.textContent = isFormVisible ? '−' : '+';

    const status = document.getElementById('status');
    if (status) {
        status.style.marginTop = isFormVisible ? '10px' : '0';
        status.style.borderTop = isFormVisible ? '1px solid #eee' : 'none';
    }

    // Modified button handlers
    const startButton = document.getElementById('confirmCredentials');
    const stopButton = document.getElementById('stopAutomation');

    if (startButton && stopButton) {
        // Start button handler
        startButton.onclick = (e) => {
            e.preventDefault();
            try {
                userName = document.getElementById('userNameInput').value;
                password = document.getElementById('passwordInput').value;
                dateTrigger = document.getElementById('dateInput').value;
                timeTrigger = document.getElementById('timeInput').value;
                selectedCourse = document.getElementById('golfCourseSelect').value;
                
                if (validateInputs()) {
                    // Update button states
                    startButton.style.backgroundColor = '#28a745';
                    startButton.textContent = 'Running...';
                    stopButton.style.backgroundColor = '#dc3545';
                    stopButton.style.opacity = '1';
                    stopButton.style.cursor = 'pointer';
                    isAutomationActive = true;
                    updateStatus('Starting automation...');
                    scheduleAutomation();
                }
            } catch (error) {
                console.error('Error starting automation:', error);
                updateStatus('Error starting automation. Please try again.');
            }
        };

        // Stop button handler
        stopButton.onclick = (e) => {
            if (!isAutomationActive) return;
            e.preventDefault();
            stopAutomation();
        };
    }
}

function validateInputs() {
    if (!userName || !password) {
        alert('Please enter login credentials');
        return false;
    }
    if (!dateTrigger || !timeTrigger) {
        alert('Please set trigger time');
        return false;
    }
    return true;
}

// Modified updateStatus function
function updateStatus(message) {
    const status = document.getElementById('status');
    if (status) {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
        
        const currentPage = getCurrentPage();
        const stateMessage = isAutomationActive ? '🟢 Active' : '⚪ Standby';
        
        status.innerHTML = `
            <div style="margin-bottom: 4px;">${message}</div>
            <div style="color: #888; font-size: 11px; display: flex; flex-direction: column; gap: 2px;">
                <div>Status: ${stateMessage}</div>
                <div>Page: ${currentPage}</div>
                <div>Date: ${dateString} | Time: ${timeString}</div>
            </div>
        `;
    }
}

function scheduleAutomation() {
    const scheduledTime = new Date(dateTrigger + 'T' + timeTrigger);
    const now = new Date();
    
    if (scheduledTime <= now) {
        alert('Please select a future date and time');
        return;
    }

    const timeUntilExecution = scheduledTime.getTime() - now.getTime();
    updateStatus(`Scheduled for ${scheduledTime.toLocaleString()}`);

    automationTimeout = setTimeout(() => {
        handleLogin();
    }, timeUntilExecution);
}

// Handle login and subsequent actions
async function handleLogin() {
    updateStatus('Starting login process...');
    const page = getCurrentPage();
    
    switch(page) {
        case 'login':
            const loginForm = document.querySelector("form");
            if (loginForm) {
                const userInput = loginForm.querySelector('input[name="membersid"]');
                const passwordInput = loginForm.querySelector('input[name="password"]');
                if (userInput && passwordInput) {
                    userInput.value = userName;
                    passwordInput.value = password;
                    const rememberCheckbox = loginForm.querySelector("input[type=checkbox]");
                    if (rememberCheckbox) rememberCheckbox.click();
                    isAutomationActive = true;
                    saveState();
                    loginForm.submit();
                }
            }
            break;
            
        case 'course-selection':
            handleGolfCourseSelection();
            break;
    }
}

function handleGolfCourseSelection() {
    updateStatus('Attempting golf course selection...');
    
    // Add debounce to prevent multiple rapid executions
    if (window.golfSelectionTimeout) {
        clearTimeout(window.golfSelectionTimeout);
    }
    
    window.golfSelectionTimeout = setTimeout(() => {
        const courseSelect = document.querySelector('select[name="golfcourse"]');
        
        if (courseSelect) {
            updateStatus('Selecting golf course...');
            
            try {
                // Select the golf course with RAF for better performance
                requestAnimationFrame(() => {
                    const courseValue = selectedCourse || GOLF_COURSES.MIDLANDS_FB;
                    courseSelect.value = courseValue;
                    
                    // Use both change and input events
                    ['change', 'input'].forEach(eventType => {
                        courseSelect.dispatchEvent(new Event(eventType, { 
                            bubbles: true,
                            cancelable: true 
                        }));
                    });
                    
                    updateStatus(`Selected course: ${GOLF_COURSE_NAMES[courseValue]}`);
                    startPolicyModalWatch();
                });
            } catch (error) {
                console.error('Error during course selection:', error);
                updateStatus('Error selecting course');
            }
        }
    }, 1500); // Debounce time
}

// Separate policy modal watching logic
function startPolicyModalWatch() {
    let attempts = 0;
    const maxAttempts = 20;
    let modalCheckInterval;

    const checkForModal = () => {
        if (attempts >= maxAttempts) {
            clearInterval(modalCheckInterval);
            updateStatus('Policy modal timeout - please try manually');
            return;
        }

        const policyModal = document.querySelector('.modal-content');
        if (policyModal) {
            clearInterval(modalCheckInterval);
            setTimeout(() => handlePolicyModal(), 500);
        }
        attempts++;
    };

    modalCheckInterval = setInterval(checkForModal, 500);
}

// Handle policy modal
function handlePolicyModal() {
    const policyModal = document.querySelector('.modal-content');
    if (policyModal) {
        updateStatus('Accepting policy...');
        setTimeout(() => {
            try {
                // Try to find the button using exact matching criteria
                const agreeButton = policyModal.querySelector('button.btn.btn-secondary[data-bs-dismiss="modal"]');
                
                if (!agreeButton) {
                    // Fallback to text content search if exact match fails
                    const allButtons = policyModal.querySelectorAll('button');
                    const policyButton = Array.from(allButtons).find(button => 
                        button.textContent.trim() === "I AGREE TO CLUB'S TERMS AND POLICIES"
                    );
                    
                    if (policyButton) {
                        policyButton.click();
                        updateStatus('Policy accepted (found by text)');
                        return;
                    }
                } else {
                    agreeButton.click();
                    updateStatus('Policy accepted (found by selector)');
                    return;
                }
                
                updateStatus('Could not find policy agreement button');
            } catch (error) {
                console.error('Error handling policy modal:', error);
                updateStatus('Error accepting policy');
            }
        }, 1000); // Increased delay to ensure modal is fully loaded
    }
}

// Add URL tracking
let lastUrl = window.location.href;

// Modified observer to prevent excessive processing
const pageObserver = new MutationObserver((mutations) => {
    if (!isAutomationActive) return;

    // Debounce observer calls
    if (window.observerTimeout) {
        clearTimeout(window.observerTimeout);
    }

    window.observerTimeout = setTimeout(() => {
        const currentUrl = window.location.href;
        const page = getPageByURL();
        
        try {
            if (currentUrl !== lastUrl) {
                console.log('URL changed to:', currentUrl);
                lastUrl = currentUrl;
                if (page === 'course-selection') {
                    setTimeout(handleGolfCourseSelection, 1000);
                }
            }
        } catch (error) {
            console.error('Error in observer:', error);
        }
    }, 250); // Debounce time
});

// Recreate form if it's missing
function ensureFormExists() {
    if (!document.getElementById('credentialForm')) {
        createCredentialForm();
        
        // Restore previously entered values if they exist
        if (userName || password || dateTrigger || timeTrigger || selectedCourse) {
            const userInput = document.getElementById('userNameInput');
            const passInput = document.getElementById('passwordInput');
            const dateInput = document.getElementById('dateInput');
            const timeInput = document.getElementById('timeInput');
            const courseInput = document.getElementById('golfCourseSelect');
            
            if (userInput) userInput.value = userName;
            if (passInput) passInput.value = password;
            if (dateInput) dateInput.value = dateTrigger;
            if (timeInput) timeInput.value = timeTrigger;
            if (courseInput) courseInput.value = selectedCourse;
            
            // Update status if automation is active
            if (isAutomationActive) {
                const button = document.getElementById('confirmCredentials');
                if (button) {
                    button.style.display = 'none';
                    stopButton.style.display = 'block';
                    button.style.backgroundColor = '#28a745';
                    button.textContent = 'Automation Started';
                    button.disabled = true;
                }
                updateStatus('Automation is running...');
            }
        }
    }
}

// Modified stop automation function
function stopAutomation() {
    try {
        // Clear all timers
        if (clockTimer) {
            clearInterval(clockTimer);
            clockTimer = null;
        }
        
        // Clear session
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(STATE_KEY);
        localStorage.removeItem(STATE_KEY);
        
        cleanupAutomation();

        // Update UI with static content
        const status = document.getElementById('status');
        if (status) {
            status.innerHTML = `
                <div style="margin-bottom: 4px;">Automation stopped</div>
                <div style="color: #888; font-size: 11px; display: flex; flex-direction: column; gap: 2px;">
                    <div>Status: ⚪ Standby</div>
                    <div>Page: ${getCurrentPage()}</div>
                    <div>Date: - | Time: -</div>
                </div>
            `;
        }

        // Update buttons
        const startButton = document.getElementById('confirmCredentials');
        const stopButton = document.getElementById('stopAutomation');
        
        if (startButton) {
            startButton.style.backgroundColor = '#007bff';
            startButton.textContent = 'Start Automation';
            startButton.disabled = false;
        }
        
        if (stopButton) {
            stopButton.style.backgroundColor = '#6c757d';
            stopButton.style.opacity = '0.65';
            stopButton.style.cursor = 'not-allowed';
        }
        
        // Disconnect and reconnect observer
        pageObserver.disconnect();
        pageObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });
    } catch (error) {
        console.error('Error stopping automation:', error);
        updateStatus('Error stopping automation');
    }
}

// Add page change handler
function handlePageTransition() {
    const currentPage = getCurrentPage();
    const state = sessionStorage.getItem(STATE_KEY);
    
    if (state) {
        const parsed = JSON.parse(state);
        if (parsed.lastPage !== currentPage && isAutomationActive) {
            console.log(`Page transition detected: ${parsed.lastPage} -> ${currentPage}`);
            if (currentPage === 'course-selection') {
                // Delay to ensure page is loaded
                setTimeout(() => {
                    handleGolfCourseSelection();
                }, 2000);
            }
            parsed.lastPage = currentPage;
            sessionStorage.setItem(STATE_KEY, JSON.stringify(parsed));
        }
    }
}

// Modified init function
function init() {
    try {
        const hasState = loadState();
        lastUrl = window.location.href;
        
        if (!hasState) {
            cleanupAutomation();
        }
        
        ensureFormExists();
        
        if (hasState && isAutomationActive) {
            handlePageTransition();
        }

        // Start observers
        startClock();
        pageObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Reduce form check frequency
setInterval(ensureFormExists, 2000); // Changed from 1000 to 2000ms

// Single initialization point
window.addEventListener('load', init);

// Add window unload handler to preserve state
window.addEventListener('beforeunload', () => {
    if (isAutomationActive) {
        saveState();
    }
});
