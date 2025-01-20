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
// @grant        none
// ==/UserScript==

setTimeout(() => {
    (function() {
        'use strict';

        const targetTime = '13:50';

        function activateDropdown() {
            const timeSelect = document.querySelector('select#golftime.form-control[name="time"]');
            if (!timeSelect) {
                console.error('Dropdown not found');
                return null;
            }

            // Attempt to focus and click the dropdown
            try {
                timeSelect.focus();
                timeSelect.click();
                console.log('Dropdown activated');
                return timeSelect;
            } catch (error) {
                console.error('Failed to activate dropdown:', error);
                return null;
            }
        }

        function findAvailableSlots(dropdown) {
            if (!dropdown) return [];

            // Get all options and filter out disabled/invalid ones
            const slots = Array.from(dropdown.options).filter(option => {
                const isEnabled = !option.disabled && !option.hasAttribute('disabled');
                const hasValidTime = option.value && option.value.match(/^\d{2}:\d{2}$/);
                return isEnabled && hasValidTime;
            });

            console.log(`Found ${slots.length} available time slots`);
            return slots;
        }

        function selectTimeSlot(dropdown, slots) {
            if (!dropdown || !slots.length) return false;

            // Try to find exact target time
            const exactMatch = slots.find(opt => opt.value === targetTime);
            if (exactMatch) {
                console.log(`Found exact time match: ${targetTime}`);
                dropdown.value = targetTime;
                dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }

            // Find next available time if target not found
            const nextTime = slots
                .map(opt => opt.value)
                .sort()
                .find(time => time > targetTime);

            if (nextTime) {
                console.log(`Selected next available time: ${nextTime}`);
                dropdown.value = nextTime;
                dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }

            console.error('No suitable time slots found');
            return false;
        }

        function attemptTimeSelection() {
            const dropdown = activateDropdown();
            if (!dropdown) return false;

            const availableSlots = findAvailableSlots(dropdown);
            return selectTimeSlot(dropdown, availableSlots);
        }

        // Initial attempt when page loads
        window.addEventListener('load', () => {
            // Try immediately and set up retry if needed
            if (!attemptTimeSelection()) {
                console.log('Initial attempt failed, retrying in 2 seconds...');
                setTimeout(attemptTimeSelection, 2000);
            }

            // Set up observer for dynamic updates
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        attemptTimeSelection();
                    }
                }
            });

            const resultsDiv = document.getElementById('results2');
            if (resultsDiv) {
                observer.observe(resultsDiv, { childList: true, subtree: true });
            }
        });
    })();
}, 8000);