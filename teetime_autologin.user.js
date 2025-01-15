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

// Add to top of file after UserScript block
/* global bootstrap */

// Core variables
let userName = "", password = "", dateTrigger = "", timeTrigger = "", selectedCourse = "";
let isAutomationActive = false, isFormVisible = true;
let automationTimeout = null, clockTimer = null;
let formContentElement = null, minimizeBtnElement = null;
let bookingDate = "", selectedTimes = [];
let numberOfMembers = 2;
let members = {
    member2: { firstName: '', lastName: '' },
    member3: { firstName: '', lastName: '' }
};

// Constants
const SESSION_KEY = "teetime_session";
const STATE_KEY = "teetime_state";
const MEMBER_OPTIONS = {
    2: "2 Members",
    3: "3 Members"
};

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
  "15:30": "15:30",
};

// Form Element Management
function initializeFormElements() {
    formContentElement = document.getElementById('formContent');
    minimizeBtnElement = document.getElementById('minimizeForm');
    
    if (!formContentElement || !minimizeBtnElement) return;
    
    setupTimeSlotHandlers();
    setupDateTimeValidation();
    setupMemberFields();
    restoreFormState();
}

function setupMemberFields() {
    const memberSelect = document.getElementById('memberSelect');
    if (!memberSelect) return;
    
    memberSelect.value = '2';
    numberOfMembers = 2;
    updateMemberVisibility(2);
    
    memberSelect.addEventListener('change', (e) => {
        const count = parseInt(e.target.value);
        numberOfMembers = count;
        updateMemberVisibility(count);
        saveState();
    });
}

function updateMemberVisibility(count) {
    ['member2', 'member3'].forEach((member, index) => {
        const fields = [
            document.getElementById(`${member}Input_firstName`),
            document.getElementById(`${member}Input_lastName`),
            document.querySelector(`label[for="${member}Input_firstName"]`)
        ];
        const shouldShow = index + 2 <= count;
        fields.forEach(el => {
            if (el) el.style.display = shouldShow ? 'block' : 'none';
        });
    });
}

// Button State Management
function updateButtonStates() {
    const startButton = document.getElementById('confirmCredentials');
    const stopButton = document.getElementById('stopAutomation');
    
    if (!startButton || !stopButton) return;
    
    const buttonStates = isAutomationActive ? {
        start: {
            backgroundColor: '#28a745',
            text: 'Running...',
            disabled: true,
            pointerEvents: 'none'
        },
        stop: {
            backgroundColor: '#dc3545',
            opacity: '1',
            cursor: 'pointer',
            disabled: false
        }
    } : {
        start: {
            backgroundColor: '#007bff',
            text: 'Start Automation',
            disabled: false,
            pointerEvents: 'auto'
        },
        stop: {
            backgroundColor: '#6c757d',
            opacity: '0.65',
            cursor: 'not-allowed',
            disabled: true
        }
    };

    Object.assign(startButton.style, {
        backgroundColor: buttonStates.start.backgroundColor,
        pointerEvents: buttonStates.start.pointerEvents
    });
    startButton.textContent = buttonStates.start.text;
    startButton.disabled = buttonStates.start.disabled;

    Object.assign(stopButton.style, {
        backgroundColor: buttonStates.stop.backgroundColor,
        opacity: buttonStates.stop.opacity,
        cursor: buttonStates.stop.cursor
    });
    stopButton.disabled = buttonStates.stop.disabled;

    setFormFieldsState(isAutomationActive);
}

// Form State Management
function saveState() {
    const state = {
        userName, password, dateTrigger, timeTrigger, selectedCourse,
        isAutomationActive, isFormVisible, bookingDate, selectedTimes,
        members, numberOfMembers,
        lastPage: getCurrentPage(),
        timestamp: new Date().getTime()
    };
    
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    sessionStorage.setItem(SESSION_KEY, 'active');
}

