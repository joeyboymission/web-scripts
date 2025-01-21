// ==UserScript==
// @name         Time Trigger Test
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  This is a test script for auto-login and booking on Tagaytay Highlands Teetime website.
// @author       JOIBOI and Keiane
// @match        https://tagaytayhighlands-teetime.com/
// @match        https://tagaytayhighlands-teetime.com/index.php?w=1
// @match        https://tagaytayhighlands-teetime.com/index.php
// @match        https://tagaytayhighlands-teetime.com/t/index.php?v=1
// @match        https://tagaytayhighlands-teetime.com/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// ==/UserScript==

// Configuration for the trigger
const triggerDateTime = {
    "value": "2025-01-20T21:32",
    "label": "Trigger Date and Time"
};

function checkTrigger() {
    try {
        const now = new Date();
        const triggerTime = new Date(triggerDateTime.value);
        
        // Compare timestamps
        const currentTimestamp = now.getTime();
        const triggerTimestamp = triggerTime.getTime();
        
        // Log time difference every minute
        if (currentTimestamp % 60000 < 1000) {
            const timeLeft = (triggerTimestamp - currentTimestamp) / 1000;
            console.log(`⏳ Time remaining: ${Math.floor(timeLeft)} seconds`);
        }

        // Check if current time matches or just passed trigger time
        if (currentTimestamp >= triggerTimestamp && 
            currentTimestamp <= triggerTimestamp + 1000) { // 1 second window
            console.log('🎯 Trigger activated!', {
                scheduledTime: triggerDateTime.value,
                actualTime: now.toISOString()
            });
            
            // Your action here
            console.log('⚡ Executing scheduled action...');
            
            clearInterval(timeChecker);
            return true;
        }
    } catch (error) {
        console.error('❌ Error in checkTrigger:', error);
        clearInterval(timeChecker);
    }
    return false;
}

// Start checking every 100ms for more precision
const timeChecker = setInterval(checkTrigger, 100);

// Initial check and confirmation
console.log('⏰ Trigger scheduled for:', triggerDateTime.value);
console.log('✅ Script is running and waiting for trigger time...');