// ==UserScript==
// @name         Debugging and Testing
// @namespace    http://tampermonkey.net/
// @version      2025-01-21
// @description  This is a debugging and testing script only
// @author       JOIBOI and Keiane
// @match        https://tagaytayhighlands-teetime.com/index.php
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuration for the trigger
    const triggerDateTime = {
        "value": "2025-01-21T21:05",
        "label": "Trigger Date and Time"
    };
    
    function checkTrigger() {
        // Get current date and time
        const now = new Date();
        const triggerDate = new Date(triggerDateTime.value);

        console.log('Current time:', now.toLocaleString());
        console.log('Trigger time:', triggerDate.toLocaleString());

        // Check if trigger date and time is in the past
        if (triggerDate <= now) {
            console.log('❌ Error: Trigger date and time must be set to a future date and time');
            return false;
        }

        console.log('✅ Trigger date and time is set to a future date and time');
        
        // Calculate time remaining in milliseconds
        const timeRemaining = triggerDate - now;
        console.log(`Time remaining: ${Math.floor(timeRemaining / 1000)} seconds`);

        // Set up the main program execution when the trigger time is reached
        setTimeout(() => {
            console.log('🚀 Executing main program...');
            
            // Place your main program code here
            // ================================
            // Add your code here
            
        }, timeRemaining);
    }

    // Initial check after 2 seconds
    setTimeout(checkTrigger, 2000);
})();