function loadState() {
    const isActiveSession = sessionStorage.getItem(SESSION_KEY) === 'active';
    let state = sessionStorage.getItem(STATE_KEY);
    if (!state && isActiveSession) {
        state = localStorage.getItem(STATE_KEY);
    }
    
    if (state) {
        try {
            const parsed = JSON.parse(state);
            if (new Date().getTime() - parsed.timestamp < 3600000) {
                Object.assign(window, parsed);
                return true;
            }
        } catch (error) {
            console.error('Error loading state:', error);
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

// Single updateStatus function
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
    const preserveActive = message.includes("Policy accepted");

    status.innerHTML = `
            <div class="status-message" style="margin-bottom: 4px;">${message}</div>
            <div style="color: #888; font-size: 11px; display: flex; flex-direction: column; gap: 2px;">
                <div>Status: ${
                  preserveActive ? "🟢 Active" : stateMessage
                }</div>
                <div>Page: ${currentPage}</div>
                <div>Date: ${dateString} | Time: ${timeString}</div>
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

                    <label style="display: block; font-size: 12px; margin: 5px 0;">Trigger Date Time:</label>
                    <input type="date" id="dateInput" style="margin-bottom: 5px; width: 100%; padding: 5px;">
                    <input type="time" id="timeInput" style="margin-bottom: 5px; width: 100%; padding: 5px;">

                    <label style="display: block; font-size: 12px; margin: 5px 0;">Golf Course:</label>
                    <select id="golfCourseSelect" style="width: 100%; padding: 5px; margin-bottom: 10px;">
                        <option value="" selected disabled>Select Golf Course</option>
                        ${Object.entries(GOLF_COURSE_NAMES)
                          .map(
                            ([value, name]) =>
                              `<option value="${value}">${name}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                            
                <label style="display: block; font-size: 12px; margin: 5px 0;">Select Date:</label>
                <input type="date" id="dateInput" style="margin-bottom: 5px; width: 100%; padding: 5px;">

                <div class="time-slots" style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; margin: 5px 0;">Select Time Slots:</label>
                    <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                        ${Object.entries(TIME_SLOTS)
                          .map(
                            ([value, label]) => `
                            <label style="display: block; margin: 3px 0; font-size: 12px;">
                                <input type="checkbox" value="${value}" style="margin-right: 5px;">
                                ${label}
                            </label>
                        `
                          )
                          .join("")}
                    </div>
                </div>

                <label style="display: block; font-size: 12px; margin: 5px 0;">Number of Members:</label>
                <select id="memberSelect" style="width: 100%; padding: 5px; margin-bottom: 10px;">
                        <option value="2">2 Members</option>
                        <option value="3">3 Members</option>
                </select>

                <div id="memberFields">
                    <div id="member2Fields">
                        <label for="member2Input_firstName" style="display: block; font-size: 12px; margin: 5px 0;">Member 2:</label>
                        <input type="text" id="member2Input_firstName" placeholder="First Name" style="margin-bottom: 5px; width: 100%; padding: 5px;">
                        <input type="text" id="member2Input_lastName" placeholder="Last Name" style="margin-bottom: 15px; width: 100%; padding: 5px;">
                    </div>

                    <div id="member3Fields">
                        <label for="member3Input_firstName" style="display: block; font-size: 12px; margin: 5px 0;">Member 3:</label>
                        <input type="text" id="member3Input_firstName" placeholder="First Name" style="margin-bottom: 5px; width: 100%; padding: 5px;">
                        <input type="text" id="member3Input_lastName" placeholder="Last Name" style="margin-bottom: 15px; width: 100%; padding: 5px;">
                    </div>
                    
                    // by default the member4Fields is hidden not unless specified in the memberSelect
                    <div id="member4Fields" style="display: none;">
                        <label for="member3Input_firstName" style="display: block; font-size: 12px; margin: 5px 0;">Member 3:</label>
                        <input type="text" id="member4Input_firstName" placeholder="First Name" style="margin-bottom: 5px; width: 100%; padding: 5px;">
                        <input type="text" id="member4Input_lastName" placeholder="Last Name" style="margin-bottom: 15px; width: 100%; padding: 5px;">
                    </div>
                </div>

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
        dateTrigger = document.getElementById("dateInput").value;
        timeTrigger = document.getElementById("timeInput").value;
        selectedCourse = document.getElementById("golfCourseSelect").value;

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

  if (currentPage === "login") {
    if (!userName || !password) {
      alert("Please enter login credentials");
      return false;
    }
  }

  if (!dateTrigger || !timeTrigger) {
    alert("Please set trigger time");
    return false;
  }

  if (currentPage === "course-selection") {
    if (!bookingDate) {
      alert("Please select booking date");
      return false;
    }
    if (selectedTimes.length === 0) {
      alert("Please select at least one time slot");
      return false;
    }
    // Validate required members based on numberOfMembers
    for (let i = 2; i <= numberOfMembers; i++) {
      if (!members[`member${i}`].firstName || !members[`member${i}`].lastName) {
        alert(`Please enter details for Member ${i}`);
        return false;
      }
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
function handleLoginProcess() {
  updateStatus("Starting login process...");
  const page = getCurrentPage();

  switch (page) {
    case "login": {
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
          updateStatus("Login simulation completed");
        }
      }
      break;
    }
    case "course-selection": {
      handleGolfCourseSelection();
      break;
    }
    default:
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
    if (userName || password || dateTrigger || timeTrigger || selectedCourse) {
      const userInput = document.getElementById("userNameInput");
      const passInput = document.getElementById("passwordInput");
      const dateInput = document.getElementById("dateInput");
      const timeInput = document.getElementById("timeInput");
      const courseInput = document.getElementById("golfCourseSelect");

      if (userInput) userInput.value = userName;
      if (passInput) passInput.value = password;
      if (dateInput) dateInput.value = dateTrigger;
      if (timeInput) timeInput.value = timeTrigger;
      if (courseInput) courseInput.value = selectedCourse;
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

// Single updateButtonStates function
function updateButtonStates() {
  const startButton = document.getElementById("confirmCredentials");
  const stopButton = document.getElementById("stopAutomation");

  if (startButton && stopButton) {
    if (isAutomationActive) {
      startButton.style.backgroundColor = "#28a745";
      startButton.textContent = "Running...";
      startButton.disabled = true;
      startButton.style.pointerEvents = "none";
      stopButton.style.backgroundColor = "#dc3545";
      stopButton.style.opacity = "1";
      stopButton.style.cursor = "pointer";
      stopButton.disabled = false;
      setFormFieldsState(true);
    } else {
      startButton.style.backgroundColor = "#007bff";
      startButton.textContent = "Start Automation";
      startButton.disabled = false;
      startButton.style.pointerEvents = "auto";
      stopButton.style.backgroundColor = "#6c757d";
      stopButton.style.opacity = "0.65";
      stopButton.style.cursor = "not-allowed";
      stopButton.disabled = true;
      setFormFieldsState(false);
    }
  }
}

// Add function to generate time slots
function generateTimeSlots() {
  const times = [];
  for (let hour = 6; hour <= 15; hour++) {
    for (let min = 0; min < 60; min += 8) {
      if (hour === 15 && min > 30) break;
      const timeStr = `${hour.toString().padStart(2, "0")}:${min
        .toString()
        .padStart(2, "0")}`;
      times.push(timeStr);
    }
  }
  return times;
}

// Add member field visibility toggle
function updateMemberFields() {
  const memberFields = document.querySelectorAll('[id^="member"]');
  memberFields.forEach((field) => {
    const memberNum = parseInt(field.id.match(/\d/)[0]);
    field.style.display = memberNum <= numberOfMembers ? "block" : "none";
  });
}

// Add function to handle booking process
async function handleBooking() {
  const timeSelect = document.querySelector('select[name="time"]');
  if (!timeSelect) return;

  for (const timeSlot of selectedTimes) {
    try {
      const option = Array.from(timeSelect.options).find(
        (opt) => opt.value === timeSlot
      );
      if (option && !option.disabled) {
        timeSelect.value = timeSlot;
        timeSelect.dispatchEvent(new Event("change"));

        // Fill member details
        for (let i = 2; i <= numberOfMembers; i++) {
          const member = members[`member${i}`];
          const firstNameInput = document.querySelector(
            `input[name="member${i}_firstname"]`
          );
          const lastNameInput = document.querySelector(
            `input[name="member${i}_lastname"]`
          );

          if (firstNameInput && lastNameInput) {
            firstNameInput.value = member.firstName;
            lastNameInput.value = member.lastName;
          }
        }

        updateStatus(`Booking successful for ${timeSlot}`);
        return true;
      }
    } catch (error) {
      console.error(`Error booking time slot ${timeSlot}:`, error);
    }
  }

  updateStatus("No available time slots found");
  return false;
}

// Add time slot selection handler
function setupTimeSlotHandlers() {
  const checkboxes = document.querySelectorAll(
    '.time-slots input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        selectedTimes.push(value);
      } else {
        selectedTimes = selectedTimes.filter((time) => time !== value);
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
    const checkboxes = document.querySelectorAll(
      '.time-slots input[type="checkbox"]'
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = selectedTimes.includes(checkbox.value);
    });
  }
}

// Add this to createCredentialForm after form creation
function initializeFormElements() {
  const formContentEl = document.getElementById("formContent");
  const minimizeBtnEl = document.getElementById("minimizeForm");

  if (formContentEl && minimizeBtnEl) {
    setupTimeSlotHandlers();
    setupDateTimeValidation();
    restoreFormState(formContentEl, minimizeBtnEl);

    const memberSelect = document.getElementById("memberSelect");
    if (memberSelect) {
      memberSelect.value = "2";
      updateMemberFields(2);

      memberSelect.addEventListener("change", (e) => {
        updateMemberFields(parseInt(e.target.value));
      });
    }
  }
}

// Add field disable function
function setFormFieldsState(disabled) {
  const fields = [
    "userNameInput",
    "passwordInput",
    "dateInput",
    "timeInput",
    "golfCourseSelect",
    "bookingDateInput",
    "memberSelect",
    "member2Input_firstName",
    "member2Input_lastName",
    "member3Input_firstName",
    "member3Input_lastName",
    "member4Input_firstName",
    "member4Input_lastName",
  ];

  fields.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.disabled = disabled;
    }
  });

  // Disable all time slot checkboxes
  const checkboxes = document.querySelectorAll(
    '.time-slots input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.disabled = disabled;
  });
}

// Update member fields visibility based on selection
// Member visibility function
// by default the "Number of Members" select has 2 options: 2 and 3
// and it is selected already at "2 Members"
// Therefore it will display the "Member 2: " and "Member 3: " fields by default
// and hide the "Member 4: " fields
// If the "Number of Members" select the "3 Members" option, it will display the "Member 4: " fields
function updateMemberFields(memberCount) {
  const memberFields = {
    2: ["member2, ", "member3, "],
    3: ["member2", "member3, ", "member4, "],
  };

  // Hide the member 4 first as the default selected Number of memers is 2
  ["member4"].forEach((member) => {
    const firstNameInput = document.getElementById(`${member}Input_firstName`);
    const lastNameInput = document.getElementById(`${member}Input_lastName`);
    const label = document.querySelector(
      `label[for="${member}Input_firstName"]`
    );

    if (firstNameInput && lastNameInput && label) {
      firstNameInput.style.display = "none";
      lastNameInput.style.display = "none";
      label.style.display = "none";
    }
  });

  // Show only relevant member fields
  const fieldsToShow = memberFields[memberCount] || [];
  fieldsToShow.forEach((member) => {
    const firstNameInput = document.getElementById(`${member}Input_firstName`);
    const lastNameInput = document.getElementById(`${member}Input_lastName`);
    const label = document.querySelector(
      `label[for="${member}Input_firstName"]`
    );

    if (firstNameInput && lastNameInput && label) {
      firstNameInput.style.display = "block";
      lastNameInput.style.display = "block";
      label.style.display = "block";
    }
  });
}

// Add date/time validation
function setupDateTimeValidation() {
  const dateInput = document.getElementById("dateInput");
  const timeInput = document.getElementById("timeInput");
  const bookingDateInput = document.getElementById("bookingDateInput");

  if (dateInput && timeInput && bookingDateInput) {
    // Set minimum date to today
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    dateInput.min = todayStr;
    bookingDateInput.min = todayStr;

    // Validate selected datetime
    dateInput.addEventListener("change", validateDateTime);
    timeInput.addEventListener("change", validateDateTime);
    bookingDateInput.addEventListener("change", validateDateTime);
  }
}

function validateDateTime() {
  const dateInput = document.getElementById("dateInput");
  const timeInput = document.getElementById("timeInput");
  const now = new Date();
  const selected = new Date(dateInput.value + "T" + timeInput.value);

  // Add 1 minute to current time for minimum valid selection
  const minValidTime = new Date(now.getTime() + 60000);

  if (selected <= minValidTime) {
    alert("Please select a future time (at least 1 minute ahead)");
    timeInput.value = "";
    return false;
  }

  return true;
}

// Remove form submit
function handleLogin() {
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
          // Removed submit() call for testing
          updateStatus("Login simulation completed");
        }
      }
      break;

    case "course-selection":
      handleGolfCourseSelection();
      break;
  }
}

