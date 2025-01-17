// ==UserScript==
// @name         Booking Date Selector
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  A simple script to set the booking date on the Tagaytay Highlands Teetime website.
// @author       JOIBOI
// @match        https://tagaytayhighlands-teetime.com/
// @match        https://tagaytayhighlands-teetime.com/index.php?w=1
// @match        https://tagaytayhighlands-teetime.com/index.php
// @match        https://tagaytayhighlands-teetime.com/t/index.php?v=1
// @match        https://tagaytayhighlands-teetime.com/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

setTimeout(() => {
  (function () {
    "use strict";

    // Default date configuration (YYYY-MM-DD format)
    const targetDate = {
      year: 2025,
      month: 0, // January = 0
      day: 22,
    };

    function openDatepicker() {
      try {
        const dateInput = $('input[name="golfdate4"]');
        if (dateInput.length) {
          dateInput.focus();
          dateInput[0].click();
          console.log('Opened datepicker');
          return true;
        }
        console.error('Date input not found');
        return false;
      } catch (error) {
        console.error('Error opening datepicker:', error);
        return false;
      }
    }

    function selectDateInCalendar() {
      try {
        const dateCell = $(
          `td[data-handler="selectDay"][data-month="${targetDate.month}"][data-year="${targetDate.year}"]`
        ).filter(function () {
          return (
            $(this).find("a.ui-state-default").text() ===
            targetDate.day.toString()
          );
        });

        if (dateCell.length) {
          const dateLink = dateCell.find("a.ui-state-default");
          if (dateLink.length) {
            dateLink[0].click();
            console.log(
              `Successfully clicked date: ${targetDate.year}-${
                targetDate.month + 1
              }-${targetDate.day}`
            );
            return true;
          }
        }
        console.error("Target date cell not found or not clickable");
        return false;
      } catch (error) {
        console.error("Error selecting date:", error);
        return false;
      }
    }

    function debugDatepicker() {
      const datepickerState = {
        isVisible: $('#ui-datepicker-div').is(':visible'),
        dateInput: {
          exists: $('#golfdate4').length > 0,
          value: $('#golfdate4').val(),
          readonly: $('#golfdate4').prop('readonly'),
          hasDatepicker: $('#golfdate4').hasClass('hasDatepicker')
        }
      };
      console.log('Datepicker state:', datepickerState);
    }

    function checkIfDateSelected() {
      const dateInput = $('#golfdate4');
      if (dateInput.length && dateInput.val()) {
        const selectedDate = new Date(dateInput.val());
        return (
          selectedDate.getFullYear() === targetDate.year &&
          selectedDate.getMonth() === targetDate.month &&
          selectedDate.getDate() === targetDate.day
        );
      }
      return false;
    }

    // Main execution logic
    const maxAttempts = 10;
    let attempts = 0;
    let datepickerOpened = false;

    const interval = setInterval(() => {
      debugDatepicker();

      // Check if date is already selected correctly
      if (checkIfDateSelected()) {
        console.log('Target date successfully selected, stopping script');
        clearInterval(interval);
        return;
      }

      if (attempts >= maxAttempts) {
        console.error("Failed to select date after maximum attempts");
        clearInterval(interval);
        return;
      }

      // First try to open the datepicker if not already opened
      if (!datepickerOpened) {
        datepickerOpened = openDatepicker();
        attempts++;
        return;
      }

      // Check if calendar is visible and try to select date
      const calendar = $("#ui-datepicker-div");
      if (calendar.length && calendar.is(":visible")) {
        if (selectDateInCalendar()) {
          // Wait a short moment to verify the selection was successful
          setTimeout(() => {
            if (checkIfDateSelected()) {
              console.log('Date selection confirmed successful');
              clearInterval(interval);
            }
          }, 500);
        }
      }

      attempts++;
    }, 1000);
  })();
}, 3000);
