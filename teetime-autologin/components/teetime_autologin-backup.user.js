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
let userName = "";
let password = "";
let dateTrigger = "";
let timeTrigger = "";
let selectedCourse = "";
let isAutomationActive = false;

// Add floating window state
let isFormVisible = true;

// Add stop functionality state
let automationTimeout = null;

// Add clock timer variable
let clockTimer = null;

// Add debug flag at the top with other variables
let isDebugMode = true; // Set to false when ready for production

// Golf course configuration
const GOLF_COURSES = {
  HIGHLANDS: "1", // Highlands Golf Course
  MIDLANDS_FB: "2", // Midlands Front 9 - Back 9
  MIDLANDS_BL: "3", // Midlands Back 9 - Lucky 9
  MIDLANDS_LF: "4", // Midlands Lucky 9 - Front 9
};

// Add golf course names for display
const GOLF_COURSE_NAMES = {
  1: "Highlands Golf Course",
  2: "Midlands Front 9 - Back 9",
  3: "Midlands Back 9 - Lucky 9",
  4: "Midlands Lucky 9 - Front 9",
};

// Update TIME_SLOTS constant with proper format
const TIME_SLOTS = {
  "06:00": "06:00",
  "06:08": "06:08",
  "06:16": "06:16",
  "06:24": "06:24",
  "06:32": "06:32",
  "06:40": "06:40",
  "06:48": "06:48",
  "06:56": "06:56",
  "07:04": "07:04",
  "07:12": "07:12",
  "07:20": "07:20",
  "07:28": "07:28",
  "07:36": "07:36",
  "07:44": "07:44",
  "07:52": "07:52",
  "08:00": "08:00",
  "08:10": "08:10",
  "08:20": "08:20",
  "08:30": "08:30",
  "08:40": "08:40",
  "08:50": "08:50",
  "09:00": "09:00",
  "09:10": "09:10",
  "09:20": "09:20",
  "09:30": "09:30",
  "09:40": "09:40",
  "09:50": "09:50",
  "10:00": "10:00",
  "10:10": "10:10",
  "10:20": "10:20",
  "10:30": "10:30",
  "10:40": "10:40",
  "10:50": "10:50",
  "11:00": "11:00",
  "11:10": "11:10",
  "11:20": "11:20",
  "11:30": "11:30",
  "11:40": "11:40",
  "11:50": "11:50",
  "12:00": "12:00",
  "12:10": "12:10",
  "12:20": "12:20",
  "12:30": "12:30",
  "12:40": "12:40",
  "12:50": "12:50",
  "13:00": "13:00",
  "13:10": "13:10",
  "13:20": "13:20",
  "13:30": "13:30",
  "13:40": "13:40",
  "13:50": "13:50",
  "14:00": "14:00",
  "14:10": "14:10",
  "14:20": "14:20",
  "14:30": "14:30",
  "14:40": "14:40",
  "14:50": "14:50",
  "15:00": "15:00",
  "15:10": "15:10",
  "15:20": "15:20",
  "15:30": "15:30"
};

// Add session tracking
const SESSION_KEY = "teetime_session";
const STATE_KEY = "teetime_state";

// Add new state variables
let bookingDate = '';
let selectedTimes = [];
let members = {
    member2: { firstName: '', lastName: '' },
    member3: { firstName: '', lastName: '' },
    member4: { firstName: '', lastName: '' }
};

// Add new date cycling state
let dateRetryCount = 0;
const MAX_DATE_RETRIES = 5; // Maximum number of days to try from current date

// Add date range constants
const MAX_DAYS_AHEAD = 5; // Maximum days ahead from current date

// Add delay constants
const SCAN_DELAY = 3000; // 3 seconds delay between date checks
const FORM_CHECK_DELAY = 1500; // 1.5 seconds to check for form elements

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
    timestamp: new Date().getTime(),
    bookingDate,
    selectedTimes,
    members
  };

  // Save to both session and local storage
  sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  localStorage.setItem(STATE_KEY, JSON.stringify(state));

  // Set session flag
  sessionStorage.setItem(SESSION_KEY, "active");
}

// Load automation state
function loadState() {
  // Check if we're in an active session
  const isActiveSession = sessionStorage.getItem(SESSION_KEY) === "active";

  // Get state from storage
  let state = sessionStorage.getItem(STATE_KEY);
  if (!state && isActiveSession) {
    state = localStorage.getItem(STATE_KEY);
  }

  if (state) {
    const parsed = JSON.parse(state);
    // Only restore if state is from current session or within last hour
    const isRecent = new Date().getTime() - parsed.timestamp < 3600000;

    if (isActiveSession || isRecent) {
      userName = parsed.userName || "";
      password = parsed.password || "";
      dateTrigger = parsed.dateTrigger || "";
      timeTrigger = parsed.timeTrigger || "";
      selectedCourse = parsed.selectedCourse || "";
      isAutomationActive = parsed.isAutomationActive || false;
      isFormVisible =
        parsed.isFormVisible !== undefined ? parsed.isFormVisible : true;
      // Restore new fields
      bookingDate = parsed.bookingDate || '';
      selectedTimes = parsed.selectedTimes || [];
      members = parsed.members || {
          member2: { firstName: '', lastName: '' },
          member3: { firstName: '', lastName: '' },
          member4: { firstName: '', lastName: '' }
      };
      return true;
    }
  }
  return false;
}

// Page detection
function getPageByURL() {
  const currentURL = window.location.href;
  if (currentURL.includes("/t/index.php")) {
    return "course-selection";
  } else if (currentURL.includes("tagaytayhighlands-teetime.com")) {
    return "login";
  }
  return "unknown";
}

// Modified getCurrentPage function
function getCurrentPage() {
  // First check URL
  const urlPage = getPageByURL();
  if (urlPage !== "unknown") {
    return urlPage;
  }

  // Fallback to DOM checking
  const loginForm = document.querySelector('form input[name="membersid"]');
  const courseSelect = document.querySelector('select[name="golfcourse"]');

  if (loginForm) return "login";
  if (courseSelect) return "course-selection";
  return "unknown";
}

// Add initial cleanup
function cleanupAutomation() {
  sessionStorage.removeItem("teetime_automation");
  localStorage.removeItem("teetime_automation");
  if (automationTimeout) {
    clearTimeout(automationTimeout);
  }
  isAutomationActive = false;
  userName = "";
  password = "";
  dateTrigger = "";
  timeTrigger = "";
  selectedCourse = "";
}

// Add clock update function
function startClock() {
  if (clockTimer) clearInterval(clockTimer);
  updateStatus("Ready to start automation");
  clockTimer = setInterval(() => {
    updateStatus(); // Call updateStatus without message to update time
  }, 100); // Update every 100ms for smooth time display
}

