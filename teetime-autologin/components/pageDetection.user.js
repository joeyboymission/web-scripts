    // ==UserScript==
    // @name         Page Detection
    // @namespace    http://tampermonkey.net/
    // @version      Alpha test
    // @description  A simple script to detect the page on the Tagaytay Highlands Teetime website.
    // @author       JOIBOI and Keiane
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
    
            function detectPage() {
                const currentURL = window.location.href;
                console.log('Current URL:', currentURL);
    
                // Login page URLs
                const loginPages = [
                    'https://tagaytayhighlands-teetime.com/',
                    'https://tagaytayhighlands-teetime.com/index.php'
                ];
    
                // Booking page URLs
                const bookingPages = [
                    'https://tagaytayhighlands-teetime.com/t/index.php?v=1',
                    'https://tagaytayhighlands-teetime.com/t/'
                ];
    
                if (loginPages.includes(currentURL)) {
                    console.log('Login page detected');
                    return 'login';
                } else if (bookingPages.some(url => currentURL.includes(url))) {
                    console.log('Booking page detected');
                    return 'booking';
                } else {
                    console.log('Unknown page detected');
                    return 'unknown';
                }
            }
    
            // Execute page detection
            const pageType = detectPage();
            console.log('Page type:', pageType);
        })();
    }, 2000);