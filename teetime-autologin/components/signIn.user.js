// ==UserScript==
// @name         Login Test
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

// Set the username and password
let username = 'username';
let password = 'password';

// Wait for the form to be loaded
function attemptLogin() {
    const loginForm = document.querySelector('form');
    
    if (loginForm) {
        try {
            // Fill up the form using correct field names
            const memberIdField = loginForm.querySelector('input[name="membersid"]');
            const passwordField = loginForm.querySelector('input[name="password"]');
            
            if (memberIdField && passwordField) {
                memberIdField.value = username;
                passwordField.value = password;
                
                // Optional: Check "Remember me"
                const rememberMe = loginForm.querySelector('#inlineFormCheck');
                if (rememberMe) rememberMe.checked = true;
                
                // Submit the form
                loginForm.submit();
                console.log('Auto-login successful');
            }
        } catch (error) {
            console.error('Error during auto-login:', error);
        }
    }
}

// Give the page a bit more time to load
setTimeout(attemptLogin, 2000);