// ==UserScript==
// @name         Booking Time Selector
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  A simple script to set the booking time on the Tagaytay Highlands Teetime website.
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
    (function() {
        'use strict';

        // Default time configuration - ordered chronologically
        const targetTime = ['13:50', '14:00', '14:10', '14:20'];

        function isTimeAvailable(timeValue) {
            const timeOption = $('select[name="time"] option').filter(function() {
                return $(this).val() === timeValue;
            });

            const available = timeOption.length > 0 && 
                            !timeOption.prop('disabled') && 
                            !timeOption.attr('disabled');

            console.log(`Checking time ${timeValue}: ${available ? 'Available' : 'Not available'}`);
            return available;
        }

        function findNextAvailableTime() {
            const timeSelect = $('select[name="time"]');
            if (!timeSelect.length) {
                console.log('Time select element not found');
                return null;
            }

            // Check each target time in order
            for (const time of targetTime) {
                if (isTimeAvailable(time)) {
                    console.log(`Found available time slot: ${time}`);
                    return time;
                }
            }

            console.log('No available time slots found for any target times');
            return null;
        }
        
        function selectTimeInDropdown() {
            try {
                // First try to select the target time
                if (isTimeAvailable(targetTime)) {
                    console.log(`Target time ${targetTime} is available, selecting it`);
                    return selectTime(targetTime);
                }

                // If target time is not available, find next available time
                console.log(`Target time is not available, looking for next available time`);
                const nextTime = findNextAvailableTime();
                if (!nextTime) {
                    console.error("No available time slots found");
                    return false;
                }

                console.log(`Attempting to select next available time: ${nextTime}`);
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
                timeSelect.trigger('change');
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
                    timeSelect.trigger('click');
                    console.log('Opened time dropdown');
                    return true;
                }
                console.error('Time select not found');
                return false;
            } catch (error) {
                console.error('Error opening time dropdown:', error);
                return false;
            }
        }

        function debugTimeSelect() {
            const timeSelectState = {
                exists: $('select[name="time"]').length > 0,
                value: $('select[name="time"]').val(),
                disabled: $('select[name="time"]').prop('disabled'),
                optionsCount: $('select[name="time"] option').length
            };
            console.log('Time select state:', timeSelectState);
        }

        function checkIfTimeSelected() {
            const timeSelect = $('select[name="time"]');
            if (timeSelect.length && timeSelect.val()) {
                return timeSelect.val() !== '';
            }
            return false;
        }

        function removeTimeSelectFocus() {
            const timeSelect = $('select[name="time"]');
            if (timeSelect.length) {
                timeSelect.blur();
                console.log('Removed focus from time select');
            }
        }

        // Main execution logic
        const maxAttempts = 5;
        let attempts = 0;
        let dropdownOpened = false;

        const interval = setInterval(() => {
            debugTimeSelect();

            // Check if time is already selected correctly
            if (checkIfTimeSelected()) {
                console.log('Time successfully selected, stopping script');
                removeTimeSelectFocus();
                clearInterval(interval);
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
                        console.log('Time selection confirmed successful');
                        removeTimeSelectFocus();
                        clearInterval(interval);
                    }
                }, 500);
            }

            attempts++;
        }, 1000);
    })();
}, 7000);