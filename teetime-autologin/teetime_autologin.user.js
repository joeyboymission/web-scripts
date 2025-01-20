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

    // Constants
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

    function createFloatingGUI() {
      const div = document.createElement("div");
      div.innerHTML = `
          <div id="teetimeGUI" style="position: fixed; top: 50%; right: 20px; transform: translateY(-50%); 
          background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          width: 320px; max-height: 90vh; z-index: 9999; font-family: Arial, sans-serif;
          display: flex; flex-direction: column; margin-left: 20px; overflow: hidden;">

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
          <div id="guiContent" style="flex: 1; overflow-y: auto; padding-right: 15px; margin: 0 -10px 15px 0;">
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
              <label for="member4_fn" style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">First Name:</label>
              <input type="text" id="member4_fn" style="width: 100%; padding: 8px; box-sizing: border-box;" placeholder="First Name">
              </div>
              <div>
              <label for="member4_ln" style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Last Name:</label>
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

    function setupGUIEventListeners() {
        // Start button
        document.getElementById("startBtn")?.addEventListener("click", () => {
            console.log("Start button clicked - checking form values:");
            debugFormValues();

            if (validateInputs()) {
                startAutomation();
                updateStatus("Automation started");
            } else {
                console.log("Validation failed - see above logs for details");
            }
        });

        // Stop button
        document.getElementById("stopBtn")?.addEventListener("click", () => {
            stopAutomation();
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

    // Execute page detection
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

      // Check each input individually and log its state
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

    // Add this helper function to check form values at any time
    function debugFormValues() {
      const inputs = {
        username: document.getElementById("username_input")?.value,
        password: document.getElementById("password_input")?.value,
        triggerTime: document.getElementById("triggerTime_input")?.value,
        course: document.getElementById("courseSelect_input")?.value,
        bookingDate: document.getElementById("bookingDate_input")?.value,
        timeSlots: Array.from(
          document.querySelectorAll('input[type="checkbox"]:checked')
        ).map((cb) => cb.value),
        members: {
          member2: {
            firstName: document.getElementById("member2_fn")?.value || "",
            lastName: document.getElementById("member2_ln")?.value || ""
          },
          member3: {
            firstName: document.getElementById("member3_fn")?.value || "",
            lastName: document.getElementById("member3_ln")?.value || ""
          },
          member4: {
            firstName: document.getElementById("member4_fn")?.value || "",
            lastName: document.getElementById("member4_ln")?.value || ""
          }
        }
      };
      console.table(inputs);
      return inputs;
    }

    // Script status
    function updateStatus(message) {
      const statusText = document.getElementById("statusText");
      if (statusText) {
        statusText.textContent = message;
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
