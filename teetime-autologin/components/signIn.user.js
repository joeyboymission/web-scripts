// ==UserScript==
// @name         Login Test
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  This is a test script for auto-login and booking on Tagaytay Highlands Teetime website.
// @author       JOIBOI
// @match        https://tagaytayhighlands-teetime.com/
// @match        https://tagaytayhighlands-teetime.com/index.php?w=1
// @match        https://tagaytayhighlands-teetime.com/index.php
// @match        https://tagaytayhighlands-teetime.com/t/index.php?v=1
// @match        https://tagaytayhighlands-teetime.com/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// ==/UserScript==

let memberID;
let password;
let isRunning = false;
let currentPage = '';
let countDown = 3;
let countdownInterval;

// Detect the current page and update the status message
function detectCurrentPage() {
    const url = window.location.href;
    try {
        if (url === 'https://tagaytayhighlands-teetime.com/') {
            currentPage = 'Login Page';
        } else if (url.includes('index.php?w=1')) {
            currentPage = 'Welcome Page';
        } else if (url.includes('/t/index.php?v=1')) {
            currentPage = 'Booking Page';
        } else if (url.includes('/t/')) {
            currentPage = 'Members Area';
        } else {
            currentPage = 'Unknown Page';
        }
        updateStatus();
    } catch (error) {
        console.error('Page detection error:', error);
        currentPage = 'Error';
        updateStatus();
    }
}

// Update the status message on the debug form
function updateStatus() {
    const statusElement = document.getElementById('status');
    let message;
    
    if (isRunning && countDown > 0) {
        message = `Starting in ${countDown}s | Current Page: ${currentPage}`;
    } else {
        message = `${isRunning ? 'Running' : 'Standby'} | Current Page: ${currentPage}`;
    }
    
    if (statusElement) {
        statusElement.innerHTML = `<p style="font-size: 12px; color: gray;">Status: ${message}</p>`;
    }
    console.log(`Status: ${message}`);
}

// Start the countdown timer
function startCountdown() {
    // Clear any existing countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countDown = 3; // Reset countdown
    updateStatus();
    
    countdownInterval = setInterval(() => {
        countDown--;
        updateStatus();
        
        if (countDown <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            // Add your auto-login/booking logic here after countdown
        }
    }, 1000);
}

// Fix validateInputs function
function validateInputs() {
    // Fix selectors to use ID instead of name attribute
    const memberIdInput = document.getElementById('membersid');
    const passwordInput = document.getElementById('password');
    
    if (!memberIdInput || !memberIdInput.value || !passwordInput || !passwordInput.value) {
        alert("Please fill in both Member ID and Password fields.");
        return false;
    }
    console.log("Validation passed:", {
        memberId: memberIdInput.value,
        hasPassword: !!passwordInput.value
    });
    return true;
}

// Fix toggleDebugState function
function toggleDebugState(button) {
    // Move validation check here to ensure form is loaded
    const memberIdInput = document.getElementById('membersid');
    const passwordInput = document.getElementById('password');
    
    if (!isRunning && (!memberIdInput?.value || !passwordInput?.value)) {
        alert("Please fill in both Member ID and Password fields.");
        return;
    }

    isRunning = !isRunning;
    button.innerText = isRunning ? "Stop" : "Start";
    button.style.color = isRunning ? "red" : "blue";
    
    if (memberIdInput && passwordInput) {
        memberIdInput.disabled = isRunning;
        passwordInput.disabled = isRunning;
        
        if (isRunning) {
            memberID = memberIdInput.value;
            password = passwordInput.value;
            startCountdown();
        } else {
            // Clear countdown if stopping
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                countDown = 3;
            }
        }
    }
    
    updateStatus();
}

// Fix debugForm HTML template
function debugForm() {
    if (document.getElementById("debugForm")) {
        return;
    }

    const formHTML = `
        <form id="debugForm" style="position: fixed; top: 0; right: 0; z-index: 9999; padding: 10px; background: white; border: 1px solid #ccc; width: 200px;">
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <h2 style="font-size: 16px; margin: 0 0 8px 0;">Debug</h2>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label for="membersid">Member ID:</label>
                    <input type="text" name="membersid" id="membersid" placeholder="Members ID" value="${memberID || ''}" style="padding: 4px;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <label for="password">Password:</label>
                    <input type="password" name="password" id="password" placeholder="Password" value="${password || ''}" style="padding: 4px;">
                </div>
                <button type="button" id="debugBtn" style="color: blue; border: 1px solid black; padding: 6px; margin-top: 8px;">Start</button>
            </div>
            <div id="status" style="margin-top: 12px; border-top: 1px solid #ccc; padding-top: 8px;">
                <p style="font-size: 12px; color: gray; margin: 0;">Status: Standby | Current Page: ${currentPage}</p>
            </div>
        </form>
    `;

    const container = document.createElement('div');
    container.innerHTML = formHTML;
    document.body.appendChild(container);

    const debugButton = document.getElementById("debugBtn");
    const form = document.getElementById("debugForm");

    if (debugButton && form) {
        debugButton.addEventListener("click", () => {
            toggleDebugState(debugButton);
        });

        form.addEventListener("submit", (e) => {
            e.preventDefault();
        });
    }
}

// Initialize the debug form when the page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        debugForm();
        detectCurrentPage();
    }, 1000);
});

// Monitor for URL changes
const observer = new MutationObserver(() => {
    const url = window.location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        detectCurrentPage();
    }
});

let lastUrl = window.location.href;
observer.observe(document, { subtree: true, childList: true });