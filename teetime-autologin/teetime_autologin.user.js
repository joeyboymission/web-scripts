// ==UserScript==
// @name         Teetime AutoLogin and AutoBook
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  AutoLogin and AutoBook for Teetime Golf Booking System
// @author       JOIBOI and Keiane
// @match        https://tagaytayhighlands-teetime.com/
// @match        https://tagaytayhighlands-teetime.com/index.php?w=1
// @match        https://tagaytayhighlands-teetime.com/index.php
// @match        https://tagaytayhighlands-teetime.com/t/index.php?v=1
// @match        https://tagaytayhighlands-teetime.com/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// @grant        none
// ==/UserScript==

// Wait for the page to load before running the script (Delay for 1 second)
setTimeout(function () {
  // Program runs first the `Page Detection` to determine the current page
  // If the current page is "Login Page", it will run the `Login Page` script and show the login gui
  // Else the current page is "Booking Page", it will run the `Booking Page` script and show the booking gui

  (function () {
    "use strict";
    // Data for the GUI
    const GOLF_COURSE_NAMES = {
      1: "Highlands Golf Course",
      2: "Midlands Front 9 - Back 9",
      3: "Midlands Back 9 - Lucky 9",
      4: "Midlands Lucky 9 - Front 9",
    };

    const TIME_SLOTS = {
      // Morning slots (6:00 AM - 11:50 AM)
      "06:00": "6:00 AM",
      "06:10": "6:10 AM",
      "06:20": "6:20 AM",
      "06:30": "6:30 AM",
      "06:40": "6:40 AM",
      "06:50": "6:50 AM",
      "07:00": "7:00 AM",
      "07:10": "7:10 AM",
      "07:20": "7:20 AM",
      "07:30": "7:30 AM",
      "07:40": "7:40 AM",
      "07:50": "7:50 AM",
      "08:00": "8:00 AM",
      "08:10": "8:10 AM",
      "08:20": "8:20 AM",
      "08:30": "8:30 AM",
      "08:40": "8:40 AM",
      "08:50": "8:50 AM",
      "09:00": "9:00 AM",
      "09:10": "9:10 AM",
      "09:20": "9:20 AM",
      "09:30": "9:30 AM",
      "09:40": "9:40 AM",
      "09:50": "9:50 AM",
      "10:00": "10:00 AM",
      "10:10": "10:10 AM",
      "10:20": "10:20 AM",
      "10:30": "10:30 AM",
      "10:40": "10:40 AM",
      "10:50": "10:50 AM",
      "11:00": "11:00 AM",
      "11:10": "11:10 AM",
      "11:20": "11:20 AM",
      "11:30": "11:30 AM",
      "11:40": "11:40 AM",
      "11:50": "11:50 AM",

      // Afternoon slots (12:00 PM - 3:30 PM)
      "12:00": "12:00 PM",
      "12:10": "12:10 PM",
      "12:20": "12:20 PM",
      "12:30": "12:30 PM",
      "12:40": "12:40 PM",
      "12:50": "12:50 PM",
      "13:00": "1:00 PM",
      "13:10": "1:10 PM",
      "13:20": "1:20 PM",
      "13:30": "1:30 PM",
      "13:40": "1:40 PM",
      "13:50": "1:50 PM",
      "14:00": "2:00 PM",
      "14:10": "2:10 PM",
      "14:20": "2:20 PM",
      "14:30": "2:30 PM",
      "14:40": "2:40 PM",
      "14:50": "2:50 PM",
      "15:00": "3:00 PM",
      "15:10": "3:10 PM",
      "15:20": "3:20 PM",
      "15:30": "3:30 PM",
    };

    // Add this global variable to store the next run time
    let nextScheduledRun = null;

    // State management
    const State = {
      INIT: "INIT",
      STOP: "STOP",
      LOGIN_STARTED: "LOGIN_STARTED",
      LOGIN_COMPLETED: "LOGIN_COMPLETED",
      BOOKING_STARTED: "BOOKING_STARTED",
      COURSE_SELECTED: "COURSE_SELECTED",
      DATE_SELECTED: "DATE_SELECTED",
      TIME_SELECTED: "TIME_SELECTED",
      BOOKING_COMPLETED: "BOOKING_COMPLETED",
    };

    // Initialize and store the state
    localStorage.setItem("automationState", State.INIT);
    let currentState = localStorage.getItem("automationState");

    // Detect the page type
    const detectPageType = detectPage();
    localStorage.setItem("pageType", JSON.stringify(detectPageType));
    console.log("[State Management] Page Type:", detectPageType);

    // Verify state initialization
    console.log("[State Management] Initial State Set:", currentState);
    console.log(
      "[State Management] Verifying localStorage:",
      localStorage.getItem("automationState")
    );

    // State management
    let isAutomationActive = false;
    let formContainer = null;

    function updateState(newState) {
      currentState = newState;
      localStorage.setItem("automationState", newState);
      console.log("[State Management] State updated to:", newState);
    }

    // Create the GUI for the user inputs
    function createFloatingGUI() {
      const div = document.createElement("div");
      div.innerHTML = `
          <div id="teetimeGUI" style="position: fixed; top: 50%; right: 20px; transform: translateY(-50%);
          background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          width: 320px; max-height: 90vh; z-index: 9999; font-family: Arial, sans-serif;
          display: flex; flex-direction: column; overflow: hidden;">

          <!-- Header Section -->
          <div style="flex: 0 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="margin: 0; color: #333; font-size: 18px; font-weight: bold;">Teetime Booking Automation</h3>
              <button id="minimizeGUI" style="border: 1px solid #ddd; background: white; cursor: pointer; font-size: 20px;
              border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
              line-height: 1; padding: 0; transition: all 0.2s;">−</button>
          </div>
          </div>

          <!-- Scrollable Content Section -->
          <div id="guiContent" style="flex: 1; overflow-y: auto; padding-right: 15px; padding-left: 15px; margin: 0px 0px 15px 0px;">
          <!-- Login Details -->
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">User Credentials</label>
          <div class="input-group" style="margin-bottom: 20px;">
          <input type="text" id="username_input" placeholder="Username" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 6px;">
          <input type="password" id="password_input" placeholder="Password" style="width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 6px;">
          </div>

          <!-- Trigger Time -->
          <div class="input-group" style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Trigger Date and Time</label>
          <input type="datetime-local" id="triggerTime_input" style="width: 100%; padding: 8px; box-sizing: border-box;">
          </div>

          <!-- Course Selection -->
          <div class="input-group" style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Golf Course</label>
          <select id="courseSelect_input" style="width: 100%; padding: 8px; box-sizing: border-box;">
              <option value="">Select Course</option>
              ${Object.entries(GOLF_COURSE_NAMES)
                .map(
                  ([value, name]) => `<option value="${value}">${name}</option>`
                )
                .join("")}
          </select>
          </div>

          <!-- Booking Date -->
          <div class="input-group" style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px;">Booking Date</label>
              <input type="date" id="bookingDate_input" style="width: 100%; padding: 8px; box-sizing: border-box;">
          </div>

          <!-- Time Slots -->
          <div class="input-group" style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px;">Preferred Time Slots</label>
          <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 8px; box-sizing: border-box; width: 100%;">
              ${Object.entries(TIME_SLOTS)
                .map(
                  ([value, label]) => `
              <div style="margin-bottom: 5px;">
              <input type="checkbox" id="time_${value}" value="${value}" style="margin-right: 5px;">
              <label for="time_${value}">${label}</label>
              </div>
              `
                )
                .join("")}
          </div>
          </div>

          <!-- Member List -->
          <div class="input-group" style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 10px; font-weight: bold;">Member List</label>
          <div style="max-height: 250px; width: 100%;">
              <!-- Member 2 -->
              <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold;">Member 2</label>
              <div style="margin-bottom: 8px;">
              <input type="text" id="member2_fn" style="width: 100%; padding: 8px; box-sizing: border-box;" placeholder="First Name">
              </div>
              <div>
              <input type="text" id="member2_ln" style="width: 100%; padding: 8px; box-sizing: border-box;" placeholder="Last Name">
              </div>
              </div>

              <!-- Member 3 -->
              <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold;">Member 3</label>
              <div style="margin-bottom: 8px;">
              <input type="text" id="member3_fn" style="width: 100%; padding: 8px; box-sizing: border-box;" placeholder="First Name">
              </div>
              <div>
              <input type="text" id="member3_ln" style="width: 100%; padding: 8px; box-sizing: border-box;" placeholder="Last Name">
              </div>
              </div>

              <!-- Member 4 -->
              <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 8px; font-weight: bold;">Member 4</label>
              <div style="margin-bottom: 8px;">
              <input type="text" id="member4_fn" style="width: 100%; padding: 8px; box-sizing: border-box;" placeholder="First Name">
              </div>
              <div>
              <input type="text" id="member4_ln" style="width: 100%; padding: 8px; box-sizing: border-box;" placeholder="Last Name">
              </div>
              </div>
          </div>
          </div>
          </div>

          <!-- Fixed Bottom Section with updated styling -->
          <div style="flex: 0 0 auto; margin-top: auto;">
          <!-- Action Buttons -->
          <div style="display: flex; gap: 12px; margin-bottom: 15px;">
              <button id="startBtn" style="flex: 1; padding: 12px; background: #4CAF50; color: white;
              border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s;
              box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);">Start</button>
              <button id="stopBtn" style="flex: 1; padding: 12px; background: #f44336; color: white;
              border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s;
              box-shadow: 0 2px 4px rgba(244, 67, 54, 0.2);">Stop</button>
          </div>

          <!-- Status Display -->
          <div id="status" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
              <div style="font-size: 13px; margin-bottom: 5px;">Status: <span id="statusText" style="font-weight: 500;">Ready</span></div>
          </div>

          <!-- Credits -->
          <div style="font-size: 11px; color: #888; margin-top: 15px; text-align: center;">
              <div>Created by JOIBOI and Keiane</div>
              <div>2025</div>
          </div>
          </div>
          </div>
          `;

      document.body.appendChild(div);
      setupGUIEventListeners();
    }

    // Page detection function
    function detectPage() {
      const currentURL = window.location.href;
      console.log("Current URL:", currentURL);

      // Login page URLs
      const loginPages = [
        "https://tagaytayhighlands-teetime.com/",
        "https://tagaytayhighlands-teetime.com/index.php",
      ];

      // Booking page URLs
      const bookingPages = [
        "https://tagaytayhighlands-teetime.com/t/index.php?v=1",
        "https://tagaytayhighlands-teetime.com/t/",
      ];

      // Display for debugging purposes
      if (loginPages.includes(currentURL)) {
        console.log("Login page detected");
        return "login-page"; // value for login page
      } else if (bookingPages.some((url) => currentURL.includes(url))) {
        console.log("Booking page detected");
        return "booking-page"; // value for booking page
      } else {
        console.log("Unknown page detected");
        return "unknown-page"; // value for unknown page
      }
    }

    // Add these helper functions for button management
    function setButtonState(buttonId, enabled) {
      const button = document.getElementById(buttonId);
      if (button) {
        button.disabled = !enabled;
        button.style.opacity = enabled ? "1" : "0.5";
        button.style.cursor = enabled ? "pointer" : "not-allowed";
      }
    }

    // Setup the event listeners for the GUI
    function setupGUIEventListeners() {
      // Initial button states
      setButtonState("startBtn", true);
      setButtonState("stopBtn", false);

      // Start button click handler
      document.getElementById("startBtn")?.addEventListener("click", () => {
        console.log("Start button clicked - checking form values:");
        debugFormValues();

        if (validateInputs()) {
          const formData = {
            userName: document.getElementById("username_input")?.value || "",
            password: document.getElementById("password_input")?.value || "",
            dateTrigger:
              document.getElementById("triggerTime_input")?.value || "",
            timeTrigger: "",
            selectedCourse:
              document.getElementById("courseSelect_input")?.value || "",
            bookingDate:
              document.getElementById("bookingDate_input")?.value || "",
            timeSlots: Array.from(
              document.querySelectorAll('input[type="checkbox"]:checked')
            ).map((cb) => cb.value),
            isAutomationActive: true,
            isFormVisible: true,
            lastPage: "login",
            members: {
              member2: {
                firstName: document.getElementById("member2_fn")?.value || "",
                lastName: document.getElementById("member2_ln")?.value || "",
              },
              member3: {
                firstName: document.getElementById("member3_fn")?.value || "",
                lastName: document.getElementById("member3_ln")?.value || "",
              },
              member4: {
                firstName: document.getElementById("member4_fn")?.value || "",
                lastName: document.getElementById("member4_ln")?.value || "",
              },
            },
          };

          try {
            const pageType = JSON.parse(localStorage.getItem("pageType")); // Parse the JSON string
            const currentState = localStorage.getItem("automationState");
            const hasExistingData =
              localStorage.getItem("teetime_state") !== null;

            // Case 1: First time initialization on login page
            if (
              !hasExistingData &&
              pageType === "login-page" &&
              currentState === State.INIT
            ) {
              localStorage.setItem("teetime_state", JSON.stringify(formData));
              localStorage.setItem("automationState", State.LOGIN_STARTED);
              console.log("New session started - data saved:", formData);

              setButtonState("startBtn", false);
              setButtonState("stopBtn", true);
              setFormFieldsState(false);

              setTimeout(startAutomation, 3000);
              updateStatus("Automation started - Login process initiated");
            }
            // Case 2: Resuming from stop state on login page
            else if (
              hasExistingData &&
              pageType === "login-page" &&
              currentState === State.STOP
            ) {
              localStorage.setItem("teetime_state", JSON.stringify(formData));
              localStorage.setItem("automationState", State.LOGIN_STARTED);
              console.log("Resuming from login page - data updated:", formData);

              setButtonState("startBtn", false);
              setButtonState("stopBtn", true);
              setFormFieldsState(false);

              setTimeout(startAutomation, 3000);
              updateStatus("Resuming automation from login page");
            }
            // Case 3: Resuming from stop state on booking page
            else if (
              hasExistingData &&
              pageType === "booking-page" &&
              currentState === State.STOP
            ) {
              localStorage.setItem("teetime_state", JSON.stringify(formData));
              localStorage.setItem("automationState", State.BOOKING_STARTED);
              console.log(
                "Resuming from booking page - data updated:",
                formData
              );

              setButtonState("startBtn", false);
              setButtonState("stopBtn", true);
              setFormFieldsState(false);

              setTimeout(startAutomation, 3000);
              updateStatus("Resuming automation from booking page");
            }
            // Invalid state/page combination
            else {
              console.log("Invalid state or page type combination:", {
                pageType,
                currentState,
                hasExistingData,
              });
              showNotification(
                "warning",
                "⚠️ Invalid State",
                "Please refresh the page and try again"
              );
            }
          } catch (error) {
            console.error("Error saving data:", error);
            alert("Error saving settings. Please try again.");
          }
        } else {
          console.log("Validation failed - see above logs for details");
        }
      });

      // Stop button click handler
      document.getElementById("stopBtn")?.addEventListener("click", () => {
        // Keep the existing data but mark as inactive
        const existingData = getAutomationData();
        const pageType = JSON.parse(localStorage.getItem("pageType"));
        const currentState = localStorage.getItem("automationState");

        // Case 1: Stop on login page
        if (
          pageType === "login-page" &&
          currentState === State.LOGIN_STARTED &&
          existingData !== null
        ) {
          existingData.isAutomationActive = false;
          localStorage.setItem("teetime_state", JSON.stringify(existingData));
          console.log("Automation stopped on login page - data preserved");

          // Update the state
          localStorage.setItem("automationState", State.STOP);

          // Enable all form inputs
          setFormFieldsState(true);

          // Update button states
          setButtonState("startBtn", true);
          setButtonState("stopBtn", false);

          // Show notification
          showNotification(
            "warning",
            "⚠️ Automation Stopped on Login Page",
            "Settings preserved - Click Start to resume"
          );
          return true;
        }

        // Case 2: Stop on booking page
        else if (
          pageType === "booking-page" &&
          (currentState === State.BOOKING_STARTED ||
            currentState === State.COURSE_SELECTED ||
            currentState === State.DATE_SELECTED ||
            currentState === State.TIME_SELECTED) &&
          existingData !== null
        ) {
          existingData.isAutomationActive = false;
          localStorage.setItem("teetime_state", JSON.stringify(existingData));
          console.log("Automation stopped on booking page - data preserved");

          // Update the state
          localStorage.setItem("automationState", State.STOP);

          // Enable all form inputs
          setFormFieldsState(true);

          // Update button states
          setButtonState("startBtn", true);
          setButtonState("stopBtn", false);

          // Show notification
          showNotification(
            "warning",
            "⚠️ Automation Stopped on Booking Page",
            "Settings preserved - Click Start to resume"
          );
          return true;
        }

        if (existingData) {
          existingData.isAutomationActive = false;
          localStorage.setItem("teetime_state", JSON.stringify(existingData));
        }
      });

      // Minimize button
      document.getElementById("minimizeGUI")?.addEventListener("click", () => {
        const content = document.getElementById("guiContent");
        if (content) {
          content.style.display =
            content.style.display === "none" ? "block" : "none";
        }
      });
    }

    // Helper function to set form fields state
    function setFormFieldsState(enabled) {
      const formFields = [
        "username_input",
        "password_input",
        "triggerTime_input",
        "courseSelect_input",
        "bookingDate_input",
        "timeSlots",
        "member2_fn",
        "member2_ln",
        "member3_fn",
        "member3_ln",
        "member4_fn",
        "member4_ln",
      ];

      formFields.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.disabled = !enabled;
        }
      });
    }

    // Validate the user inputs
    function validateInputs() {
      const formInputs = {
        username: {
          value: document.getElementById("username_input")?.value?.trim(),
          label: "Username",
        },
        password: {
          value: document.getElementById("password_input")?.value?.trim(),
          label: "Password",
        },
        triggerTime: {
          value: document.getElementById("triggerTime_input")?.value?.trim(),
          label: "Trigger Date and Time",
        },
        course: {
          value: document.getElementById("courseSelect_input")?.value?.trim(),
          label: "Golf Course",
        },
        bookingDate: {
          value: document.getElementById("bookingDate_input")?.value?.trim(),
          label: "Booking Date",
        },
        timeSlots: {
          value: Array.from(
            document.querySelectorAll('input[type="checkbox"]:checked')
          ).map((cb) => cb.value),
          label: "Time Slots",
        },
      };

      // Debug log all input values
      console.log("Current form values:", formInputs);

      // Check each required input individually and log its state
      for (const [key, input] of Object.entries(formInputs)) {
        if (key === "timeSlots") {
          if (input.value.length === 0) {
            console.log(`❌ ${input.label} is empty`);
            alert(`Please select at least one time slot`);
            return false;
          }
          console.log(
            `✅ ${input.label}: ${input.value.length} slots selected`
          );
          continue;
        }

        if (!input.value) {
          console.log(`❌ ${input.label} is empty`);
          alert(`Please enter ${input.label}`);
          return false;
        }
        console.log(`✅ ${input.label}: ${input.value}`);
      }

      // Validate trigger time is in the future
      const triggerDateTime = new Date(formInputs.triggerTime.value);
      const now = new Date();
      if (isNaN(triggerDateTime.getTime()) || triggerDateTime <= now) {
        console.log(`❌ Invalid trigger time: ${formInputs.triggerTime.value}`);
        alert("Please select a future date and time for the script to start");
        return false;
      }

      // Validate booking date
      const savedBookingDate = formInputs.bookingDate.value;
      if (!savedBookingDate) {
        console.error("No booking date found in form data");
        return false;
      }

      const bookingDateObj = new Date(savedBookingDate);
      if (isNaN(bookingDateObj.getTime())) {
        console.error("Invalid booking date format:", savedBookingDate);
        return false;
      }

      console.log("✅ All validations passed successfully");
      updateStatus("Validation successful");
      return true;
    }

    // Persistently removing any modal that may appear
    function closeModal() {
      // Specifically target the wrongpass modal first
      const wrongPassModal = document.querySelector(".modal.wrongpass.show");
      const anyModal = document.querySelector(".modal.show");
      const modalToClose = wrongPassModal || anyModal;

      if (modalToClose) {
        try {
          // Click the close button if it exists
          const closeButton = modalToClose.querySelector(
            ".btn-close, .btn-secondary"
          );
          if (closeButton) {
            closeButton.click();
          }

          // Force cleanup if modal still persists
          modalToClose.classList.remove("show");
          modalToClose.classList.remove("fade");
          modalToClose.style.display = "none";
          modalToClose.setAttribute("aria-modal", "false");
          modalToClose.setAttribute("aria-hidden", "true");

          // Remove backdrop
          const backdrop = document.querySelector(".modal-backdrop");
          if (backdrop) {
            backdrop.remove();
          }

          // Clean up body
          document.body.classList.remove("modal-open");
          document.body.style.removeProperty("padding-right");
          document.body.style.overflow = "auto";

          // Clean up modal
          modalToClose.style.removeProperty("padding-right");

          console.log("Modal killed successfully");
        } catch (error) {
          console.error("Error closing modal:", error);
        }
      }
    }

    // Initial cleanup
    closeModal();

    // Set up continuous monitoring
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.addedNodes.length ||
          (mutation.target.classList &&
            mutation.target.classList.contains("show"))
        ) {
          closeModal();
        }
      });
    });

    // Start observing with enhanced options
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    // Additional interval check for stubborn modals
    setInterval(closeModal, 1000);

    // Modified storage helper functions with debug logging
    function saveAutomationData(data) {
      try {
        // Create consistent data structure
        const storageData = {
          formVisible: true,
          userName: data.username || data.userName, // Handle both cases
          password: data.password,
          dateTrigger: data.triggerTime || data.dateTrigger, // Handle both cases
          selectedCourse: data.course || data.selectedCourse, // Handle both cases
          bookingDate: data.bookingDate,
          timeSlots: data.timeSlots,
          isAutomationActive: true,
          isFormVisible: true,
          lastPage: "login",
          members: {
            member2: {
              firstName: data.members?.member2?.firstName || "",
              lastName: data.members?.member2?.lastName || "",
            },
            member3: {
              firstName: data.members?.member3?.firstName || "",
              lastName: data.members?.member3?.lastName || "",
            },
            member4: {
              firstName: data.members?.member4?.firstName || "",
              lastName: data.members?.member4?.lastName || "",
            },
          },
        };

        const dataString = JSON.stringify(storageData);
        localStorage.setItem("teetime_state", dataString);

        // Debug logging
        console.log("Saved automation data:", storageData);

        return true;
      } catch (error) {
        console.error("Error saving automation data:", error);
        return false;
      }
    }

    function getAutomationData() {
      try {
        const rawData = localStorage.getItem("teetime_state");
        if (!rawData) {
          console.log("No automation data found in localStorage");
          return null;
        }

        const data = JSON.parse(rawData);
        // Normalize the data structure to ensure consistency
        return {
          username: data.userName || data.username || "",
          password: data.password || "",
          triggerTime: data.dateTrigger || data.triggerTime || "",
          course: data.selectedCourse || data.course || "",
          bookingDate: data.bookingDate || "",
          timeSlots: Array.isArray(data.timeSlots) ? data.timeSlots : [],
          isAutomationActive: Boolean(data.isAutomationActive),
          isFormVisible: Boolean(data.isFormVisible),
          lastPage: data.lastPage || "",
          members: {
            member2: {
              firstName: data.members?.member2?.firstName || "",
              lastName: data.members?.member2?.lastName || "",
            },
            member3: {
              firstName: data.members?.member3?.firstName || "",
              lastName: data.members?.member3?.lastName || "",
            },
            member4: {
              firstName: data.members?.member4?.firstName || "",
              lastName: data.members?.member4?.lastName || "",
            },
          },
        };
      } catch (error) {
        console.error("Error getting automation data:", error);
        return null;
      }
    }

    function clearAutomationData() {
      localStorage.removeItem("teetime_state");
    }

    // Currently not used
    // Modify the triggerStart function to ensure data is being saved
    function triggerStart() {
      console.log("triggerStart called");

      // Get all form values
      const formData = {
        username: document.getElementById("username_input")?.value || "",
        password: document.getElementById("password_input")?.value || "",
        triggerTime: document.getElementById("triggerTime_input")?.value || "",
        course: document.getElementById("courseSelect_input")?.value || "",
        bookingDate: document.getElementById("bookingDate_input")?.value || "",
        timeSlots: Array.from(
          document.querySelectorAll('input[type="checkbox"]:checked')
        ).map((cb) => cb.value),
        members: {
          member2: {
            firstName: document.getElementById("member2_fn")?.value || "",
            lastName: document.getElementById("member2_ln")?.value || "",
          },
          member3: {
            firstName: document.getElementById("member3_fn")?.value || "",
            lastName: document.getElementById("member3_ln")?.value || "",
          },
          member4: {
            firstName: document.getElementById("member4_fn")?.value || "",
            lastName: document.getElementById("member4_ln")?.value || "",
          },
        },
      };

      console.log("Form data collected:", formData);

      // Try to save the data
      const saveSuccessful = saveAutomationData(formData);

      if (!saveSuccessful) {
        console.error("Failed to save automation data");
        alert("There was an error saving your settings. Please try again.");
        return;
      }

      // Calculate next run time
      const triggerDateTime = new Date(formData.triggerTime);
      const now = new Date();

      if (isNaN(triggerDateTime.getTime()) || triggerDateTime <= now) {
        console.error("Invalid trigger time");
        alert("Please select a valid future date and time");
        return;
      }

      // Set the next scheduled run time
      nextScheduledRun = triggerDateTime;

      // Schedule the automation
      const timeUntilRun = triggerDateTime - now;
      window.automationTimer = setTimeout(startAutomation, timeUntilRun);

      // Update display
      updateNextRunDisplay(
        `Next run scheduled for: ${triggerDateTime.toLocaleString()}`
      );
      console.log("Automation scheduled successfully");
    }

    // Time trigger function for debugging
    function triggerStart() {
      // Get trigger datetime from input
      const triggerInput = document.getElementById("triggerTime_input");
      const triggerDateTime = new Date(triggerInput.value);
      const now = new Date();

      // Validate the datetime
      if (isNaN(triggerDateTime.getTime())) {
        console.log("❌ Error: Invalid trigger date and time");
        return false;
      }

      // Check if trigger time is in the past
      console.log("Current time:", now.toLocaleString());
      console.log("Trigger time:", triggerDateTime.toLocaleString());

      if (triggerDateTime <= now) {
        console.log(
          "❌ Error: Trigger date and time must be set to a future date and time"
        );
        return false;
      }

      console.log("✅ Trigger date and time is set to a future date and time");

      // Store the next run time globally
      nextScheduledRun = triggerDateTime;

      // Calculate time remaining in milliseconds
      const timeRemaining = triggerDateTime - now;
      console.log(
        `Time remaining: ${Math.floor(timeRemaining / 1000)} seconds`
      );

      // Update the status display
      updateNextRunDisplay();

      // Store the timer so we can cancel it if needed
      window.automationTimer = setTimeout(() => {
        console.log("🚀 Executing main program...");
        startAutomation();
      }, timeRemaining);

      return true;
    }

    // Modify stopAutomation function
    function stopAutomation() {
      if (window.automationTimer) {
        clearTimeout(window.automationTimer);
        window.automationTimer = null;
      }

      clearAutomationData();
      localStorage.setItem("automationState", State.STOP);
      isAutomationActive = false;
      nextScheduledRun = null;

      // const updateRunMsg =
      //   "No date and time scheduled, please run the automation again";
      // updateNextRunDisplay(updateRunMsg);
    }

    // Modified checkExistingAutomation
    (function checkExistingAutomation() {
      const pageType = detectPage();

      setTimeout(() => {
        if (pageType === "booking-page") {
          console.log("In the booking page, checking for existing automation");
          const savedData = getAutomationData();

          if (savedData?.isAutomationActive) {
            console.log("Found existing automation, resuming...");
            console.log("Saved data:", savedData); // Debug log

            // Restore form values with proper null checks
            const formFields = {
              username_input: savedData.username,
              password_input: savedData.password,
              triggerTime_input: savedData.triggerTime,
              courseSelect_input: savedData.course,
              bookingDate_input: savedData.bookingDate,
            };

            // Handle time slots separately
            if (Array.isArray(savedData.timeSlots)) {
              savedData.timeSlots.forEach((timeSlot) => {
                const timeCheckbox = document.getElementById(
                  `time_${timeSlot}`
                );
                if (timeCheckbox) {
                  timeCheckbox.checked = true;
                }
              });
            }

            // Restore basic form fields
            let allFieldsRestored = true;
            for (const [id, value] of Object.entries(formFields)) {
              const element = document.getElementById(id);
              if (element) {
                element.value = value || "";
                console.log(`Restored ${id} with value: ${value || "empty"}`);
              } else {
                console.warn(`Element not found for ID: ${id}`);
                allFieldsRestored = false;
              }
            }

            // Restore member details
            const memberFields = {
              member2_fn: savedData.members?.member2?.firstName,
              member2_ln: savedData.members?.member2?.lastName,
              member3_fn: savedData.members?.member3?.firstName,
              member3_ln: savedData.members?.member3?.lastName,
              member4_fn: savedData.members?.member4?.firstName,
              member4_ln: savedData.members?.member4?.lastName,
            };

            for (const [id, value] of Object.entries(memberFields)) {
              const element = document.getElementById(id);
              if (element) {
                element.value = value || "";
                console.log(`Restored ${id} with value: ${value || "empty"}`);
              } else {
                console.warn(`Element not found for ID: ${id}`);
                allFieldsRestored = false;
              }
            }

            if (allFieldsRestored) {
              console.log("All form values successfully restored");
              setButtonState("startBtn", false);
              setButtonState("stopBtn", true);
              setFormFieldsState(false);
              startAutomation();
            } else {
              console.warn("Some form values could not be restored");
              setButtonState("startBtn", true);
              setButtonState("stopBtn", false);
              setFormFieldsState(true);
            }
          } else {
            console.log("No active automation found");
          }
        } else {
          console.log(`${pageType}, skipping automation check`);
        }
      }, 2000);
    })();

    // Update this function to handle both setting and clearing the next run display
    function updateNextRunDisplay(customMessage = null) {
      const statusDiv = document.getElementById("status");
      if (statusDiv) {
        // Find or create the next run div
        let nextRunDiv = statusDiv.querySelector(".next-run");
        if (!nextRunDiv) {
          nextRunDiv = document.createElement("div");
          nextRunDiv.className = "next-run";
          nextRunDiv.style.fontSize = "13px";
          statusDiv.appendChild(nextRunDiv);
        }

        // If there's a custom message or no next scheduled run, show that instead
        if (customMessage || !nextScheduledRun) {
          nextRunDiv.textContent = customMessage || "No scheduled run";
        } else {
          const splitTime = nextScheduledRun.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const splitDate = nextScheduledRun.toLocaleDateString([], {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          nextRunDiv.textContent = `Next Run: ${splitTime} ${splitDate}`;
        }
      }
    }

    // Add this helper function to check form values at any time
    function debugFormValues() {
      const inputValues = {
        username: document.getElementById("username_input")?.value,
        password: document.getElementById("password_input")?.value,
        triggerTime: document.getElementById("triggerTime_input")?.value,
        course: document.getElementById("courseSelect_input")?.value,
        bookingDate: document.getElementById("bookingDate_input")?.value,
        timeSlots: JSON.stringify(
          Array.from(
            document.querySelectorAll('input[type="checkbox"]:checked')
          ).map((cb) => cb.value)
        ),
      };
      console.table(inputValues);
      return inputValues;
    }

    // Script status
    function updateStatus(message) {
      const statusText = document.getElementById("statusText");
      if (statusText) {
        statusText.textContent = message;
      }
    }

    // Handle cut-off time
    // Cut off time is 9:00 AM to 9:00 PM, so expect will not run before 9:00 AM and after 9:00 PM
    function isCutOffTime() {
      const now = new Date();
      const hours = now.getHours();

      // Check if the current time is before 9:00 AM or after 9:00 PM
      if (hours < 9) {
        console.log("Cut off time is before 9:00 AM");

        showNotification(
          "warning",
          "⚠️ Automation Stopped",
          "Cut off time is before 9:00 AM"
        );

        // Stop the automation
        stopAutomation();

        // Change the button state
        setButtonState("startBtn", true);
        setButtonState("stopBtn", false);

        // Enable all form inputs
        setFormFieldsState(true);

        return true;
      } else if (hours >= 21) {
        console.log("Cut off time is after 9:00 PM");

        showNotification(
          "warning",
          "⚠️ Automation Stopped",
          "Cut off time is after 9:00 PM"
        );

        // Stop the automation
        stopAutomation();

        // Change the button state
        setButtonState("startBtn", true);
        setButtonState("stopBtn", false);

        // Enable all form inputs
        setFormFieldsState(true);

        return true;
      }
      return false;
    }

    // Wrong username or password function
    function wrongUsernameOrPassword() {
      // Return to the login page
      window.location.href = "https://tagaytayhighlands-teetime.com/";

      // Replace the username and password with the backup credentials
      document.getElementById("username_input").value = "MG03787-000";
      document.getElementById("password_input").value = "nobhill2025";

      console.log("Username and password replaced with backup credentials");

      // Return to the startAutomation function
      setTimeout(startAutomation, 3000);
    }

    // Main function and automation
    function startAutomation() {
      const savedData = getAutomationData();

      if (!savedData || !savedData.isAutomationActive) {
        console.log("No active automation found");
        return;
      }

      // Check if the user has entered the wrong username or password
      const detectWrongCredentials = document.querySelector(".modal.wrongpass");
      if (detectWrongCredentials) {
        console.log("Wrong username or password detected");
        wrongUsernameOrPassword();
        return;
      }

      // Execute page detection
      const pageType = detectPage();
      console.log("[Page Detection] Current page type:", pageType);

      if (pageType === "login-page") {
        console.log("[Login Page] Starting login process");
        if (currentState !== State.LOGIN_COMPLETED) {
          // Get the username and password from the saved data
          const savedData = getAutomationData();
          let username = savedData.username;
          let password = savedData.password;

          function attemptLogin() {
            const loginForm = document.querySelector("form");
            if (loginForm) {
              try {
                updateState(State.LOGIN_STARTED);
                const memberIdField = loginForm.querySelector(
                  'input[name="membersid"]'
                );
                const passwordField = loginForm.querySelector(
                  'input[name="password"]'
                );

                if (memberIdField && passwordField) {
                  memberIdField.value = username;
                  passwordField.value = password;
                  const rememberMe =
                    loginForm.querySelector("#inlineFormCheck");
                  if (rememberMe) rememberMe.checked = true;

                  loginForm.submit();
                  updateState(State.LOGIN_COMPLETED);
                  console.log("[Login Page] Login form submitted successfully");
                }
              } catch (error) {
                console.error("[Login Page] Error during login:", error);
              }
            }
          }

          // Attempt login after a short delay to ensure page is loaded
          setTimeout(attemptLogin, 1000);
        } else {
          console.log(
            "[Login Page] Login already completed, redirecting to booking page"
          );
          window.location.href =
            "https://tagaytayhighlands-teetime.com/t/index.php?v=1";
        }
      } else if (pageType === "booking-page") {
        // Expect that the user is already logged in
        // The program will resume from where it left off
        console.log("[Booking Page] Starting booking process");
        if (currentState !== State.BOOKING_COMPLETED) {
          const savedData = getAutomationData();
          const selectedCourse = savedData.course;
          const courseNames = {
            1: "Highlands Golf Course",
            2: "Midlands Front 9 - Back 9",
            3: "Midlands Back 9 - Lucky 9",
            4: "Midlands Lucky 9 - Front 9",
          };

          // Function to select the course
          function selectCourse() {
            updateState(State.BOOKING_STARTED);
            const courseDropdown = document.getElementById("golfcourse");

            if (courseDropdown) {
              courseDropdown.value = selectedCourse;
              const event = new Event("change", { bubbles: true });
              courseDropdown.dispatchEvent(event);

              console.log(
                `[Booking Page] Selected course: ${courseNames[selectedCourse]}`
              );

              const courseDiv = document.getElementById(selectedCourse);
              if (courseDiv) {
                courseDiv.style.display = "block";
                updateState(State.COURSE_SELECTED);
                console.log("[Booking Page] Course selection completed");

                // Trigger date selection after course is selected
                setTimeout(initiateDateSelection, 2000);
              }
            }

            // Function to initiate date selection after course is selected
            function initiateDateSelection() {
              console.log("[Date Selection] Starting date selection process");
              // Get the target date from the saved data
              const savedBookingDate = savedData.bookingDate;
              if (!savedBookingDate) {
                console.error("No booking date found in saved data");
                return;
              }

              const bookingDateObj = new Date(savedBookingDate);
              if (isNaN(bookingDateObj.getTime())) {
                console.error("Invalid booking date format:", savedBookingDate);
                return;
              }

              const targetDate = {
                year: bookingDateObj.getFullYear(),
                month: bookingDateObj.getMonth(), // January = 0
                day: bookingDateObj.getDate(),
              };
              console.log("Target date parsed:", targetDate);

              function dateSelectionComplete() {
                updateState(State.DATE_SELECTED);
                console.log("[Date Selection] Date selection completed");

                // Trigger time selection after date is selected with delay
                console.log(
                  "[Time Selection] Waiting 3 second before starting time selection..."
                );
                setTimeout(initiateTimeSelection, 3000);
              }

              // Array of all possible datepicker IDs
              const datepickerIds = [
                "golfdate",
                "golfdate2",
                "golfdate3",
                "golfdate4",
              ];

              function getActiveDatepicker() {
                // Find which datepicker is currently visible/active
                for (const id of datepickerIds) {
                  const $datepicker = $(`#${id}`);
                  if (
                    $datepicker.length &&
                    $datepicker.closest(".myDiv").is(":visible")
                  ) {
                    return $datepicker;
                  }
                }
                return null;
              }

              function isDateAvailable(year, month, day) {
                const dateCell = $(
                  `td[data-handler="selectDay"][data-month="${month}"][data-year="${year}"]`
                ).filter(function () {
                  return (
                    $(this).find("a.ui-state-default").text() === day.toString()
                  );
                });

                return (
                  dateCell.length > 0 &&
                  !dateCell.hasClass("ui-datepicker-unselectable") &&
                  !dateCell.hasClass("ui-state-disabled")
                );
              }

              function selectDateInCalendar() {
                try {
                  // Try to select the target date only
                  if (
                    isDateAvailable(
                      targetDate.year,
                      targetDate.month,
                      targetDate.day
                    )
                  ) {
                    console.log(
                      `Target date ${targetDate.year}-${targetDate.month + 1}-${
                        targetDate.day
                      } is available, selecting it`
                    );

                    // Override window.alert before clicking
                    const originalAlert = window.alert;
                    window.alert = function () {
                      console.log("Alert suppressed:", arguments[0]);
                      return true;
                    };

                    // Click the date
                    const dateSelected = clickDate(
                      targetDate.year,
                      targetDate.month,
                      targetDate.day
                    );
                    if (!dateSelected) {
                      window.alert = originalAlert; // Restore original alert
                      console.log("Failed to click date");
                      return false;
                    }

                    // Wait for h4 elements to appear (3 second delay)
                    setTimeout(() => {
                      // Restore original alert
                      window.alert = originalAlert;

                      // Look for specific h4 elements
                      const h4Elements = document.getElementsByTagName("h4");
                      for (const h4 of h4Elements) {
                        const text = h4.textContent || "";

                        if (text.trim() === "MAINTENANCE DAY") {
                          console.log("Maintenance day h4 detected");
                          handleDateError("Maintenance Day");
                          return;
                        }

                        if (text.trim() === "FULLY BOOKED") {
                          console.log("Fully booked h4 detected");
                          handleDateError("Fully Booked");
                          return;
                        }
                      }
                    }, 3000);

                    return true;
                  }

                  // If target date is not available, log and terminate
                  console.log(
                    `Target date ${targetDate.year}-${targetDate.month + 1}-${
                      targetDate.day
                    } is not available`
                  );
                  handleDateError("Date Unavailable");
                  return false;
                } catch (error) {
                  console.error("Error selecting date:", error);
                  handleDateError("Selection Error");
                  return false;
                }
              }

              function clickDate(year, month, day) {
                const dateCell = $(
                  `td[data-handler="selectDay"][data-month="${month}"][data-year="${year}"]`
                ).filter(function () {
                  return (
                    $(this).find("a.ui-state-default").text() === day.toString()
                  );
                });

                if (dateCell.length) {
                  const dateLink = dateCell.find("a.ui-state-default");
                  if (dateLink.length) {
                    dateLink[0].click();
                    console.log(
                      `Successfully clicked date: ${year}-${month + 1}-${day}`
                    );
                    return true;
                  }
                }
                return false;
              }

              function openDatepicker() {
                try {
                  const activeDatepicker = getActiveDatepicker();
                  if (activeDatepicker) {
                    activeDatepicker.focus();
                    activeDatepicker[0].click();
                    console.log(
                      `Opened datepicker: ${activeDatepicker.attr("id")}`
                    );
                    return true;
                  }
                  console.error("No visible datepicker found");
                  return false;
                } catch (error) {
                  console.error("Error opening datepicker:", error);
                  return false;
                }
              }

              function debugDatepicker() {
                const activeDatepicker = getActiveDatepicker();
                if (activeDatepicker) {
                  const datepickerState = {
                    id: activeDatepicker.attr("id"),
                    isVisible: $("#ui-datepicker-div").is(":visible"),
                    value: activeDatepicker.val(),
                    readonly: activeDatepicker.prop("readonly"),
                    hasDatepicker: activeDatepicker.hasClass("hasDatepicker"),
                  };
                  console.log("Active datepicker state:", datepickerState);
                } else {
                  console.log("No active datepicker found");
                }
              }

              function checkIfDateSelected() {
                const activeDatepicker = getActiveDatepicker();
                if (activeDatepicker && activeDatepicker.val()) {
                  console.log(
                    `Date selected in ${activeDatepicker.attr(
                      "id"
                    )}: ${activeDatepicker.val()}`
                  );
                  dateSelectionComplete(); // Call dateSelectionComplete when date is selected
                  return true;
                }
                return false;
              }

              function removeDatepickerFocus() {
                const activeDatepicker = getActiveDatepicker();
                if (activeDatepicker) {
                  activeDatepicker.blur();
                  console.log(
                    `Removed focus from ${activeDatepicker.attr("id")}`
                  );
                  showNotification(
                    "warning",
                    "⚠️ Automation Stopped (Date Selection)",
                    "Settings preserved - Click Start to resume"
                  );

                  // Update automation state
                  updateState(State.STOP);

                  // Clear any existing intervals
                  if (typeof dateSelectionInterval !== "undefined") {
                    clearInterval(dateSelectionInterval);
                  }

                  // Set the form fields to be editable
                  setFormFieldsState(true);

                  // Enable the start button and disable the stop button
                  setButtonState("startBtn", true);
                  setButtonState("stopBtn", false);

                  return;
                }
              }

              const maxAttempts = 10;
              let attempts = 0;
              let datepickerOpened = false;

              let dateSelectionInterval;

              function handleDateError(errorType) {
                console.log(`Script terminating - ${errorType}`);

                // Clear the date selection interval
                if (dateSelectionInterval) {
                  clearInterval(dateSelectionInterval);
                }

                const activeDatepicker = getActiveDatepicker();
                if (activeDatepicker) {
                  activeDatepicker.blur();
                  console.log(
                    `Removed focus from ${activeDatepicker.attr("id")}`
                  );
                }

                // Enable the start button and disable the stop button
                setButtonState("startBtn", true);
                setButtonState("stopBtn", false);

                // Set the form fields to be editable
                setFormFieldsState(true);

                // Update automation state
                updateState(State.STOP);

                // Show appropriate notification based on error type
                let notificationMessage = "";
                switch (errorType) {
                  case "Maintenance Day":
                    notificationMessage = "Selected date is a maintenance day";
                    break;
                  case "Fully Booked":
                    notificationMessage = "Selected date is fully booked";
                    break;
                  case "Date Unavailable":
                    notificationMessage = "Selected date is not available";
                    break;
                  default:
                    notificationMessage = "Error selecting date";
                }

                // Show a notification that the automation is stopped
                showNotification(
                  "warning",
                  "⚠️ Automation Stopped",
                  `${notificationMessage} - Click Start to resume`
                );

                // Prevent further execution
                return false;
              }

              // Modify the interval assignment
              dateSelectionInterval = setInterval(() => {
                debugDatepicker();

                if (checkIfDateSelected()) {
                  console.log(
                    "[Date Selection] Target date successfully selected"
                  );
                  removeDatepickerFocus();
                  clearInterval(dateSelectionInterval);
                  return;
                }

                if (attempts >= maxAttempts) {
                  console.error("Failed to select date after maximum attempts");
                  removeDatepickerFocus();
                  clearInterval(dateSelectionInterval);
                  return;
                }

                if (!datepickerOpened) {
                  datepickerOpened = openDatepicker();
                  attempts++;
                  return;
                }

                const calendar = $("#ui-datepicker-div");
                if (calendar.length && calendar.is(":visible")) {
                  if (selectDateInCalendar()) {
                    setTimeout(() => {
                      if (checkIfDateSelected()) {
                        console.log("Date selection confirmed successful");
                        clearInterval(dateSelectionInterval);
                      }
                    }, 500);
                  }
                }

                attempts++;
              }, 1000);
            }

            // Function to initiate time selection after date is selected
            function initiateTimeSelection() {
              console.log("[Time Selection] Starting time selection process");

              // Define checkIfTimeSelected first
              function checkIfTimeSelected() {
                const timeSelect = $('select[name="time"]');
                if (timeSelect.length && timeSelect.val()) {
                  timeSelectionComplete();
                  return timeSelect.val() !== "";
                }
                return false;
              }

              // Get the target time from the saved data
              const timeSlots = savedData.timeSlots;
              if (!timeSlots || timeSlots.length === 0) {
                console.error("No time slots found in saved data");
                return;
              }

              const targetTime = timeSlots; // This will be an array of selected time slots
              console.log("Retrieved time slots:", targetTime);

              function isTimeAvailable(timeValue) {
                const timeOption = $('select[name="time"] option').filter(
                  function () {
                    return $(this).val() === timeValue;
                  }
                );

                const available =
                  timeOption.length > 0 &&
                  !timeOption.prop("disabled") &&
                  !timeOption.attr("disabled");
                console.log(
                  `Checking time ${timeValue}: ${
                    available ? "Available" : "Not available"
                  }`
                );
                return available;
              }

              function findNextAvailableTime() {
                const timeSelect = $('select[name="time"]');
                if (!timeSelect.length) {
                  console.log("Time select element not found");
                  return null;
                }

                // Check each target time in order
                for (const time of targetTime) {
                  if (isTimeAvailable(time)) {
                    console.log(`Found available time slot: ${time}`);
                    return time;
                  }
                }

                console.log(
                  "No available time slots found for any target times"
                );
                return null;
              }

              function selectTimeInDropdown() {
                try {
                  // First try to select the target time directly
                  if (isTimeAvailable(targetTime)) {
                    console.log(
                      `Target time ${targetTime} is available, selecting it`
                    );
                    return selectTime(targetTime);
                  }

                  // If target time is not available, find next available time
                  console.log(
                    `Target time is not available, looking for next available time`
                  );
                  const nextTime = findNextAvailableTime();
                  if (!nextTime) {
                    console.error("No available time slots found");
                    return false;
                  }

                  console.log(
                    `Attempting to select next available time: ${nextTime}`
                  );
                  return selectTime(nextTime);
                } catch (error) {
                  console.error("Error selecting time:", error);
                  return false;
                }
              }

              function selectTime(timeValue) {
                const timeSelect = $('select[name="time"]');
                if (timeSelect.length) {
                  timeSelect.val(timeValue);
                  timeSelect.trigger("change");
                  console.log(`Successfully selected time: ${timeValue}`);
                  return true;
                }
                return false;
              }

              function openTimeDropdown() {
                try {
                  const timeSelect = $('select[name="time"]');
                  if (timeSelect.length) {
                    timeSelect.focus();
                    timeSelect.trigger("click");
                    console.log("Opened time dropdown");
                    return true;
                  }
                  console.error("Time select not found");
                  return false;
                } catch (error) {
                  console.error("Error opening time dropdown:", error);
                  return false;
                }
              }

              function debugTimeSelect() {
                const timeSelectState = {
                  exists: $('select[name="time"]').length > 0,
                  value: $('select[name="time"]').val(),
                  disabled: $('select[name="time"]').prop("disabled"),
                  optionsCount: $('select[name="time"] option').length,
                };
                console.log("Time select state:", timeSelectState);
              }

              function timeSelectionComplete() {
                updateState(State.TIME_SELECTED);
                console.log("Time selection complete");
                removeTimeSelectFocus();

                console.log(
                  "Waiting 2 seconds before inputting player details"
                );
                setTimeout(inputPlayerDetails, 2000);
              }

              function removeTimeSelectFocus() {
                const timeSelect = $('select[name="time"]');
                if (timeSelect.length) {
                  timeSelect.blur();
                  console.log("Removed focus from time select");

                  // Update automation state
                  updateState(State.STOP);

                  // Clear any existing intervals
                  if (typeof timeSelectionInterval !== "undefined") {
                    clearInterval(timeSelectionInterval);
                  }

                  // Set the form fields to be editable
                  setFormFieldsState(true);

                  // Enable the start button and disable the stop button
                  setButtonState("startBtn", true);
                  setButtonState("stopBtn", false);

                  // Show a a notification that the automation is stopped
                  showNotification(
                    "warning",
                    "⚠️ Automation Stopped (Time Selection)",
                    "Settings preserved - Click Start to resume"
                  );

                  return;
                }
              }

              // Main execution logic
              const maxAttempts = 5;
              let attempts = 0;
              let dropdownOpened = false;

              const timeSelectionInterval = setInterval(() => {
                debugTimeSelect();

                // Check if time is already selected correctly
                if (checkIfTimeSelected()) {
                  console.log("Time successfully selected, stopping script");
                  removeTimeSelectFocus();
                  clearInterval(timeSelectionInterval);
                  return;
                }

                if (attempts >= maxAttempts) {
                  console.error("Failed to select time after maximum attempts");
                  removeTimeSelectFocus();
                  clearInterval(timeSelectionInterval);
                  return;
                }

                // First try to open the dropdown if not already opened
                if (!dropdownOpened) {
                  dropdownOpened = openTimeDropdown();
                  attempts++;
                  return;
                }

                // Try to select time
                if (selectTimeInDropdown()) {
                  // Wait a short moment to verify the selection was successful
                  setTimeout(() => {
                    if (checkIfTimeSelected()) {
                      console.log("Time selection confirmed successful");
                      removeTimeSelectFocus();
                      clearInterval(timeSelectionInterval);
                    }
                  }, 500);
                }

                attempts++;
              }, 1000);
            }

            function inputPlayerDetails() {
              console.log("Starting player input process");

              // Get player details from savedData, with proper error handling
              const members = savedData?.members || {};

              // Get player details, defaulting to empty strings if not found
              const player2_firstName = members.member2?.firstName || "";
              const player2_lastName = members.member2?.lastName || "";
              const player3_firstName = members.member3?.firstName || "";
              const player3_lastName = members.member3?.lastName || "";
              const player4_firstName = members.member4?.firstName || "";
              const player4_lastName = members.member4?.lastName || "";

              // Function to safely input player details
              function inputPlayer(number, firstName, lastName) {
                const firstNameField = document.querySelector(
                  `input[name="player${number}f"]`
                );
                const lastNameField = document.querySelector(
                  `input[name="player${number}l"]`
                );

                if (firstNameField && lastNameField) {
                  if (firstName) {
                    firstNameField.value = firstName;
                    firstNameField.dispatchEvent(new Event("input"));
                  }
                  if (lastName) {
                    lastNameField.value = lastName;
                    lastNameField.dispatchEvent(new Event("input"));
                  }
                  console.log(`Player ${number} details processed`);
                }
              }

              // Sequence the player inputs with proper delays
              setTimeout(
                () => inputPlayer(1, player2_firstName, player2_lastName),
                1000
              );
              setTimeout(
                () => inputPlayer(2, player3_firstName, player3_lastName),
                2000
              );
              setTimeout(
                () => inputPlayer(3, player4_firstName, player4_lastName),
                3000
              );

              // Continue with the booking process after player inputs
              setTimeout(() => {
                console.log("Player input process completed");
              }, 4000);
            }
          }
          // Start the sequence with course selection
          setTimeout(selectCourse, 3000);
        } else {
          console.log("[Booking Page] Booking already completed");
        }
      } else {
        console.error("[Error] Unknown page type, automation cannot proceed");
      }
    }

    function showNotification(type, message, subMessage) {
      const notification = document.createElement("div");
      const backgroundColor = {
        success: "#4CAF50",
        warning: "#ff9800",
        error: "#f44336",
      };

      notification.innerHTML = `
        <div id="initNotification" style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${backgroundColor[type]};
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-family: Arial, sans-serif;
          animation: slideIn 0.5s ease-out, fadeOut 0.5s ease-out 4.5s forwards;
        ">
          <div style="font-weight: bold; margin-bottom: 5px;">${message}</div>
          <div style="font-size: 13px;">${subMessage}</div>
        </div>
        <style>
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        </style>
      `;

      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeAutomation);
    } else {
      initializeAutomation();
    }

    function initializeAutomation() {
      createFloatingGUI();

      // Add delay before checking existing automation
      setTimeout(() => {
        try {
          const pageType = JSON.parse(localStorage.getItem("pageType"));
          const existingData = getAutomationData();
          const automationState = localStorage.getItem("automationState");

          // Case 1: First time initialization
          if (
            pageType === "login-page" &&
            !existingData &&
            automationState === State.INIT
          ) {
            showNotification(
              "success",
              "✅ First Time Setup",
              "Teetime Automation is ready to use"
            );
            localStorage.removeItem("teetime_state");
            return;
          }

          // Case 2: Booking page initialization
          else if (
            pageType === "booking-page" &&
            automationState === State.INIT &&
            !existingData
          ) {
            showNotification(
              "success",
              "✅ Automation Active",
              "You can now start the booking process"
            );
            return;
          }

          // // Case 3: Login page resumed from stop state
          // else if (
          //   pageType === "login-page" &&
          //   automationState === State.STOP &&
          //   existingData
          // ) {
          //   showNotification(
          //     "success",
          //     "✅ Automation Resumed",
          //     "Continuing with existing settings"
          //   );
          //   return;
          // }

          // // Case 4: Booking page resumed from stop state
          // else if (
          //   pageType === "booking-page" &&
          //   automationState === State.STOP &&
          //   existingData
          // ) {
          //   showNotification("success", "✅ Automation Resumed", "Continuing with existing settings");
          //   return;
          // }

          // Active automation cases
          if (existingData?.isAutomationActive) {
            const detectPageType = localStorage.getItem("pageType");
            console.log("[State Management] Page Type:", detectPageType);
            if (
              pageType === "booking-page" &&
              detectPageType === "booking-page" &&
              (automationState === State.BOOKING_STARTED ||
                automationState === State.COURSE_SELECTED ||
                automationState === State.DATE_SELECTED ||
                automationState === State.TIME_SELECTED)
            ) {
              showNotification(
                "success",
                "✅ Automation Resumed on Booking Page",
                "Booking process is in progress"
              );
            } else if (
              pageType === "login-page" &&
              automationState === State.INIT &&
              existingData !== null
            ) {
              showNotification(
                "warning",
                "⚠️ Session Expired",
                "Please log in to continue automation"
              );

              // Clear the existing data
              clearAutomationData();

              // Automatically reload the page
              location.reload();
            }
            return;
          }

          // Existing data but inactive automation
          if (existingData && !existingData.isAutomationActive) {
            showNotification(
              "warning",
              "⚠️ Automation Paused",
              "Click Start to resume automation"
            );
            return;
          }

          // Unknown or error states
          if (pageType === "unknown-page") {
            showNotification(
              "error",
              "❌ Navigation Error",
              "Unable to determine current page"
            );
          }
        } catch (error) {
          console.error("Initialization error:", error);
          showNotification(
            "error",
            "❌ Something went wrong",
            "Please refresh the page or try again later"
          );
        }
      }, 3000);
    }
  })();
}, 1000);