// Update member fields visibility handler
function updateMemberFields(memberCount) {
  // Hide all member fields by default
  const allMemberFields = document.querySelectorAll('[id^="member"]');
  const allMemberLabels = document.querySelectorAll('label[for^="member"]');

  allMemberFields.forEach((field) => (field.style.display = "none"));
  allMemberLabels.forEach((label) => (label.style.display = "none"));

  // Show only relevant fields based on member count
  if (memberCount >= 2) {
    // Always show Member 2
    document.getElementById("member2Input_firstName").style.display = "block";
    document.getElementById("member2Input_lastName").style.display = "block";
    document.querySelector(
      'label[for="member2Input_firstName"]'
    ).style.display = "block";
  }

  if (memberCount >= 3) {
    // Show Member 3
    document.getElementById("member3Input_firstName").style.display = "block";
    document.getElementById("member3Input_lastName").style.display = "block";
    document.querySelector(
      'label[for="member3Input_firstName"]'
    ).style.display = "block";
  }
}

// Update form HTML for member select
const memberSelectHTML = `
    <select id="memberSelect" style="width: 100%; padding: 5px; margin-bottom: 10px;">
        <option value="2" selected>2 Members</option>
        <option value="3">3 Members</option>
    </select>
`;

// Update initialization
function initializeFormElements() {
  const formContentEl = document.getElementById("formContent");
  const minimizeBtnEl = document.getElementById("minimizeForm");

  if (formContentEl && minimizeBtnEl) {
    setupTimeSlotHandlers();
    setupDateTimeValidation();
    restoreFormState(formContentEl, minimizeBtnEl);

    // Initialize member fields
    const memberSelect = document.getElementById("memberSelect");
    if (memberSelect) {
      // Set default value
      memberSelect.value = "2";
      numberOfMembers = 2;

      // Initial visibility update
      updateMemberFields(2);

      // Add change listener
      memberSelect.addEventListener("change", (e) => {
        const count = parseInt(e.target.value);
        numberOfMembers = count;
        updateMemberFields(count);
        saveState();
      });
    }
  }
}


