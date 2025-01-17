// ==UserScript==
// @name         Golf Course Selector
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  A simple script to select the Golf course on the Tagaytay Highlands Teetime website.
// @author       JOIBOI
// @match        https://tagaytayhighlands-teetime.com/
// @match        https://tagaytayhighlands-teetime.com/index.php?w=1
// @match        https://tagaytayhighlands-teetime.com/index.php
// @match        https://tagaytayhighlands-teetime.com/t/index.php?v=1
// @match        https://tagaytayhighlands-teetime.com/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // For testing purposes using Midlands Front 9 - Back 9
    const defaultCourse = '2';

    // Course mapping for reference
    const courseNames = {
        '1': 'Highlands Golf Course',
        '2': 'Midlands Front 9 - Back 9',
        '3': 'Midlands Back 9 - Lucky 9',
        '4': 'Midlands Lucky 9 - Front 9'
    };

    function selectCourse() {
        // Find the course dropdown by id
        const courseDropdown = document.getElementById('golfcourse');
        
        if (courseDropdown) {
            // Select the course
            courseDropdown.value = defaultCourse;
            
            // Trigger change event to activate any listeners
            const event = new Event('change', { bubbles: true });
            courseDropdown.dispatchEvent(event);
            
            console.log(`Selected course: ${courseNames[defaultCourse]}`);
            
            // Show the corresponding course div
            const courseDiv = document.getElementById(defaultCourse);
            if (courseDiv) {
                courseDiv.style.display = 'block';
            }
        } else {
            console.error('Course dropdown not found');
        }
    }

    // Wait for the page to load
    window.addEventListener('load', selectCourse);
})();