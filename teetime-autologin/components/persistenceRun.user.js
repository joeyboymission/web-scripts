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

        function initiateDateSelection() {
          console.log("[Date Selection] Starting date selection process");
          const targetDate = {
            year: 2025,
            month: 0, // January = 0
            day: 22,
          };

          function dateSelectionComplete() {
            updateState(State.DATE_SELECTED);
            console.log("[Date Selection] Date selection completed");
            updateState(State.BOOKING_COMPLETED);

            // Reset state after successful completion
            setTimeout(() => {
              localStorage.removeItem("automationState");
              console.log("[State Management] Automation completed, state reset");
            }, 2000);
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
                return clickDate(
                  targetDate.year,
                  targetDate.month,
                  targetDate.day
                );
              }

              // If target date is not available, log and terminate
              console.log(
                `Target date ${targetDate.year}-${targetDate.month + 1}-${
                  targetDate.day
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
              console.log(
                `Date selected in ${activeDatepicker.attr(
                  "id"
                )}: ${activeDatepicker.val()}`
              );
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

          // Main execution logic
          const maxAttempts = 10;
          let attempts = 0;
          let datepickerOpened = false;

          const interval = setInterval(() => {
            debugDatepicker();

            if (checkIfDateSelected()) {
              console.log("Target date successfully selected, stopping script");
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