// Modified updateStatus function
function updateStatus(message = "") {
  const status = document.getElementById("status");
  if (status) {
    const now = new Date();
    const dateString = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeString = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const currentPage = getCurrentPage();
    const stateMessage = isAutomationActive ? "🟢 Active" : "⚪ Standby";
    const debugIndicator = isDebugMode ? "🔧 Debug Mode" : "";

    const lastMessage = message || status.querySelector(".status-message")?.textContent || "Ready";

    status.innerHTML = `
            <div class="status-message" style="margin-bottom: 4px;">${lastMessage}</div>
            <div style="color: #888; font-size: 11px; display: flex; flex-direction: column; gap: 2px;">
                <div>Status: ${stateMessage}</div>
                <div>Page: ${currentPage}</div>
                <div>Date: ${dateString} | Time: ${timeString}</div>
                <div>Mode: ${debugIndicator}</div>
            </div>
        `;
  }
}

// Modified createCredentialForm function
function createCredentialForm() {
  // Check if form already exists
  if (document.getElementById("credentialForm")) {
    return;
  }

const formHTML = `
        <div id="credentialForm" style="position: fixed; top: 20px; right: 20px; background: white; padding: 15px; border: 1px solid #ccc; border-radius: 5px; z-index: 99999; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 280px; max-height: 90vh; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <h3 style="margin: 0; font-size: 18px;">Automated Login and Scheduler</h3>
                <button id="minimizeForm" style="background: none; border: 1px solid #ddd; cursor: pointer; font-size: 16px; font-weight: bold; padding: 0 8px; border-radius: 4px;">−</button>
            </div>
            <div id="formContent" style="overflow-y: auto; padding-right: 5px;">
                <p style="font-size: 12px; margin-bottom: 10px; color: #666;">Please fill all required fields</p>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; font-size: 12px; margin: 5px 0;">Login Credentials:</label>
                    <input type="text" id="userNameInput" placeholder="Username" style="margin-bottom: 5px; width: 100%; padding: 5px;">
                    <input type="password" id="passwordInput" placeholder="Password" style="margin-bottom: 5px; width: 100%; padding: 5px;">

                    <label style="display: block; font-size: 12px; margin: 5px 0;">Trigger Time:</label>
                    <input type="date" id="triggerDateInput" style="margin-bottom: 5px; width: 100%; padding: 5px;">
                    <input type="time" id="timeInput" style="margin-bottom: 5px; width: 100%; padding: 5px;">

                    <label style="display: block; font-size: 12px; margin: 5px 0;">Golf Course:</label>
                    <select id="golfCourseSelect" style="width: 100%; padding: 5px; margin-bottom: 10px;">
                        <option value="" selected disabled>Select Golf Course</option>
                        ${Object.entries(GOLF_COURSE_NAMES)
                            .map(
                                ([value, name]) => `<option value="${value}">${name}</option>`
                            )
                            .join("")}
                    </select>
                </div>
                            
                <label style="display: block; font-size: 12px; margin: 5px 0;">Select Booking Date:</label>
                <input type="date" id="bookingDateInput" style="margin-bottom: 5px; width: 100%; padding: 5px;">

                <div class="time-slots" style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; margin: 5px 0;">Select Time Slots:</label>
                    <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                        ${Object.entries(TIME_SLOTS).map(([value, label]) => `
                            <label style="display: block; margin: 3px 0; font-size: 12px;">
                                <input type="checkbox" value="${value}" style="margin-right: 5px;">
                                ${label}
                            </label>
                        `).join('')}
                    </div>
                </div>

                <label style="display: block; font-size: 12px; margin: 5px 0;">Member 2:</label>
                <input type="text" id="member2Input_firstName" placeholder="First Name" style="margin-bottom: 5px; width: 100%; padding: 5px;">
                <input type="text" id="member2Input_lastName" placeholder="Last Name" style="margin-bottom: 5px; width: 100%; padding: 5px;">

                <label style="display: block; font-size: 12px; margin: 5px 0;">Member 3:</label>
                <input type="text" id="member3Input_firstName" placeholder="First Name" style="margin-bottom: 5px; width: 100%; padding: 5px;">
                <input type="text" id="member3Input_lastName" placeholder="Last Name" style="margin-bottom: 5px; width: 100%; padding: 5px;">

                <label style="display: block; font-size: 12px; margin: 5px 0;">Member 4:</label>
                <input type="text" id="member4Input_firstName" placeholder="First Name" style="margin-bottom: 5px; width: 100%; padding: 5px;">
                <input type="text" id="member4Input_lastName" placeholder="Last Name" style="margin-bottom: 5px; width: 100%; padding: 5px;">

                <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                    <button id="confirmCredentials" style="flex: 1; padding: 8px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; transition: background-color 0.3s;">Start Automation</button>
                    <button id="stopAutomation" style="flex: 1; padding: 8px; background: #6c757d; color: white; border: none; border-radius: 3px; cursor: not-allowed; opacity: 0.65;">Stop</button>
                </div>
            </div>
            <div id="status" style="margin-top: 10px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 8px;">
                    <div style="margin-bottom: 4px;">Status: ${
                        isAutomationActive ? "🟢 Active" : "⚪ Standby"
                    }</div>
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

  const div = document.createElement("div");
  div.innerHTML = formHTML;
  document.body.appendChild(div);
  startClock(); // Start clock immediately after creating form

  // Add minimize button handler
  const minimizeBtn = document.getElementById("minimizeForm");
  const formContent = document.getElementById("formContent");

  minimizeBtn.addEventListener("click", () => {
    isFormVisible = !isFormVisible;
    formContent.style.display = isFormVisible ? "block" : "none";
    minimizeBtn.textContent = isFormVisible ? "−" : "+";

    // Keep status visible
    const status = document.getElementById("status");
    if (status) {
      status.style.marginTop = isFormVisible ? "10px" : "0";
      status.style.borderTop = isFormVisible ? "1px solid #eee" : "none";
    }

    localStorage.setItem("formVisible", isFormVisible.toString());
  });

  // Restore previous state
  isFormVisible = localStorage.getItem("formVisible") !== "false";
  formContent.style.display = isFormVisible ? "block" : "none";
  minimizeBtn.textContent = isFormVisible ? "−" : "+";

  const status = document.getElementById("status");
  if (status) {
    status.style.marginTop = isFormVisible ? "10px" : "0";
    status.style.borderTop = isFormVisible ? "1px solid #eee" : "none";
  }

  // Modified button handlers
  const startButton = document.getElementById("confirmCredentials");
  const stopButton = document.getElementById("stopAutomation");

  if (startButton && stopButton) {
    // Start button handler
    startButton.onclick = (e) => {
      e.preventDefault();
      try {
        userName = document.getElementById("userNameInput").value;
        password = document.getElementById("passwordInput").value;
        dateTrigger = document.getElementById("triggerDateInput").value;
        timeTrigger = document.getElementById("timeInput").value;
        selectedCourse = document.getElementById("golfCourseSelect").value;
        bookingDate = document.getElementById("bookingDateInput").value;

        if (validateInputs()) {
          // Update button states
          startButton.style.backgroundColor = "#28a745";
          startButton.textContent = "Running...";
          stopButton.style.backgroundColor = "#dc3545";
          stopButton.style.opacity = "1";
          stopButton.style.cursor = "pointer";
          isAutomationActive = true;
          updateStatus("Starting automation...");
          scheduleAutomation();
        }
      } catch (error) {
        console.error("Error starting automation:", error);
        updateStatus("Error starting automation. Please try again.");
      }
    };

    // Stop button handler
    stopButton.onclick = (e) => {
      if (!isAutomationActive) return;
      e.preventDefault();
      stopAutomation();
    };
  }

  initializeForm(); // Initialize form after creation
}

// Validate User Inputs
function validateInputs() {
  const currentPage = getCurrentPage();
  
  // Page: login
  if (currentPage === 'login') {
      if (!userName || !password) {
          alert('Please enter login credentials');
          return false;
      }
  }
  
  if (!dateTrigger || !timeTrigger) {
      alert('Please set trigger time');
      return false;
  }
  
  // Page: course-selection
  if (currentPage === 'course-selection') {
      // Validate booking date format
      if (!bookingDate || !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
          alert('Please select a valid booking date (YYYY-MM-DD)');
          return false;
      }
      if (selectedTimes.length === 0) {
          alert('Please select at least one time slot');
          return false;
      }
  }
  
  return true;
}

function scheduleAutomation() {
  const scheduledTime = new Date(dateTrigger + "T" + timeTrigger);
  const now = new Date();

  if (scheduledTime <= now) {
    alert("Please select a future date and time");
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
  updateStatus("Starting login process...");
  const page = getCurrentPage();

  switch (page) {
    case "login":
      const loginForm = document.querySelector("form");
      if (loginForm) {
        const userInput = loginForm.querySelector('input[name="membersid"]');
        const passwordInput = loginForm.querySelector('input[name="password"]');
        if (userInput && passwordInput) {
          userInput.value = userName;
          passwordInput.value = password;
          const rememberCheckbox = loginForm.querySelector(
            "input[type=checkbox]"
          );
          if (rememberCheckbox) rememberCheckbox.click();
          isAutomationActive = true;
          saveState();
          loginForm.submit();
        }
      }
      break;

    case "course-selection":
      handleGolfCourseSelection();
      break;
  }
}

//GOLF-COURSE PAGE
// Modify handleGolfCourseSelection to handle the date setting
function handleGolfCourseSelection() {
  // Reset retry counter
  dateRetryCount = 0;
  
  updateStatus("Attempting golf course selection...");

  if (window.golfSelectionTimeout) {
    clearTimeout(window.golfSelectionTimeout);
  }

  window.golfSelectionTimeout = setTimeout(() => {
    const courseSelect = document.querySelector('select[name="golfcourse"]');
    const dateInput = document.querySelector('#golfdate2');

    if (courseSelect && dateInput) {
      updateStatus("Selecting course and date...");

      try {
        requestAnimationFrame(() => {
          // Set golf course
          const courseValue = selectedCourse || GOLF_COURSES.MIDLANDS_FB;
          courseSelect.value = courseValue;

          // Set date
          dateInput.value = bookingDate;
          dateInput.setAttribute('value', bookingDate);

          // Trigger events for both fields
          [courseSelect, dateInput].forEach(element => {
            ['change', 'input'].forEach(eventType => {
              element.dispatchEvent(new Event(eventType, {
                bubbles: true,
                cancelable: true
              }));
            });
          });

          // Special handling for date's onchange function
          if (typeof SubmitFormData2 === 'function') {
            SubmitFormData2();
          }

          updateStatus(`Selected course: ${GOLF_COURSE_NAMES[courseValue]} | Date: ${bookingDate}`);
          startPolicyModalWatch();
        });
      } catch (error) {
        console.error("Error during course/date selection:", error);
        updateStatus("Error in selection process");
      }
    }
  }, 2500);
}

function handleGolfCourseSelection() {
  updateStatus("Attempting golf course selection...");

  // Add debounce to prevent multiple rapid executions
  if (window.golfSelectionTimeout) {
    clearTimeout(window.golfSelectionTimeout);
  }

  window.golfSelectionTimeout = setTimeout(() => {
    const courseSelect = document.querySelector('select[name="golfcourse"]');

    if (courseSelect) {
      updateStatus("Selecting golf course...");

      try {
        // Select the golf course with RAF for better performance
        requestAnimationFrame(() => {
          const courseValue = selectedCourse || GOLF_COURSES.MIDLANDS_FB;
          courseSelect.value = courseValue;

          // Use both change and input events
          ["change", "input"].forEach((eventType) => {
            courseSelect.dispatchEvent(
              new Event(eventType, {
                bubbles: true,
                cancelable: true,
              })
            );
          });

          updateStatus(`Selected course: ${GOLF_COURSE_NAMES[courseValue]}`);
          startPolicyModalWatch();
        });
      } catch (error) {
        console.error("Error during course selection:", error);
        updateStatus("Error selecting course");
      }
    }
  }, 2500); // Debounce time
}

// Separate policy modal watching logic
function startPolicyModalWatch() {
  let attempts = 0;
  const maxAttempts = 30; // Increased max attempts
  let modalCheckInterval;

  const checkForModal = () => {
    if (attempts >= maxAttempts) {
      clearInterval(modalCheckInterval);
      updateStatus("Policy modal timeout - please try manually");
      return;
    }

    const modalDialog = document.querySelector(".modal-dialog-centered");
    if (modalDialog) {
      clearInterval(modalCheckInterval);
      setTimeout(() => handlePolicyModal(), 1000); // Increased delay
    }
    attempts++;
  };

  modalCheckInterval = setInterval(checkForModal, 1000); // Increased interval
}

// Updated handlePolicyModal function
function handlePolicyModal() {
    updateStatus("Handling policy modal...");

    try {
        // Get both possible modal elements
        const modal = document.getElementById("policy2");
        const modalBackdrop = document.querySelector('.modal-backdrop');
        
        if (!modal) {
            updateStatus("Modal not found");
            return;
        }

        // Find the agree button using multiple strategies
        let agreeButton = modal.querySelector('button.btn.btn-secondary[data-bs-dismiss="modal"]') ||
                         modal.querySelector('button.btn.btn-secondary:not(.btn-close)') ||
                         Array.from(modal.querySelectorAll('button')).find(btn => 
                             btn.textContent.includes("I AGREE") || 
                             btn.textContent.includes("TERMS AND POLICIES")
                         );

        if (agreeButton) {
            updateStatus("Found policy button, closing modal...");
            
            // Force click the button
            agreeButton.click();
            
            // Force cleanup after slight delay
            setTimeout(() => {
                // Remove modal
                modal.style.display = 'none';
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                
                // Remove backdrop if exists
                if (modalBackdrop) {
                    modalBackdrop.remove();
                }
                
                // Clean up body
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                
                // Additional backup cleanup
                const allBackdrops = document.querySelectorAll('.modal-backdrop');
                allBackdrops.forEach(backdrop => backdrop.remove());
                
                // If Bootstrap modal instance exists, try to hide it
                if (typeof bootstrap !== 'undefined') {
                    const bsModal = bootstrap.Modal.getInstance(modal);
                    if (bsModal) {
                        bsModal.hide();
                    }
                }
                
                updateStatus("Policy modal closed successfully");
                
                // Continue with golf course selection after modal is closed
                setTimeout(handleGolfCourseSelection, 1000);
            }, 500);
        } else {
            updateStatus("Could not find policy agreement button");
        }
    } catch (error) {
        console.error("Error handling policy modal:", error);
        updateStatus("Error handling policy modal");
    }
}

// Update startPolicyModalWatch for better reliability
function startPolicyModalWatch() {
    let attempts = 0;
    const maxAttempts = 20;
    const checkInterval = 500; // Check every 500ms
    let modalCheckInterval;

    const checkForModal = () => {
        attempts++;
        
        // Look for modal using multiple selectors
        const modalExists = document.getElementById("policy2") || 
                          document.querySelector(".modal-dialog-centered") ||
                          document.querySelector(".modal.show");

        if (modalExists) {
            clearInterval(modalCheckInterval);
            handlePolicyModal();
        } else if (attempts >= maxAttempts) {
            clearInterval(modalCheckInterval);
            updateStatus("No policy modal found after " + maxAttempts + " attempts");
        }
    };

    modalCheckInterval = setInterval(checkForModal, checkInterval);
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
        console.log("URL changed to:", currentUrl);
        lastUrl = currentUrl;
        if (page === "course-selection") {
          setTimeout(handleGolfCourseSelection, 1000);
        }
      }
    } catch (error) {
      console.error("Error in observer:", error);
    }
  }, 250); // Debounce time
});

// Recreate form if it's missing
function ensureFormExists() {
  if (!document.getElementById("credentialForm")) {
    createCredentialForm();

    // Restore previously entered values if they exist
    if (userName || password || dateTrigger || timeTrigger || selectedCourse || bookingDate) {
      const userInput = document.getElementById("userNameInput");
      const passInput = document.getElementById("passwordInput");
      const triggerDateInput = document.getElementById("triggerDateInput");
      const timeInput = document.getElementById("timeInput");
      const courseInput = document.getElementById("golfCourseSelect");
      const bookingDateInput = document.getElementById("bookingDateInput");

      if (userInput) userInput.value = userName;
      if (passInput) passInput.value = password;
      if (triggerDateInput) triggerDateInput.value = dateTrigger;
      if (timeInput) timeInput.value = timeTrigger;
      if (courseInput) courseInput.value = selectedCourse;
      if (bookingDateInput) bookingDateInput.value = bookingDate;
    }

    // Always update button states after form creation
    updateButtonStates();
  }
}

// Modified stop automation function
function stopAutomation() {
  try {
    // Preserve the last status message
    const lastStatus =
      document.querySelector(".status-message")?.textContent || "";
    const preserveStatus = lastStatus.includes("Policy accepted");

    // Clear automation timers but keep clock
    if (automationTimeout) {
      clearTimeout(automationTimeout);
      automationTimeout = null;
    }

    // Clear session data but keep state
    sessionStorage.removeItem(SESSION_KEY);

    // Partial cleanup - keep monitoring active
    userName = "";
    password = "";
    dateTrigger = "";
    timeTrigger = "";
    selectedCourse = "";

    // Update buttons
    const startButton = document.getElementById("confirmCredentials");
    const stopButton = document.getElementById("stopAutomation");

    if (startButton) {
      startButton.style.backgroundColor = "#007bff";
      startButton.textContent = "Start Automation";
      startButton.disabled = false;
      startButton.style.display = "block";
    }

    if (stopButton) {
      stopButton.style.backgroundColor = "#6c757d";
      stopButton.style.opacity = "0.65";
      stopButton.style.cursor = "not-allowed";
    }

    // Keep observer for page monitoring
    pageObserver.disconnect();
    pageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    // Update status while preserving monitoring info
    const status = document.getElementById("status");
    if (status && preserveStatus) {
      // Keep the existing message if it's "Policy accepted"
      updateStatus(lastStatus);
    } else {
      updateStatus("Automation stopped - Monitoring active");
    }

    // Keep automation active flag if policy was accepted
    isAutomationActive = preserveStatus;

    // Update button states using the common function
    updateButtonStates();
  } catch (error) {
    console.error("Error stopping automation:", error);
    updateStatus("Error stopping automation - Monitoring continues");
  }
}

// Add page change handler
function handlePageTransition() {
  const currentPage = getCurrentPage();
  const state = sessionStorage.getItem(STATE_KEY);

  if (state) {
    const parsed = JSON.parse(state);
    if (parsed.lastPage !== currentPage && isAutomationActive) {
      console.log(
        `Page transition detected: ${parsed.lastPage} -> ${currentPage}`
      );
      if (currentPage === "course-selection") {
        // Delay to ensure page is loaded
        setTimeout(() => {
          handleGolfCourseSelection();
        }, 2000);
      }
      parsed.lastPage = currentPage;
      sessionStorage.setItem(STATE_KEY, JSON.stringify(parsed));

      // Update button states after page transition
      updateButtonStates();
    }
  }
}

// Add utility function for date handling
function getNextDate(currentDate) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
}

// Add new alert handler for booking errors
function setupAlertHandler() {
    const originalAlert = window.alert;
    window.alert = function(message) {
        console.log("Alert intercepted:", message);

        // Handle booking errors
        if (message.includes("FULLY BOOKED") || message.includes("MAINTENANCE DAY")) {
            console.log(`Booking error detected: ${message}`);
            
            if (dateRetryCount < MAX_DATE_RETRIES) {
                dateRetryCount++;
                const nextDate = getNextDate(bookingDate);
                console.log(`Attempting next date: ${nextDate}`);
                
                // Update booking date
                bookingDate = nextDate;
                
                // Update UI if exists
                const dateInput = document.querySelector(input[name="golfdate2"]);
                if (dateInput) dateInput.value = nextDate;

                const timeSelect = document.querySelector('select[name="time"]');
                if (timeSelect && !timeSelect.disabled) {
                    // Time slot is available, stop scanning
                    return;
                }
                
                // Try to rebook with new date
                setTimeout(() => {
                    tryBooking(nextDate);
                }, 3000);
                
                return; // Prevent original alert
            } else {
                console.log("Maximum retry attempts reached");
                updateStatus("❌ No available dates found within retry limit");
            }
        }
        
        // Show original alert for other messages
        originalAlert.call(window, message);
    };
}

// Add new booking retry function
function tryBooking(date) {
    const dateInput = document.querySelector('#golfdate2');
    if (!dateInput) {
        console.error("Date input not found");
        return;
    }

    try {
        // Update the date input
        dateInput.value = date;
        dateInput.setAttribute('value', date);
        
        // Trigger change events
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        updateStatus(`Trying date: ${date} (Attempt ${dateRetryCount}/${MAX_DATE_RETRIES})`);

        // Add debounce delay to check time select availability
        setTimeout(() => {
            const timeSelect = document.querySelector('select[name="time"]');
            
            if (timeSelect && !timeSelect.disabled) {
                // Time select is available and enabled
                updateStatus(`Date ${date} is available for booking`);
                
                // Check if there are enabled options
                const hasEnabledOptions = Array.from(timeSelect.options)
                    .some(option => !option.disabled && option.value);
                
                if (hasEnabledOptions) {
                    updateStatus(`Found available time slots for ${date}`);
                    return true;
                }
            }
            
            // If we get here, either no time select or no enabled options
            updateStatus(`No available slots for ${date}, will try next date`);
            handleBookingError("FULLY_BOOKED");
            
        }, 5000);
        
    } catch (error) {
        console.error("Error during booking retry:", error);
        updateStatus("Error during booking retry");
    }
}

// Modified init function
function init() {
    setupAlertHandler();
    try {
        const hasState = loadState();
        lastUrl = window.location.href;

        if (!hasState) {
            cleanupAutomation();
        }

        ensureFormExists();
        updateButtonStates(); // Ensure buttons are in correct state

        if (hasState && isAutomationActive) {
            handlePageTransition();
        }

        // Start observers
        startClock();
        pageObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
        });
    } catch (error) {
        console.error("Error during initialization:", error);
    }
}

// Reduce form check frequency
setInterval(ensureFormExists, 2000); // Changed from 1000 to 2000ms

// Single initialization point
window.addEventListener("load", init);

// Add window unload handler to preserve state
window.addEventListener("beforeunload", () => {
  if (isAutomationActive) {
    saveState();
  }
});

function updateButtonStates() {
  const startButton = document.getElementById("confirmCredentials");
  const stopButton = document.getElementById("stopAutomation");

  if (startButton && stopButton) {
    if (isAutomationActive) {
      startButton.style.backgroundColor = "#28a745";
      startButton.textContent = "Running...";
      startButton.style.display = "block";
      startButton.disabled = true;
      startButton.style.pointerEvents = 'none'; // Prevent clicking
      stopButton.style.backgroundColor = "#dc3545";
      stopButton.style.opacity = "1";
      stopButton.style.cursor = "pointer";
      stopButton.disabled = false;
    } else {
      startButton.style.backgroundColor = "#007bff";
      startButton.textContent = "Start Automation";
      startButton.style.display = "block";
      startButton.disabled = false;
      startButton.style.pointerEvents = 'auto';
      stopButton.style.backgroundColor = "#6c757d";
      stopButton.style.opacity = "0.65";
      stopButton.style.cursor = "not-allowed";
      stopButton.disabled = true;
    }
  }
}

// Add function to generate time slots
function generateTimeSlots() {
  const times = [];
  for (let hour = 6; hour <= 15; hour++) {
      for (let min = 0; min < 60; min += 8) {
          if (hour === 15 && min > 30) break;
          const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          times.push(timeStr);
      }
  }
  return times;
}

// Add function to handle booking process
async function handleBooking() {
  const timeSelect = document.querySelector('select[name="time"]');
  if (!timeSelect) return;
  
  for (const timeSlot of selectedTimes) {
      try {
          const option = Array.from(timeSelect.options).find(opt => opt.value === timeSlot);
          if (option && !option.disabled) {
              timeSelect.value = timeSlot;
              timeSelect.dispatchEvent(new Event('change'));
              
              // Fill any member details that exist without validation
              Object.entries(members).forEach(([memberKey, member]) => {
                  const memberNum = memberKey.replace('member', '');
                  const firstNameInput = document.querySelector(`input[name="member${memberNum}_firstname"]`);
                  const lastNameInput = document.querySelector(`input[name="member${memberNum}_lastname"]`);
                  
                  if (firstNameInput && member.firstName) {
                      firstNameInput.value = member.firstName;
                  }
                  if (lastNameInput && member.lastName) {
                      lastNameInput.value = member.lastName;
                  }
              });

              // Debug mode check before submission
              if (isDebugMode) {
                  updateStatus(`DEBUG MODE: Would have booked ${timeSlot} - Form submission prevented`);
                  console.log('Debug mode active - Form not submitted');
                  return true;
              }
              
              updateStatus(`Booking successful for ${timeSlot}`);
              return true;
          }
      } catch (error) {
          console.error(`Error booking time slot ${timeSlot}:`, error);
      }
  }
  
  updateStatus('No available time slots found');
  return false;
}

// Add time slot selection handler
function setupTimeSlotHandlers() {
  const checkboxes = document.querySelectorAll('.time-slots input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
          const value = e.target.value;
          if (e.target.checked) {
              selectedTimes.push(value);
          } else {
              selectedTimes = selectedTimes.filter(time => time !== value);
          }
          saveState();
      });
  });
}

// Update form restoration to include time slots
function restoreFormState() {
  // Restore previous state
  isFormVisible = localStorage.getItem("formVisible") !== "false";
  formContent.style.display = isFormVisible ? "block" : "none";
  minimizeBtn.textContent = isFormVisible ? "−" : "+";

  const status = document.getElementById("status");
  if (status) {
    status.style.marginTop = isFormVisible ? "10px" : "0";
    status.style.borderTop = isFormVisible ? "1px solid #eee" : "none";
  }

  // Restore selected time slots
  if (selectedTimes.length > 0) {
      const checkboxes = document.querySelectorAll('.time-slots input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
          checkbox.checked = selectedTimes.includes(checkbox.value);
      });
  }
}

// Add this to createCredentialForm after form creation
function initializeForm() {
  setupTimeSlotHandlers();
  restoreFormState();
}

// Add alert message constants
const ALERT_MESSAGES = {
    FULLY_BOOKED: 'FULLY BOOKED. Please choose other golfcourse and date.',
    MAINTENANCE: 'MAINTENANCE DAY. Please choose other golfcourse and date.'
};

// Store the original alert only once at the top level
if (typeof window._originalAlert === 'undefined') {
    window._originalAlert = window.alert;
    
    // Override the default alert to catch specific messages
    window.alert = function(message) {
        console.log("Alert intercepted:", message);
        
        if (message === ALERT_MESSAGES.FULLY_BOOKED || message === ALERT_MESSAGES.MAINTENANCE) {
            const errorType = message === ALERT_MESSAGES.FULLY_BOOKED ? "FULLY_BOOKED" : "MAINTENANCE";
            updateStatus(`${errorType} detected - trying next day automatically`);
            handleBookingError(errorType);
            return;
        }
        
        window._originalAlert(message);
    };
}

// Add booking error handler
function handleBookingError(errorType) {
    console.log(`Booking error: ${errorType}`);
    
    // If in debug mode, show additional information
    if (isDebugMode) {
        console.log({
            course: selectedCourse,
            date: bookingDate,
            times: selectedTimes
        });
    }

    // Clear the date input on the website
    const dateInput = document.querySelector('#golfdate2');
    if (dateInput) {
        dateInput.value = '';
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Attempt to reset form state
    if (typeof SubmitFormData2 === 'function') {
        try {
            SubmitFormData2();
        } catch (error) {
            console.error("Error resetting form:", error);
        }
    }
}

// Modify handleGolfCourseSelection to include error handling
function handleGolfCourseSelection() {
    updateStatus("Attempting golf course selection...");

    if (window.golfSelectionTimeout) {
        clearTimeout(window.golfSelectionTimeout);
    }

    window.golfSelectionTimeout = setTimeout(() => {
        const courseSelect = document.querySelector('select[name="golfcourse"]');
        const dateInput = document.querySelector('#golfdate2');

        if (courseSelect && dateInput) {
            updateStatus("Selecting course and date...");

            try {
                requestAnimationFrame(() => {
                    // Set golf course
                    const courseValue = selectedCourse || GOLF_COURSES.MIDLANDS_FB;
                    courseSelect.value = courseValue;

                    // Set date with error handling
                    try {
                        dateInput.value = bookingDate;
                        dateInput.setAttribute('value', bookingDate);

                        // Trigger events for both fields
                        [courseSelect, dateInput].forEach(element => {
                            ['change', 'input'].forEach(eventType => {
                                element.dispatchEvent(new Event(eventType, {
                                    bubbles: true,
                                    cancelable: true
                                }));
                            });

                            // Special handling for date's onchange function
                            if (typeof SubmitFormData2 === 'function') {
                                SubmitFormData2();
                            }

                            updateStatus(`Selected course: ${GOLF_COURSE_NAMES[courseValue]} | Date: ${bookingDate}`);
                            startPolicyModalWatch();
                        });
                    } catch (dateError) {
                        console.error("Date selection error:", dateError);
                        updateStatus("Error setting date");
                        handleBookingError("DATE_ERROR");
                    }
                });
            } catch (error) {
                console.error("Error during course/date selection:", error);
                updateStatus("Error in selection process");
            }
        }
    }, 2500);
}

// Add date handling utilities
function getNextDay(dateString) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
}

// Modify booking error handler to try next day
function handleBookingError(errorType) {
    console.log(`Booking error: ${errorType}`);
    
    if (isDebugMode) {
        console.log({
            course: selectedCourse,
            date: bookingDate,
            times: selectedTimes,
            error: errorType
        });
    }

    // Try next day if fully booked or maintenance
    if (errorType === "FULLY_BOOKED" || errorType === "MAINTENANCE") {
        const remainingRetries = calculateRemainingRetries(bookingDate);
        
        if (remainingRetries > 0) {
            const nextDay = getNextDay(bookingDate);
            updateStatus(`${errorType}: Trying next day (${nextDay}). ${remainingRetries} days remaining to check.`);
            bookingDate = nextDay;
            
            const dateInput = document.querySelector('#golfdate2');
            if (dateInput) {
                dateInput.value = nextDay;
                dateInput.setAttribute('value', nextDay);
                
                dateInput.dispatchEvent(new Event('change', { bubbles: true }));
                if (typeof SubmitFormData2 === 'function') {
                    SubmitFormData2();
                }
            }
            
            saveState();
        } else {
            updateStatus("❌ Reached maximum date range (5 days from current date)");
            if (isDebugMode) {
                console.log("Date range exhausted");
            }
        }
        return;
    }

    // Handle other errors as before
    const dateInput = document.querySelector('#golfdate2');
    if (dateInput) {
        dateInput.value = '';
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (typeof SubmitFormData2 === 'function') {
        try {
            SubmitFormData2();
        } catch (error) {
            console.error("Error resetting form:", error);
        }
    }
}

// Add function to check if time slots are available
function checkTimeSlots() {
  const timeSelect = document.querySelector('select[name="time"]');
  if (!timeSelect) {
    if (isDebugMode) console.log("Time select element not found");
    return false;
  }

  const availableOptions = Array.from(timeSelect.options).filter(opt => 
    !opt.hasAttribute('disable') && 
    !opt.hasAttribute('disabled') &&
    !opt.disabled &&
    opt.value && 
    opt.value !== ''
  );

  if (isDebugMode) {
    console.log("Available time slots:", availableOptions.map(opt => opt.value));
  }

  if (availableOptions.length > 0) {
    updateStatus(`✅ Found ${availableOptions.length} available time slots`);
    
    // Find first available slot that matches user's selected time range
    const firstMatch = availableOptions.find(opt => {
      const slotTime = opt.value;
      return selectedTimes.some(selectedTime => slotTime >= selectedTime);
    });

    if (firstMatch) {
      updateStatus(`Found matching slot: ${firstMatch.value}`);
      if (!isDebugMode) {
        // Book the slot by setting the select value
        timeSelect.value = firstMatch.value;
        timeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    }
  }

  updateStatus("No available time slots found");
  return false;
}

// Add function to handle available time slots
function handleAvailableTimeSlots(availableOptions) {
    // Stop searching for more dates since we found available slots
    dateRetryCount = MAX_DATE_RETRIES; // This will prevent further date cycling
    
    if (isDebugMode) {
        console.log("Available times:", availableOptions.map(opt => opt.value));
    }

    // Proceed with time slot selection logic
    // ... rest of your time slot handling code ...
}
// Check if selected time slots match available options
const foundSlots = selectedTimes.filter(selectedTime => {
    return availableOptions.some(opt => opt.value.startsWith(selectedTime));
});

if (foundSlots.length > 0) {
    updateStatus(`✅ Found ${foundSlots.length} matching time slots`);
    
    // If in debug mode, don't actually book
    if (isDebugMode) {
        console.log("Debug mode: Would book these slots:", foundSlots);
        return;
    }

    // Try to book the first available matching slot
    const timeSelect = document.querySelector('#eightminutes');
    if (timeSelect) {
        const slotToBook = foundSlots[0];
        const matchingOption = availableOptions.find(opt => opt.value.startsWith(slotToBook));
        
        if (matchingOption) {
            timeSelect.value = matchingOption.value;
            timeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Fill in member details if provided
            Object.entries(members).forEach(([memberKey, member]) => {
                if (member.firstName || member.lastName) {
                    const memberNum = memberKey.replace('member', '');
                    const firstNameInput = document.querySelector(`input[name="member${memberNum}_firstname"]`);
                    const lastNameInput = document.querySelector(`input[name="member${memberNum}_lastname"]`);
                    
                    if (firstNameInput) firstNameInput.value = member.firstName;
                    if (lastNameInput) firstNameInput.value = member.lastName;
                }
            });

            // Submit the booking
            const bookingForm = document.querySelector('form[name="theform"]');
            if (bookingForm) {
                updateStatus("📝 Submitting booking...");
            }
        }
    }
} else {
    updateStatus("No matching time slots available");
    handleBookingError("NO_MATCHING_SLOTS");
}

// Modify tryBooking to include time slot check
function tryBooking(date) {
    const dateInput = document.querySelector('#golfdate2');
    if (!dateInput) return;

    try {
        dateInput.value = date;
        dateInput.setAttribute('value', date);
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));

        // Add delay to wait for time slots to load
        setTimeout(() => {
            if (checkTimeSlots()) {
                updateStatus("Found available date and time slots");
            } else {
                // If no time slots available, treat as fully booked
                handleBookingError("FULLY_BOOKED");
            }
        }, 1000);

    } catch (error) {
        console.error("Error during booking retry:", error);
        updateStatus("Error checking availability");
    }
}

// Add utility function to check date range
function calculateRemainingRetries(selectedDate) {
    const currentDate = new Date();
    const maxDate = new Date(currentDate);
    maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);
    
    const selected = new Date(selectedDate);
    const daysRemaining = Math.floor((maxDate - selected) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysRemaining);
}

// Add delay utility function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Modify tryBooking to wait for time slots element
async function tryBooking(date) {
    const dateInput = document.querySelector('#golfdate2');
    if (!dateInput) {
        console.error("Date input not found");
        return;
    }

    try {
        // Update the date input
        dateInput.value = date;
        dateInput.setAttribute('value', date);
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Call the website's form submit function
        if (typeof SubmitFormData2 === 'function') {
            SubmitFormData2();
        }
        
        updateStatus(`Checking availability for ${date}...`);
        
        // Wait for time slots to load (3 seconds)
        await delay(3000);
        
        // Check for time slots element
        const timeSelect = document.querySelector('#eightminutes');
        if (timeSelect) {
            // Element exists, check for available slots
            const availableSlots = Array.from(timeSelect.options).filter(opt => 
                !opt.disabled && opt.value && opt.value !== ''
            );

            if (availableSlots.length > 0) {
                updateStatus(`✅ Date ${date} is available with ${availableSlots.length} time slots`);
                handleAvailableTimeSlots(availableSlots);
                return true;
            }
        }
        
        // If we get here, either no time select element or no available slots
        updateStatus(`No available slots for ${date}, trying next day...`);
        handleBookingError("FULLY_BOOKED");
        
    } catch (error) {
        console.error("Error during booking retry:", error);
        updateStatus("Error checking availability");
    }
}

// Modify handleBookingError for better flow
async function handleBookingError(errorType) {
  console.log(`Booking error: ${errorType}`);
  
  if (errorType === "FULLY_BOOKED" || errorType === "MAINTENANCE") {
    const remainingRetries = calculateRemainingRetries(bookingDate);
    
    if (remainingRetries > 0) {
      const nextDay = getNextDay(bookingDate);
      updateStatus(`${errorType}: Will try next day (${nextDay}) in 3 seconds...`);
      bookingDate = nextDay;
      
      // Wait before trying next date
      await delay(3000);
      
      // Try booking with new date
      tryBooking(nextDay);
    } else {
      updateStatus("❌ Reached maximum date range (5 days from current date)");
      if (isDebugMode) {
        console.log("Date range exhausted");
      }
    }
    return;
  }

  // Handle other errors
  const dateInput = document.querySelector('#golfdate2');
  if (dateInput) {
    dateInput.value = '';
    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Reset form if possible
  if (typeof SubmitFormData2 === 'function') {
    try {
      SubmitFormData2();
      updateStatus(`Error handled: ${errorType}`);
    } catch (error) {
      console.error("Error resetting form:", error);
      updateStatus("Failed to reset form after error");
    }
  }

  // Save current state
  saveState();
}

// Modify handleAvailableTimeSlots to process found slots
function handleAvailableTimeSlots(availableOptions) {
    // Stop date cycling since we found available slots
    dateRetryCount = MAX_DATE_RETRIES;
    
    if (isDebugMode) {
        console.log("Available times:", availableOptions.map(opt => opt.value));
    }

    // Check if any of our selected times match available slots
    const foundSlots = selectedTimes.filter(selectedTime => 
        availableOptions.some(opt => opt.value === selectedTime)
    );

    if (foundSlots.length > 0) {
        updateStatus(`✅ Found ${foundSlots.length} matching time slots`);
        // Process booking if not in debug mode
        if (!isDebugMode) {
            processBooking(foundSlots[0]);
        }
    } else {
        updateStatus("Selected time slots not available for this date");
    }
}

// Add new function to process actual booking
async function processBooking(timeSlot) {
    const timeSelect = document.querySelector('select[name="time"]');
    if (!timeSelect) return;

    try {
        timeSelect.value = timeSlot;
        timeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Fill member details
        await fillMemberDetails();
        
        updateStatus(`🎯 Ready to book slot: ${timeSlot}`);
        
        // Submit form if not in debug mode
        if (!isDebugMode) {
            const form = document.querySelector('form[name="theform"]');
            if (form) {
                form.submit();
            }
        }
    } catch (error) {
        console.error("Error during booking process:", error);
        updateStatus("Error processing booking");
    }
}

// Add function to check for alert messages
function waitForAlertOrForm() {
    return new Promise((resolve) => {
        let checkCount = 0;
        const maxChecks = 6; // Check for 3 seconds total (500ms * 6)
        
        const interval = setInterval(() => {
            checkCount++;
            
            // Check for the time slots form group
            const formGroup = document.querySelector('.form-group select[name="time"]');
            if (formGroup) {
                clearInterval(interval);
                resolve({ type: 'form', element: formGroup });
                return;
            }
            
            // If we've checked enough times without finding anything
            if (checkCount >= maxChecks) {
                clearInterval(interval);
                resolve({ type: 'timeout' });
            }
        }, 500);
    });
}

// Modify tryBooking to handle the scanning process
async function tryBooking(date) {
    updateStatus(`Checking date: ${date}...`);
    
    const dateInput = document.querySelector('#golfdate2');
    if (!dateInput) {
        console.error("Date input not found");
        return;
    }

    try {
        // Update the date input
        dateInput.value = date;
        dateInput.setAttribute('value', date);
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        if (typeof SubmitFormData2 === 'function') {
            SubmitFormData2();
        }

        // Wait for either an alert or the form to appear
        const result = await waitForAlertOrForm();
        
        if (result.type === 'form') {
            // Time slots form appeared - date is available
            updateStatus(`✅ Found available date: ${date}`);
            const timeSelect = result.element;
            
            // Check if any time slots are actually available (not disabled)
            const availableSlots = Array.from(timeSelect.options)
                .filter(opt => !opt.disabled && opt.value && opt.value !== '');
            
            if (availableSlots.length > 0) {
                updateStatus(`Found ${availableSlots.length} available time slots`);
                handleAvailableTimeSlots(availableSlots);
                return true;
            }
        }
        
        // If we get here, either got a timeout or no available slots
        updateStatus(`No available slots for ${date}, trying next day...`);
        await delay(SCAN_DELAY);
        
        if (dateRetryCount < MAX_DATE_RETRIES) {
            dateRetryCount++;
            const nextDay = getNextDay(date);
            tryBooking(nextDay);
        } else {
            updateStatus("❌ Reached maximum date range");
        }
        
    } catch (error) {
        console.error("Error during date check:", error);
        updateStatus("Error checking date availability");
    }
}

// Modify alert handler to work with the new scanning process
if (typeof window._originalAlert === 'undefined') {
    window._originalAlert = window.alert;
    
    window.alert = function(message) {
        console.log("Alert intercepted:", message);
        
        if (message === ALERT_MESSAGES.FULLY_BOOKED || message === ALERT_MESSAGES.MAINTENANCE) {
            const errorType = message === ALERT_MESSAGES.FULLY_BOOKED ? "FULLY_BOOKED" : "MAINTENANCE";
            updateStatus(`${errorType} detected for current date`);            
            return;
        }
        
        window._originalAlert.call(window, message);
    };
}

// Add new function to start the booking process
async function startDateScanning() {
    dateRetryCount = 0;
    updateStatus("Starting date scan...");
    
    // Calculate maximum allowed date
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);
    
    // Check if selected date is within range
    const selectedDate = new Date(bookingDate);
    if (selectedDate > maxDate) {
        updateStatus("❌ Selected date is beyond the 5-day limit");
        return;
    }
    
    // Start scanning from selected date
    tryBooking(bookingDate);
}

// Modify handleGolfCourseSelection to use the new scanning process
function handleGolfCourseSelection() {
    updateStatus("Preparing course selection...");
    
    if (window.golfSelectionTimeout) {
        clearTimeout(window.golfSelectionTimeout);
    }

    window.golfSelectionTimeout = setTimeout(() => {
        const courseSelect = document.querySelector('select[name="golfcourse"]');
        
        if (courseSelect) {
            try {
                // Set golf course first
                const courseValue = selectedCourse || GOLF_COURSES.MIDLANDS_FB;
                courseSelect.value = courseValue;
                courseSelect.dispatchEvent(new Event('change', { bubbles: true }));
                
                updateStatus(`Selected course: ${GOLF_COURSE_NAMES[courseValue]}`);
                
                // Start the date scanning process
                startDateScanning();
                
            } catch (error) {
                console.error("Error in course selection:", error);
                updateStatus("Error selecting course");
            }
        }
    }, 1500);
}

// Modify the handleAvailableTimeSlots function
function handleAvailableTimeSlots(timeSelect) {
    if (!timeSelect) return false;
    
    // Get all options and filter for available ones (not disabled)
    const options = Array.from(timeSelect.options);
    const availableSlots = options.filter(opt => 
        !opt.disabled && 
        opt.value && 
        !opt.hasAttribute('disabled')
    );

    if (isDebugMode) {
        console.log("All available slots:", availableSlots.map(opt => opt.value));
    }

    // Get user's selected time range
    const selectedTimeRange = selectedTimes.sort();
    if (selectedTimeRange.length === 0) {
        updateStatus("No time range selected");
        return false;
    }

    const rangeStart = selectedTimeRange[0];
    const rangeEnd = selectedTimeRange[selectedTimeRange.length - 1];

    // Find first available slot within user's selected range
    const matchingSlot = availableSlots.find(opt => {
        const slotTime = opt.value;
        return slotTime >= rangeStart && slotTime <= rangeEnd;
    });

    if (matchingSlot) {
        updateStatus(`Found available slot: ${matchingSlot.value}`);
        if (!isDebugMode) {
            // Select the time slot
            timeSelect.value = matchingSlot.value;
            timeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        } else {
            console.log(`Debug mode: Would select time slot ${matchingSlot.value}`);
            return true;
        }
    } else {
        updateStatus(`No available slots between ${rangeStart} and ${rangeEnd}`);
        return false;
    }
}

// Modify the checkTimeSlots function
async function checkTimeSlots() {
    const timeSelect = document.querySelector('select[name="time"]');
    if (!timeSelect) {
        updateStatus("Time selection not found");
        return false;
    }

    // Add small delay to ensure options are loaded
    await delay(1000);

    return handleAvailableTimeSlots(timeSelect);
}

// Modify tryBooking to use the new time slot checking
async function tryBooking(date) {
    const dateInput = document.querySelector('#golfdate2');
    if (!dateInput) return false;

    try {
        dateInput.value = date;
        dateInput.setAttribute('value', date);
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        if (typeof SubmitFormData2 === 'function') {
            SubmitFormData2();
        }

        // Wait for time slots to load
        await delay(2000);
        
        const success = await checkTimeSlots();
        if (success) {
            // Stop trying more dates since we found an available slot
            dateRetryCount = MAX_DATE_RETRIES;
            return true;
        }

        // If no success, try next date
        if (dateRetryCount < MAX_DATE_RETRIES) {
            dateRetryCount++;
            const nextDay = getNextDay(date);
            await delay(1000); // Add delay between attempts
            return tryBooking(nextDay);
        } else {
            updateStatus("❌ No available slots found within date range");
            return false;
        }

    } catch (error) {
        console.error("Error during booking retry:", error);
        updateStatus("Error checking availability");
        return false;
    }
}

