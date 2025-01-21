// ==UserScript==
// @name         User's Companion Input List
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  A simple script to set the user input on the Tagaytay Highlands Teetime website. The script will automatically input the user's companion's details on the registration form
// @match        https://tagaytayhighlands-teetime.com/
// @match        https://tagaytayhighlands-teetime.com/index.php?w=1
// @match        https://tagaytayhighlands-teetime.com/index.php
// @match        https://tagaytayhighlands-teetime.com/t/index.php?v=1
// @match        https://tagaytayhighlands-teetime.com/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

// Add a delay to allow the page to load
// Program flow
// 1. Wait for the page to load
// 2. Check if each member's details are defined
// 3. If all members' details are defined, input the details to the registration form
// 4. If any member's details are not defined, still the program will run but will not input the details to the registration form (not required)
// 5. Next the script will find the form element and input the details to the registration form
// 6. Once done, the script will output a message to the console that the script has finished running and the script will stop
setTimeout(() => {
    console.log("Page loaded, starting script!");
    // Add the user's companion's details to the registration form
    // Member 1 is the user
    // Member 2 is the user's companion
    let player1f = "John Doe";
    let player1l = "Doe";
    // Member 3 is the user's companionl
    let player2f = "Jane Doe";
    let player2l = "Doe";
    // Member 4 is the user's companion
    let player3f = "Nathan"
    let player3l = "Drake";

    let availablePlayers = [];

    // Input the user's companion's details to the registration form
    // Validate first if the parameters are defined or not
    if (!player1f || !player1l) {
        console.error("Player 1 not fully defined");
        alert("Player 1 not fully defined");
        return;
    }
    if (!player2f || !player2l) {
        console.error("Player 2 not fully defined");
        alert("Player 2 not fully defined");
        return;
    }
    if (!player3f || !player3l) {
        console.error("Player 3 not fully defined");
        alert("Player 3 not fully defined");
        return;
    }
    
    // Find the form element first
    const findForm = document.querySelector('form');
    if (findForm) {

    }
}, 9000);