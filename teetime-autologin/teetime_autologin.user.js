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

    // State management
    let isAutomationActive = false;
    let formContainer = null;

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
            .map(([value, name]) => `<option value="${value}">${name}</option>`)
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
            .map(([value, label]) => `
              <div style="margin-bottom: 5px;">
              <input type="checkbox" id="time_${value}" value="${value}" style="margin-right: 5px;">
              <label for="time_${value}">${label}</label>
              </div>
              `).join("")}
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
              <div style="font-size: 13px;">Next Run: <span id="nextRunTime" style="font-weight: 500;">Not scheduled</span></div>
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

    // Setup the event listeners for the GUI
    // Start and Stop buttons
    function setupGUIEventListeners() {
        // Start button
        document.getElementById("startBtn")?.addEventListener("click", () => {
            console.log("Start button clicked - checking form values:");
            debugFormValues();

            if (validateInputs()) {
                triggerStart();
                updateStatus("Trigger time set activated");
            } else {
                console.log("Validation failed - see above logs for details");
            }
        });

        // Stop button
        document.getElementById("stopBtn")?.addEventListener("click", () => {
            //stopAutomation(); // This will be implemented later
            updateStatus("Automation stopped");
            console.log("Automation stopped");
        });

        // Minimize button
        document.getElementById("minimizeGUI")?.addEventListener("click", () => {
            const content = document.getElementById("guiContent");
            if (content) {
                content.style.display = content.style.display === "none" ? "block" : "none";
            }
        });
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
        }
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
      const bookingDate = new Date(formInputs.bookingDate.value);
      if (isNaN(bookingDate.getTime())) {
        console.log(`❌ Invalid booking date: ${formInputs.bookingDate.value}`);
        alert("Please select a valid booking date");
        return false;
      }

      console.log("✅ All validations passed successfully");
      updateStatus("Validation successful");
      return true;
    }

    // Time trigger function
    function triggerStart() {
      // Get trigger datetime from input
      const triggerInput = document.getElementById("triggerTime_input");
      const triggerDateTime = new Date(triggerInput.value);
      const now = new Date();

      // Validate the datetime
      if (isNaN(triggerDateTime.getTime())) {
          console.log('❌ Error: Invalid trigger date and time');
          return false;
      }

      // Check if trigger time is in the past
      console.log('Current time:', now.toLocaleString());
      console.log('Trigger time:', triggerDateTime.toLocaleString());

      if (triggerDateTime <= now) {
          console.log('❌ Error: Trigger date and time must be set to a future date and time');
          return false;
      }

      console.log('✅ Trigger date and time is set to a future date and time');
      
      // Calculate time remaining in milliseconds
      const timeRemaining = triggerDateTime - now;
      console.log(`Time remaining: ${Math.floor(timeRemaining / 1000)} seconds`);

      // Set up the main program execution when the trigger time is reached
      setTimeout(() => {
          console.log('🚀 Executing main program...');
          // Execute the main automation logic
          startAutomation();
      }, timeRemaining);

      return true;
    }

    // Add this helper function to check form values at any time
    function debugFormValues() {
      const inputValues = {
        username: document.getElementById("username_input")?.value,
        password: document.getElementById("password_input")?.value,
        triggerTime: document.getElementById("triggerTime_input")?.value,
        course: document.getElementById("courseSelect_input")?.value,
        bookingDate: document.getElementById("bookingDate_input")?.value,
        timeSlots: JSON.stringify(Array.from(
          document.querySelectorAll('input[type="checkbox"]:checked')
        ).map((cb) => cb.value)),
        member2_firstname: document.getElementById("member2_fn")?.value,
        member2_lastname: document.getElementById("member2_ln")?.value,
        member3_firstname: document.getElementById("member3_fn")?.value,
        member3_lastname: document.getElementById("member3_ln")?.value,
        member4_firstname: document.getElementById("member4_fn")?.value,
        member4_lastname: document.getElementById("member4_ln")?.value,
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

    // Main function and automation
    function startAutomation() {
      // State management
      const State = {
        INIT: "INIT",
        LOGIN_STARTED: "LOGIN_STARTED",
        LOGIN_COMPLETED: "LOGIN_COMPLETED",
        BOOKING_STARTED: "BOOKING_STARTED",
        COURSE_SELECTED: "COURSE_SELECTED",
        DATE_SELECTED: "DATE_SELECTED",
        TIME_SELECTED: "TIME_SELECTED",
        BOOKING_COMPLETED: "BOOKING_COMPLETED",
      };

      // Get current state or set initial state
      let currentState = localStorage.getItem("automationState") || State.INIT;
      console.log("[State Management] Current State:", currentState);

      function updateState(newState) {
        currentState = newState;
        localStorage.setItem("automationState", newState);
        console.log("[State Management] State updated to:", newState);
      }

      // Include the Page detection for monitoring the page
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

        if (loginPages.includes(currentURL)) {
          console.log("Login page detected");
          return "login";
        } else if (bookingPages.some((url) => currentURL.includes(url))) {
          console.log("Booking page detected");
          return "booking";
        } else {
          console.log("Unknown page detected");
          return "unknown";
        }
      }

      // Execute page detection
      const pageType = detectPage();
      console.log("[Page Detection] Current page type:", pageType);

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

      if (pageType === "login") {
        console.log("[Login Page] Starting login process");
        if (currentState !== State.LOGIN_COMPLETED) {
          let username = "MG03787-000";
          let password = "nobhill2025";

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
                  const rememberMe = loginForm.querySelector("#inlineFormCheck");
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
      } else if (pageType === "booking") {
        console.log("[Booking Page] Starting booking process");
        if (currentState !== State.BOOKING_COMPLETED) {
          const defaultCourse = "2";
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
              courseDropdown.value = defaultCourse;
              const event = new Event("change", { bubbles: true });
              courseDropdown.dispatchEvent(event);

              console.log(
                `[Booking Page] Selected course: ${courseNames[defaultCourse]}`
              );

              const courseDiv = document.getElementById(defaultCourse);
              if (courseDiv) {
                courseDiv.style.display = "block";
                updateState(State.COURSE_SELECTED);
                console.log("[Booking Page] Course selection completed");

                // Trigger date selection after course is selected
                setTimeout(initiateDateSelection, 2000);
              }
            } else {
              console.error("[Booking Page] Course dropdown not found");
            }
          }

          // Function to initiate date selection after course is selected
          function initiateDateSelection() {
            console.log("[Date Selection] Starting date selection process");
            const targetDate = {
              year: 2025,
              month: 0, // January = 0
              day: 23,
            };

            function dateSelectionComplete() {
              updateState(State.DATE_SELECTED);
              console.log("[Date Selection] Date selection completed");

              // Trigger time selection after date is selected with delay
              console.log("[Time Selection] Waiting 1 second before starting time selection...");
              setTimeout(initiateTimeSelection, 1000); // Reduced delay to 1 second
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
                    `Target date ${targetDate.year}-${targetDate.month + 1}-${targetDate.day
                    } is available, selecting it`
                  );
                  return clickDate(
                    targetDate.year,
                    targetDate.month,
                    targetDate.day
                  );
                }

                // If target date is not available, log and terminate
                console.log(
                  `Target date ${targetDate.year}-${targetDate.month + 1}-${targetDate.day
                  } is not available`
                );
                console.log(
                  "Script terminating as requested date is unavailable"
                );
                removeDatepickerFocus();
                clearInterval(interval);
                return false;
              } catch (error) {
                console.error("Error selecting date:", error);
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
                console.log(`Date selected in ${activeDatepicker.attr('id')}: ${activeDatepicker.val()}`);
                dateSelectionComplete(); // Call dateSelectionComplete when date is selected
                return true;
              }
              return false;
            }

            function removeDatepickerFocus() {
              const activeDatepicker = getActiveDatepicker();
              if (activeDatepicker) {
                activeDatepicker.blur();
                console.log(`Removed focus from ${activeDatepicker.attr("id")}`);
              }
            }

            const maxAttempts = 10;
            let attempts = 0;
            let datepickerOpened = false;

            const interval = setInterval(() => {
              debugDatepicker();

              if (checkIfDateSelected()) {
                console.log("[Date Selection] Target date successfully selected");
                removeDatepickerFocus();
                clearInterval(interval);
                return;
              }

              if (attempts >= maxAttempts) {
                console.error("Failed to select date after maximum attempts");
                removeDatepickerFocus();
                clearInterval(interval);
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
                      clearInterval(interval);
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
            const targetTime = ['14:30', '14:40', '14:50'];

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
                `Checking time ${timeValue}: ${available ? "Available" : "Not available"
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

              console.log("No available time slots found for any target times");
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

            function checkIfTimeSelected() {
              const timeSelect = $('select[name="time"]');
              if (timeSelect.length && timeSelect.val()) {
                return timeSelect.val() !== "";
              }
              return false;
            }

            function removeTimeSelectFocus() {
              const timeSelect = $('select[name="time"]');
              if (timeSelect.length) {
                timeSelect.blur();
                console.log("Removed focus from time select");
              }
            }

              let player1f = "";
              let player1l = "";
              // Member 3 is the user's companionl
              let player2f = "Jane Doe";
              let player2l = "Doe";
              // Member 4 is the user's companion
              let player3f = "Nathan"
              let player3l = "Drake";

              let availablePlayers = [];

              function inputPlayerDetails() {
              // Wait for time selection to complete
              if (!checkIfTimeSelected()) {
                setTimeout(inputPlayerDetails, 3000);
                return;
              }

              console.log("Starting player input process");

              // Function to input player details
              function inputPlayer(number, firstName, lastName) {
                const firstNameField = document.querySelector(`input[name="player${number}f"]`);
                const lastNameField = document.querySelector(`input[name="player${number}l"]`);
                
                if (firstNameField && lastNameField) {
                firstNameField.focus();
                firstNameField.value = firstName;
                firstNameField.dispatchEvent(new Event('input'));
                
                lastNameField.focus();
                lastNameField.value = lastName;
                lastNameField.dispatchEvent(new Event('input'));
                
                console.log(`Player ${number} details input complete`);
                return true;
                }
                return false;
              }

              // Sequence the player inputs
              setTimeout(() => inputPlayer(1, player1f, player1l), 1000);
              setTimeout(() => inputPlayer(2, player2f, player2l), 2000);
              setTimeout(() => inputPlayer(3, player3f, player3l), 3000);
              }

              // Start the player input process after time selection
              inputPlayerDetails();



            // Main execution logic
            const maxAttempts = 5;
            let attempts = 0;
            let dropdownOpened = false;

            const interval = setInterval(() => {
              debugTimeSelect();

              // Check if time is already selected correctly
              if (checkIfTimeSelected()) {
                console.log("Time successfully selected, stopping script");
                removeTimeSelectFocus();
                clearInterval(interval);

                // Start the companion details input
                setTimeout(inputCompanionDetails, 2000);
                return;
              }

              if (attempts >= maxAttempts) {
                console.error("Failed to select time after maximum attempts");
                removeTimeSelectFocus();
                clearInterval(interval);
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
                    clearInterval(interval);
                  }
                }, 500);
              }

              attempts++;
            }, 1000);
          }

          function inputCompanionDetails() {
            console.log('[Companion Details] Initializing companion details input process');
            
            const companions = {
              player2: { first: 'Bea', last: 'Tronco' },
              player3: { first: 'Joaquin', last: 'Tronco' },
              player4: { first: 'Lloyd', last: 'Tronco' }
            };

            // Function to scan for form group presence
            function scanForFormGroup() {
              console.log('[Form Scanner] Starting form group scan');
              
              // Look for specific elements that indicate form presence
              const formGroupIndicators = {
                container: document.querySelector('.form-group'),
                player2Label: document.querySelector('label:contains("Player 2:")'),
                player2Input: document.querySelector('input[name="player1f"]'),
                anyPlayerInput: document.querySelector('input[name^="player"]')
              };

              // Log what we found
              Object.entries(formGroupIndicators).forEach(([key, element]) => {
                console.log(`[Form Scanner] ${key}: ${element ? 'Found' : 'Not Found'}`);
              });

              return formGroupIndicators.container && formGroupIndicators.anyPlayerInput;
            }

            // Function to wait for form elements to be ready
            function waitForForm() {
              console.log('[Form Wait] Starting form wait cycle');
              
              return new Promise((resolve) => {
                let attempts = 0;
                const maxAttempts = 30;
                
                const checkForm = setInterval(() => {
                  attempts++;
                  console.log(`[Form Wait] Attempt ${attempts}/${maxAttempts}`);
                  
                  if (scanForFormGroup()) {
                    console.log('[Form Wait] Form group found, proceeding with input');
                    clearInterval(checkForm);
                    resolve(true);
                  } else if (attempts >= maxAttempts) {
                    console.log('[Form Wait] Max attempts reached, stopping wait cycle');
                    clearInterval(checkForm);
                    resolve(false);
                  }
                }, 1000);
              });
            }

            // Function to input a single player's details
            function inputPlayerDetails(playerNum, firstName, lastName) {
              console.log(`[Player Input] Attempting to input details for Player ${playerNum}`);
              
              const firstNameField = document.querySelector(`input[name="player${playerNum}f"]`);
              const lastNameField = document.querySelector(`input[name="player${playerNum}l"]`);
              
              if (!firstNameField || !lastNameField) {
                console.error(`[Player Input] Could not find input fields for Player ${playerNum}`);
                return false;
              }

              try {
                // Clear existing values first
                firstNameField.value = '';
                lastNameField.value = '';
                
                // Input new values
                firstNameField.value = firstName;
                lastNameField.value = lastName;
                
                // Trigger events
                ['input', 'change', 'blur'].forEach(eventType => {
                  firstNameField.dispatchEvent(new Event(eventType, { bubbles: true }));
                  lastNameField.dispatchEvent(new Event(eventType, { bubbles: true }));
                });

                console.log(`[Player Input] Successfully input details for Player ${playerNum}`);
                return true;
              } catch (error) {
                console.error(`[Player Input] Error inputting details for Player ${playerNum}:`, error);
                return false;
              }
            }

            // Function to verify player details
            function verifyPlayerDetails(playerNum, firstName, lastName) {
              const firstNameField = document.querySelector(`input[name="player${playerNum}f"]`);
              const lastNameField = document.querySelector(`input[name="player${playerNum}l"]`);
              
              const firstNameMatch = firstNameField?.value === firstName;
              const lastNameMatch = lastNameField?.value === lastName;
              
              console.log(`[Verify] Player ${playerNum} First Name: ${firstNameMatch ? 'Match' : 'Mismatch'}`);
              console.log(`[Verify] Player ${playerNum} Last Name: ${lastNameMatch ? 'Match' : 'Mismatch'}`);
              
              return firstNameMatch && lastNameMatch;
            }

            // Main execution function
            async function executeInputProcess() {
              console.log('[Execute] Starting main input process');
              
              const formReady = await waitForForm();
              if (!formReady) {
                console.error('[Execute] Form not found after maximum attempts');
                return;
              }

              // Add a small delay after form is found
              await new Promise(resolve => setTimeout(resolve, 1000));

              // Input details for each player
              const playerInputs = [
                { num: '1', data: companions.player2 },
                { num: '2', data: companions.player3 },
                { num: '3', data: companions.player4 }
              ];

              let allInputsSuccessful = true;
              
              for (const player of playerInputs) {
                const success = inputPlayerDetails(player.num, player.data.first, player.data.last);
                if (!success) {
                  allInputsSuccessful = false;
                  break;
                }
                // Add small delay between inputs
                await new Promise(resolve => setTimeout(resolve, 500));
              }

              if (allInputsSuccessful) {
                console.log('[Execute] All player details input successfully');
                
                // Verify all inputs
                const allVerified = playerInputs.every(player => 
                  verifyPlayerDetails(player.num, player.data.first, player.data.last)
                );

                if (allVerified) {
                  console.log('[Execute] All player details verified successfully');
                  updateState(State.BOOKING_COMPLETED);
                } else {
                  console.log('[Execute] Verification failed, retrying entire process');
                  setTimeout(executeInputProcess, 1000);
                }
              } else {
                console.log('[Execute] Some inputs failed, retrying entire process');
                setTimeout(executeInputProcess, 1000);
              }
            }

            // Start the process
            executeInputProcess();
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

    // Initialize GUI when page loads
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createFloatingGUI);
    } else {
      createFloatingGUI();
    }
  })();
}, 1000);
