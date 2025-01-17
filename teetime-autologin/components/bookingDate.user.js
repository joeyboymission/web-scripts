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
        // Find the date input
        const dateInput = $('input[name="golfdate4"]');
        
        if (dateInput.length) {
          // Focus and click the input to open the datepicker
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
        // Find the specific date cell using data attributes
        const dateCell = $(
          `td[data-handler="selectDay"][data-month="${targetDate.month}"][data-year="${targetDate.year}"]`
        ).filter(function () {
          return (
            $(this).find("a.ui-state-default").text() ===
            targetDate.day.toString()
          );
        });

        if (dateCell.length) {
          // Click the date cell
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
      // Log datepicker state
      console.log('Datepicker visible:', $('#ui-datepicker-div').is(':visible'));
      
      // Log available selectable dates
      $('td[data-handler="selectDay"]').each(function() {
          console.log('Selectable date:', {
              day: $(this).find('a').text(),
              month: $(this).attr('data-month'),
              year: $(this).attr('data-year'),
              classes: $(this).attr('class'),
              clickable: $(this).find('a').length > 0
          });
      });
  
      // Log input field state
      const dateInput = $('#golfdate4');
      console.log('Date input:', {
          exists: dateInput.length > 0,
          value: dateInput.val(),
          readonly: dateInput.prop('readonly'),
          hasDatepicker: dateInput.hasClass('hasDatepicker')
      });
    }

    // Wait for page load and try to select the date
    const maxAttempts = 10;
    let attempts = 0;
    let datepickerOpened = false;

    const interval = setInterval(() => {
      debugDatepicker();
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error("Failed to select date after maximum attempts");
        return;
      }

      // First try to open the datepicker if not already opened
      if (!datepickerOpened) {
        datepickerOpened = openDatepicker();
        attempts++;
        return;
      }

      // Check if calendar is visible and date cells are loaded
      const calendar = $("#ui-datepicker-div");
      if (calendar.length && calendar.is(":visible")) {
        if (selectDateInCalendar()) {
          clearInterval(interval);
        }
      }

      attempts++;
    }, 1000);
  })();
}, 3000);