// Add form element references
let formContentElement = null;
let minimizeBtnElement = null;

// Update form restoration with proper element references
function restoreFormState() {
  if (!formContentElement || !minimizeBtnElement) {
    formContentElement = document.getElementById("formContent");
    minimizeBtnElement = document.getElementById("minimizeForm");
  }

  // Set form visibility
  isFormVisible = localStorage.getItem("formVisible") !== "false";
  if (formContentElement) {
    formContentElement.style.display = isFormVisible ? "block" : "none";
  }
  if (minimizeBtnElement) {
    minimizeBtnElement.textContent = isFormVisible ? "−" : "+";
  }

  const status = document.getElementById("status");
  if (status) {
    status.style.marginTop = isFormVisible ? "10px" : "0";
    status.style.borderTop = isFormVisible ? "1px solid #eee" : "none";
  }

  // Restore selected time slots
  if (selectedTimes.length > 0) {
    const checkboxes = document.querySelectorAll(
      '.time-slots input[type="checkbox"]'
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = selectedTimes.includes(checkbox.value);
    });
  }
}

// Single member fields update function
function updateMemberFieldsVisibility(memberCount) {
  // Hide all member fields by default
  const allMemberFields = document.querySelectorAll('[id^="member"]');
  const allMemberLabels = document.querySelectorAll('label[for^="member"]');

  allMemberFields.forEach((field) => {
    field.style.display = "none";
  });
  allMemberLabels.forEach((label) => {
    label.style.display = "none";
  });

  // Show only relevant fields based on member count
  if (memberCount >= 2) {
    const member2Fields = [
      document.getElementById("member2Input_firstName"),
      document.getElementById("member2Input_lastName"),
      document.querySelector('label[for="member2Input_firstName"]'),
    ];
    member2Fields.forEach((el) => el && (el.style.display = "block"));
  }

  if (memberCount >= 3) {
    const member3Fields = [
      document.getElementById("member3Input_firstName"),
      document.getElementById("member3Input_lastName"),
      document.querySelector('label[for="member3Input_firstName"]'),
    ];
    member3Fields.forEach((el) => el && (el.style.display = "block"));
  }
}

