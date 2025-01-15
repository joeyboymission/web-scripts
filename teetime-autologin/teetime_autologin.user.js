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
    "06:00": "06:00 - mg01305-103",
    "06:08": "06:08 - HG03470-307",
    "06:16": "06:16 - mg04876-000-01",
    "06:24": "06:24 - MG01482-000",
    "06:32": "06:32 - HG04173-000",
    "06:40": "06:40 - MG04470-101",
    "06:48": "06:48 - HGN0793-106",
    "06:56": "06:56 - MG02904-000",
    "07:04": "07:04 - MG05122-000",
    "07:12": "07:12 - MG04043-000",
    "07:20": "07:20 - MG04770-300",
    "07:28": "07:28 - MG02717-000",
    "07:36": "07:36 - MG04819-000",
    "07:44": "07:44 - MG05485-000",
    "07:52": "07:52 - hg04481-000",
    "08:00": "08:00 - MG04665-000",
    "08:10": "08:10 - mg04077-000",
    "08:20": "08:20 - HG00839-306-01",
    "08:30": "08:30 - HG04333-000",
    "08:40": "08:40 - mg05178-000",
    "08:50": "08:50 - MG04546-000-01",
    "09:00": "09:00 - MG04640-000-01",
    "09:10": "09:10 - MG05706-000",
    "09:20": "09:20 - MG04717-000",
    "09:30": "09:30 - HG04373-000",
    "09:40": "09:40 - MG04546-000",
    "09:50": "09:50 - HG04385-000",
    "10:00": "10:00 - hg04745-000",
    "10:10": "10:10 - MG03134-000",
    "10:20": "10:20 - MG01447-106",
    "10:30": "10:30 - MG05051-301",
    "10:40": "10:40 - MID5099-108",
    "10:50": "10:50 - hg03386-101",
    "11:00": "11:00 - HG04536-000",
    "11:10": "11:10 - HG04168-302",
    "11:20": "11:20 - Mg03696-101",
    "11:30": "11:30 - mg04865-000",
    "11:40": "11:40 - Hg04536-000-01",
    "11:50": "11:50 - Mg04932-000",
    "12:00": "12:00 - HG04491-300-03",
    "12:10": "12:10 - HG04405-000-02",
    "12:20": "12:20 - MG04390-000",
    "12:30": "12:30 - HG04281-000",
    "12:40": "12:40 - HG04642-000",
    "12:50": "12:50 - HG03053-000-08",
    "13:00": "13:00 - MG04495-000",
    "13:10": "13:10 - HG01354-100",
    "13:20": "13:20 - HGN1848-000",
    "13:30": "13:30 - HG00839-306",
    "13:40": "13:40 - MG05524-000",
    "13:50": "13:50 - MG01488-102",
    "14:00": "14:00 - mg01943-000",
    "14:10": "14:10 - MG04852-000",
    "14:20": "14:20 - MG04626-000-01",
    "14:30": "14:30 - mg02917-000",
    "14:40": "14:40 - MG04399-000-01",
    "14:50": "14:50 - HG04180-000",
    "15:00": "15:00 - MHH0093-100",
    "15:10": "15:10 - MHH0093-100-01",
    "15:20": "15:20 - HG04513-000-04",
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
        fractionalSecondDigits: 3,
      });

      const currentPage = getCurrentPage();
      const stateMessage = isAutomationActive ? "🟢 Active" : "⚪ Standby";

      const lastMessage =
        status.querySelector(".status-message")?.textContent || "Ready";

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
  const status = document.getElementById("status");
  if (status) {
    const preserveActive = message.includes("Policy accepted");
    const stateMessage = preserveActive
      ? "🟢 Active"
      : isAutomationActive
      ? "🟢 Active"
      : "⚪ Standby";

    status.innerHTML = `
            <div class="status-message" style="margin-bottom: 4px;">${message}</div>
            <div style="color: #888; font-size: 11px; display: flex; flex-direction: column; gap: 2px;">
                <div>Status: ${stateMessage}</div>
                <div>Page: ${getCurrentPage()}</div>
                <div>Date: ${new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })} | Time: ${new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    })}</div>
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

function validateInputs() {
  const currentPage = getCurrentPage();
    
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
  
  if (currentPage === 'course-selection') {
      if (!bookingDate) {
          alert('Please select booking date');
          return false;
      }
      if (selectedTimes.length === 0) {
          alert('Please select at least one time slot');
          return false;
      }
      // Removed all member validation
  }
  
  return true;
}

// Modified updateStatus function
function updateStatus(message) {
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
      fractionalSecondDigits: 3,
    });

    const currentPage = getCurrentPage();
    const stateMessage = isAutomationActive ? "🟢 Active" : "⚪ Standby";

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

function handlePolicyModal() {
  updateStatus("Looking for policy modal...");

  try {
    const modal = document.getElementById("policy2");
    if (!modal) {
      updateStatus("Modal not found");
      return;
    }

    // Try multiple selector strategies for the button
    let agreeButton = null;

    // Strategy 1: Find button by exact selector
    agreeButton = modal.querySelector(
      'button.btn.btn-secondary[data-bs-dismiss="modal"]'
    );

    // Strategy 2: Find by text content
    if (!agreeButton) {
      const buttons = modal.querySelectorAll("button.btn.btn-secondary");
      agreeButton = Array.from(buttons).find((btn) =>
        btn.textContent.includes("I AGREE TO CLUB'S TERMS AND POLICIES")
      );
    }

    if (agreeButton) {
      updateStatus("Found policy button, attempting to close modal...");

      // Ensure Bootstrap is available
      if (typeof bootstrap !== "undefined") {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
          updateStatus("Policy accepted (bootstrap hide)");
        } else {
          // Fallback to manual modal hiding
          agreeButton.click();
          modal.style.display = "none";
          modal.classList.remove("show");
          document.body.classList.remove("modal-open");
          const backdrop = document.querySelector(".modal-backdrop");
          if (backdrop) {
            backdrop.remove();
          }
          updateStatus("Policy accepted (manual hide)");
        }
      } else {
        // Direct DOM manipulation if Bootstrap is not available
        agreeButton.click();
        modal.style.display = "none";
        modal.classList.remove("show");
        document.body.classList.remove("modal-open");
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
          backdrop.remove();
        }
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        updateStatus("Policy accepted (direct manipulation)");
      }

      // Final cleanup after slight delay
      setTimeout(() => {
        if (modal.style.display === "block") {
          // Force cleanup if modal is still visible
          modal.remove();
          const backdrop = document.querySelector(".modal-backdrop");
          if (backdrop) backdrop.remove();
          document.body.classList.remove("modal-open");
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
          updateStatus("Policy accepted (forced cleanup)");
        }
      }, 1000);

      return;
    }

    updateStatus(
      "Could not find policy agreement button - please check manually"
    );
  } catch (error) {
    console.error("Error handling policy modal:", error);
    updateStatus("Error accepting policy");
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

// Modified init function
function init() {
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
