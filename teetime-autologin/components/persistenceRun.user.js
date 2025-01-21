// ==UserScript==
// @name         Persistence Automation Test
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  This script is for testing the persistence of the auto-login and booking on Tagaytay Highlands Teetime website.
// @author       JOIBOI and Keiane
// @match        https://tagaytayhighlands-teetime.com/
// @match        https://tagaytayhighlands-teetime.com/index.php?w=1
// @match        https://tagaytayhighlands-teetime.com/index.php
// @match        https://tagaytayhighlands-teetime.com/t/index.php?v=1
// @match        https://tagaytayhighlands-teetime.com/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

// The goal is when the script automation is succesfully logged in, it will automatically book a tee time without interrupting the script.
// As when the web page is refreshed, the script will automatically log in and book a tee time without any user intervention.

setTimeout(() => {
  (function () {
    "use strict";

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

            let player1f = "John Doe";
            let player1l = "Doe";
            // Member 3 is the user's companionl
            let player2f = "Jane Doe";
            let player2l = "Doe";
            // Member 4 is the user's companion
            let player3f = "Nathan"
            let player3l = "Drake";

            let availablePlayers = [];

            // Input the user's companion's details to the registration form
            // Validate first if the parameters are defined or not
            if (!player1f || !player1l) {
            console.error("Player 1 not fully defined");
            alert("Player 1 not fully defined");
            return;
            }
            if (!player2f || !player2l) {
            console.error("Player 2 not fully defined");
            alert("Player 2 not fully defined");
            return;
            }
            if (!player3f || !player3l) {
            console.error("Player 3 not fully defined");
            alert("Player 3 not fully defined");
            return;
            }

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
  })();
}, 1000);