// Single initialization function
function initializeFormElements() {
  formContentElement = document.getElementById("formContent");
  minimizeBtnElement = document.getElementById("minimizeForm");

  if (formContentElement && minimizeBtnElement) {
    setupTimeSlotHandlers();
    setupDateTimeValidation();
    restoreFormState();

    // Initialize member fields
    const memberSelect = document.getElementById("memberSelect");
    if (memberSelect) {
      memberSelect.value = "2";
      numberOfMembers = 2;
      updateMemberFieldsVisibility(2);

      memberSelect.addEventListener("change", (e) => {
        const count = parseInt(e.target.value);
        numberOfMembers = count;
        updateMemberFieldsVisibility(count);
        saveState();
      });
    }
  }
}

// Update case blocks with proper scope
function handleLoginProcess() {
  updateStatus("Starting login process...");
  const page = getCurrentPage();

  switch (page) {
    case "login": {
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
          updateStatus("Login simulation completed");
        }
      }
      break;
    }
    case "course-selection": {
      handleGolfCourseSelection();
      break;
    }
    default:
      break;
  }
}

// Update form creation to use new references
function createCredentialForm() {
  if (document.getElementById("credentialForm")) return;

  const formHTML = `
        // ...existing form HTML...
        <div id="memberFields">
            <div id="member2Fields">
                <label for="member2Input_firstName" style="display: none;">Member 2:</label>
                <input type="text" id="member2Input_firstName" placeholder="First Name" style="display: none;">
                <input type="text" id="member2Input_lastName" placeholder="Last Name" style="display: none;">
            </div>
            <div id="member3Fields">
                <label for="member3Input_firstName" style="display: none;">Member 3:</label>
                <input type="text" id="member3Input_firstName" placeholder="First Name" style="display: none;">
                <input type="text" id="member3Input_lastName" placeholder="Last Name" style="display: none;">
            </div>
        </div>
        // ...rest of form HTML...
    `;


  initializeFormElements(); // Use new initialization
}

// Remove duplicate functions and rename handleLogin
const handleLogin = handleLoginProcess;



