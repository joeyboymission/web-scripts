// ==UserScript==
// @name         Booking Date Selector
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  A simple script to set the booking date on the Tagaytay Highlands Teetime website. The script will automatically select the target date if it is available, otherwise it will search for the next available date within the next 30 days
// @author       JOIBOI and Keiane
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

    function findNextAvailableDate() {
      const calendar = $("#ui-datepicker-div");
      if (!calendar.length) return null;

      let currentDate = new Date(targetDate.year, targetDate.month, targetDate.day);
      const maxDays = 30;
      let daysChecked = 0;

      while (daysChecked < maxDays) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();

        if (isDateAvailable(year, month, day)) {
          return { year, month, day };
        }

        currentDate.setDate(currentDate.getDate() + 1);
        daysChecked++;
      }
      return null;
    }

    function selectDateInCalendar() {
      try {
        if (isDateAvailable(targetDate.year, targetDate.month, targetDate.day)) {
          console.log(`Target date ${targetDate.year}-${targetDate.month + 1}-${targetDate.day} is available`);
          return clickDate(targetDate.year, targetDate.month, targetDate.day);
        }

        console.log('Target date not available, searching for next available date');
        const nextDate = findNextAvailableDate();
        if (!nextDate) {
          console.error("No available dates found within the next 30 days");
          return false;
        }

        console.log(`Found next available date: ${nextDate.year}-${nextDate.month + 1}-${nextDate.day}`);
        return clickDate(nextDate.year, nextDate.month, nextDate.day);
      } catch (error) {
        console.error("Error in selectDateInCalendar:", error);
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
          console.log(`Clicked date: ${year}-${month + 1}-${day}`);
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
      if (checkIfDateSelected()) {
        console.log('Date successfully selected');
        removeDatepickerFocus();
        clearInterval(interval);
        return;
      }

      if (attempts >= maxAttempts) {
        console.error("Maximum attempts reached");
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
              console.log('Date selection confirmed');
              clearInterval(interval);
            }
          }, 500);
        }
      }

      attempts++;
    }, 1000);
  })();
}, 3000);
