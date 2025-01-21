// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2025-01-21
// @description  try to take over the world!
// @author       You
// @match        https://tagaytayhighlands-teetime.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict'

    // Storing an array in localStorage
    const myArray = ['apple', 'banana', 'orange'];

    // Convert array to string and store it
    localStorage.setItem('myArray', JSON.stringify(myArray));


    // Retrieving array from localStorage
    const storedArray = JSON.parse(localStorage.getItem('myArray'));
    console.log(storedArray); // ['apple', 'banana', 'orange']
    console.log(Array.isArray(storedArray));

    // Check if array exists in localStorage
    if (localStorage.getItem('myArray')) {
        // Array exists, do something
    }

    // Remove array from localStorage
    localStorage.removeItem('myArray');

})();