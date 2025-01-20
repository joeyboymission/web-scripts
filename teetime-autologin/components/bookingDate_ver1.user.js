// ==UserScript==
// @name         Booking Date Selector
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  A simple script to set the booking date on the Tagaytay Highlands Teetime website. The script will automatically select the target date if it is available, otherwise it will terminate
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
      day: 21,
    };

    // Array of all possible datepicker IDs
    const datepickerIds = ['golfdate', 'golfdate2', 'golfdate3', 'golfdate4'];

    function getActiveDatepicker() {
      // Find which datepicker is currently visible/active
      for (const id of datepickerIds) {
        const $datepicker = $(`#${id}`);
        if ($datepicker.length && $datepicker.closest('.myDiv').is(':visible')) {
          return $datepicker;
        }
      }
      return null;
    }

    function isDateAvailable(year, month, day) {
      const dateCell = $(
        `td[data-handler="selectDay"][data-month="${month}"][data-year="${year}"]`
      ).filter(function () {
        return $(this).find("a.ui-state-default").text() === day.toString();
      });

      return dateCell.length > 0 && 
             !dateCell.hasClass('ui-datepicker-unselectable') && 
             !dateCell.hasClass('ui-state-disabled');
    }

    function selectDateInCalendar() {
      try {
        // Try to select the target date only
        if (isDateAvailable(targetDate.year, targetDate.month, targetDate.day)) {
          console.log(`Target date ${targetDate.year}-${targetDate.month + 1}-${targetDate.day} is available, selecting it`);
          return clickDate(targetDate.year, targetDate.month, targetDate.day);
        }

        // If target date is not available, log and terminate
        console.log(`Target date ${targetDate.year}-${targetDate.month + 1}-${targetDate.day} is not available`);
        console.log('Script terminating as requested date is unavailable');
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
        return $(this).find("a.ui-state-default").text() === day.toString();
      });

      if (dateCell.length) {
        const dateLink = dateCell.find("a.ui-state-default");
        if (dateLink.length) {
          dateLink[0].click();
          console.log(`Successfully clicked date: ${year}-${month + 1}-${day}`);
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
          console.log(`Opened datepicker: ${activeDatepicker.attr('id')}`);
          return true;
        }
        console.error('No visible datepicker found');
        return false;
      } catch (error) {
        console.error('Error opening datepicker:', error);
        return false;
      }
    }

    function debugDatepicker() {
      const activeDatepicker = getActiveDatepicker();
      if (activeDatepicker) {
        const datepickerState = {
          id: activeDatepicker.attr('id'),
          isVisible: $('#ui-datepicker-div').is(':visible'),
          value: activeDatepicker.val(),
          readonly: activeDatepicker.prop('readonly'),
          hasDatepicker: activeDatepicker.hasClass('hasDatepicker')
        };
        console.log('Active datepicker state:', datepickerState);
      } else {
        console.log('No active datepicker found');
      }
    }

    function checkIfDateSelected() {
      const activeDatepicker = getActiveDatepicker();
      if (activeDatepicker && activeDatepicker.val()) {
        console.log(`Date selected in ${activeDatepicker.attr('id')}: ${activeDatepicker.val()}`);
        return true;
      }
      return false;
    }

    function removeDatepickerFocus() {
      const activeDatepicker = getActiveDatepicker();
      if (activeDatepicker) {
        activeDatepicker.blur();
        console.log(`Removed focus from ${activeDatepicker.attr('id')}`);
      }
    }

    // Main execution logic
    const maxAttempts = 10;
    let attempts = 0;
    let datepickerOpened = false;

    const interval = setInterval(() => {
      debugDatepicker();

      if (checkIfDateSelected()) {
        console.log('Target date successfully selected, stopping script');
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
