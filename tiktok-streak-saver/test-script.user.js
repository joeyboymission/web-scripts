// ==UserScript==
// @name         TikTok Test Script
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Simple test to verify Tampermonkey works on TikTok
// @author       Test
// @match        *://*.tiktok.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    console.log("🔥 TEST SCRIPT LOADED ON TIKTOK!");
    alert("Tampermonkey is working on TikTok!");
    
    // Create a simple red box to show the script is running
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        width: 200px;
        height: 50px;
        background: red;
        color: white;
        text-align: center;
        line-height: 50px;
        z-index: 999999;
        font-weight: bold;
    `;
    testDiv.textContent = "TEST SCRIPT WORKING!";
    document.body.appendChild(testDiv);
})(); 