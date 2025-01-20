// ==UserScript==
// @name         Booking Time Selector
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  A simple script to set the booking time on the Tagaytay Highlands Teetime website.
// @author       JOIBOI and Keiane
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
        console.log('Script initialized with target time:', targetTime);

        function findTimeDropdown() {
            console.log('Attempting to find time dropdown...');
            
            // Try multiple selectors to ensure we find the dropdown
            const selectors = [
                'select#golftime[name="time"]',
                'select#golftime',
                'select[name="time"]'
            ];

            for (const selector of selectors) {
                const dropdown = document.querySelector(selector);
                if (dropdown) {
                    console.log('Found dropdown using selector:', selector);
                    return dropdown;
                }
            }

            console.error('Time dropdown not found with any selector');
            return null;
        }

        function getAvailableTimeSlots(dropdown) {
            console.log('Scanning for available time slots...');

            if (!dropdown) return [];

            // Convert options to array and filter
            const options = Array.from(dropdown.options);
            const availableSlots = options.filter(option => {
                // Skip the default "Select Time" option
                if (option.value === '') return false;
                
                // Include option if it has a valid time value format (HH:MM)
                const isValidTime = /^\d{2}:\d{2}$/.test(option.value);
                return isValidTime;
            });

            console.log(`Found ${availableSlots.length} available time slots`);
            availableSlots.forEach(slot => console.log(`Available slot: ${slot.value}`));
            
            return availableSlots;
        }

        function selectTargetTime(dropdown, availableSlots) {
            console.log(`Attempting to select target time: ${targetTime}`);

            if (!dropdown || availableSlots.length === 0) {
                console.error('Cannot select time: invalid dropdown or no available slots');
                return false;
            }

            // Find exact match
            const exactMatch = availableSlots.find(opt => opt.value === targetTime);
            
            if (exactMatch) {
                console.log(`Found exact match for ${targetTime}`);
                dropdown.value = targetTime;
                dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('Time selection successful');
                return true;
            }

            // If no exact match, find next available time
            const nextAvailable = availableSlots
                .map(opt => opt.value)
                .sort()
                .find(time => time > targetTime);

            if (nextAvailable) {
                console.log(`Selected next available time: ${nextAvailable}`);
                dropdown.value = nextAvailable;
                dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }

            console.error('No suitable time slot found');
            return false;
        }

        function executeTimeSelection() {
            console.log('Starting time selection process...');
            
            const dropdown = findTimeDropdown();
            if (!dropdown) return;

            const availableSlots = getAvailableTimeSlots(dropdown);
            if (availableSlots.length === 0) {
                console.log('Retrying in 2 seconds...');
                setTimeout(executeTimeSelection, 2000);
                return;
            }

            const success = selectTargetTime(dropdown, availableSlots);
            if (success) {
                console.log('Time selection completed successfully');
            } else {
                console.log('Time selection failed, retrying in 2 seconds...');
                setTimeout(executeTimeSelection, 2000);
            }
        }

        // Initial execution
        console.log('Starting script execution after 8 second delay...');
        executeTimeSelection();

        // Set up observer for dynamic updates
        const observer = new MutationObserver((mutations) => {
            console.log('Detected page changes, rechecking time selection...');
            executeTimeSelection();
        });

        const resultsDiv = document.getElementById('results2');
        if (resultsDiv) {
            observer.observe(resultsDiv, { childList: true, subtree: true });
            console.log('Observer set up for dynamic updates');
        }
    })();
}, 8000);