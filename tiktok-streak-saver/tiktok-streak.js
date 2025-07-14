// ==UserScript==
// @name         TikTok Streak Saver Automation Enhanced
// @namespace    http://tampermonkey.net/
// @version      2.7.0
// @description  Enhanced TikTok streak saver with proper input simulation and send button detection
// @author       JOIBOI
// @match        *://*.tiktok.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tiktok.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Initial script load confirmation
    console.log("🚀 TikTok Streak Saver Script Loading...");

    // Configuration
    let DEBUG_MODE = false; // Start in production mode - messages will be sent
    const DEFAULT_STREAK_MESSAGE = "If you see this message, it means the automation Streak Saver is working! 🔥🔥🔥";
    let customMessage = DEFAULT_STREAK_MESSAGE;
    
    // GUI State
    let isAutomationRunning = false;
    let automationButton = null;
    let guiContainer = null;
    let isMinimized = false;
    let contentArea = null;
    let toggleButton = null;
    let messageInput = null;
    let debugToggle = null;
    let debugStatus = null;
    
    // Console Log Feature State
    let showConsoleLog = false;
    let consoleToggle = null;
    let consoleStatus = null;
    let consoleLogArea = null;
    let consoleContainer = null;
    
    // Priority list of users to send streaks to (in order)
    const PRIORITY_USERS = [
        "L4NC3",
        "ry",
        "lemmmy",
        "Rea Mae ❤️❤️❤️",
        "Keiane",
        "Uiharu",
        "woogie"
    ];
    
    // Enhanced logging function with proper timestamp format
    function logMessage(message) {
        const now = new Date();
        const timestamp = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0') + ' ' + 
                         String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0') + ':' + 
                         String(now.getSeconds()).padStart(2, '0');
        const fullMessage = `[${timestamp}] TikTok Streak Saver: ${message}`;
        console.log(fullMessage);
        
        // Also display in custom console if enabled and elements exist
        if (showConsoleLog && consoleLogArea && document.body.contains(consoleLogArea)) {
            const logEntry = document.createElement('div');
            logEntry.style.cssText = `
                padding: 2px 8px;
                margin: 1px 0;
                font-size: 11px;
                font-family: 'Courier New', monospace;
                word-wrap: break-word;
                border-left: 3px solid transparent;
            `;
            
            // Color code based on message content
            if (message.includes('✅') || message.includes('SUCCESS')) {
                logEntry.style.borderLeftColor = '#4CAF50';
                logEntry.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                logEntry.style.color = '#2E7D32';
            } else if (message.includes('❌') || message.includes('ERROR') || message.includes('FAILED')) {
                logEntry.style.borderLeftColor = '#F44336';
                logEntry.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                logEntry.style.color = '#C62828';
            } else if (message.includes('⚠️') || message.includes('WARNING')) {
                logEntry.style.borderLeftColor = '#FF9800';
                logEntry.style.backgroundColor = 'rgba(255, 152, 0, 0.1)';
                logEntry.style.color = '#E65100';
            } else if (message.includes('🎯') || message.includes('===')) {
                logEntry.style.borderLeftColor = '#2196F3';
                logEntry.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
                logEntry.style.color = '#1565C0';
            } else {
                logEntry.style.borderLeftColor = '#607D8B';
                logEntry.style.backgroundColor = 'rgba(96, 125, 139, 0.1)';
                logEntry.style.color = '#37474F';
            }
            
            logEntry.textContent = fullMessage;
            consoleLogArea.appendChild(logEntry);
            
            // Auto-scroll to bottom
            consoleLogArea.scrollTop = consoleLogArea.scrollHeight;
            
            // Limit console entries to prevent memory issues (keep last 100 entries)
            const entries = consoleLogArea.children;
            if (entries.length > 100) {
                consoleLogArea.removeChild(entries[0]);
            }
        }
    }
    
    // Enhanced function to detect if we're on TikTok and log current URL
    function isOnTikTok() {
        const currentUrl = window.location.href;
        const hostname = window.location.hostname;
        logMessage(`Current URL: ${currentUrl}`);
        logMessage(`Current hostname: ${hostname}`);
        return hostname.includes('tiktok.com');
    }
    
    // Enhanced function to detect if we're on the messages page
    function isOnMessagesPage() {
        const currentUrl = window.location.href;
        const pathname = window.location.pathname;
        const isMessages = currentUrl.includes("tiktok.com/messages") || pathname === "/messages" || pathname.startsWith("/messages");
        logMessage(`Checking messages page - URL: ${currentUrl}, Pathname: ${pathname}, Is Messages: ${isMessages}`);
        return isMessages;
    }
    
    // Enhanced function to redirect to messages page
    function redirectToMessagesPage() {
        const currentUrl = window.location.href;
        const hostname = window.location.hostname;
        
        // Target URL for TikTok messages
        const targetUrl = "https://www.tiktok.com/messages?lang=en";
        
        // Check if we're already on the messages page
        if (isOnMessagesPage()) {
            logMessage("Already on messages page, no redirection needed");
            return false; // No redirection needed
        }
        
        logMessage(`Current page: ${currentUrl}`);
        logMessage(`Redirecting to TikTok messages: ${targetUrl}`);
        
        // Perform the redirection
        window.location.href = targetUrl;
        return true; // Redirection performed
    }
    
    // Function to wait for page to be ready after redirection
    function waitForPageReady() {
        return new Promise((resolve) => {
            // Wait for the page to fully load
            if (document.readyState === 'complete') {
                setTimeout(resolve, 2000); // Extra delay for dynamic content
            } else {
                window.addEventListener('load', () => {
                    setTimeout(resolve, 2000);
                });
            }
        });
    }
    
    // Function to wait for an element to appear
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }
            
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }
    
    // Function to find a user from the chat list
    async function findUserInChatList(username) {
        logMessage(`Looking for user: ${username}`);
        
        try {
            // Wait for the chat list container to load
            const chatListContainer = await waitForElement("div.css-149gota-DivScrollWrapper");
            logMessage("Found chat list container");
            
            // Find all username elements
            const userElements = chatListContainer.querySelectorAll("p.css-16y88xx-PInfoNickname");
            logMessage(`Found ${userElements.length} users in chat list`);
            
            // Look for our target user
            for (const element of userElements) {
                if (element.textContent.trim() === username) {
                    logMessage(`Found user: ${username}!`);
                    return element;
                }
            }
            
            logMessage(`User ${username} not found in the chat list`);
            return null;
        } catch (error) {
            logMessage(`Error finding user ${username}: ${error.message}`);
            return null;
        }
    }
    
    // Function to open a chat with a user
    async function openChatWithUser(userElement) {
        try {
            // Navigate up to the clickable parent div
            const parentDiv = userElement.parentElement.parentElement;
            const chatItem = parentDiv.parentElement;
            
            logMessage("Clicking to open chat...");
            chatItem.click();
            
            // Wait for the chat to load
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            return true;
        } catch (error) {
            logMessage(`Error opening chat: ${error.message}`);
            return false;
        }
    }
    
    // Enhanced function to verify send button appeared with multiple selectors
    function verifySendButtonAppeared() {
        // Try the specific selectors from the context instructions
        const selectors = [
            "svg[data-e2e='message-send']",
            "svg.css-d7yhdo-StyledSendButton",
            "svg[role='button'][data-e2e='message-send']"
        ];
        
        for (const selector of selectors) {
            const sendButton = document.querySelector(selector);
            if (sendButton) {
                logMessage(`✅ Send button found using selector: ${selector}`);
                return true;
            }
        }
        
        logMessage(`❌ Send button not found with any selector`);
        return false;
    }
    
    // Function to simulate proper keyboard typing as per TikTok requirements
    async function simulateProperTyping(editorDiv, text) {
        logMessage(`🎯 Starting proper typing simulation for: "${text}"`);
        
        // Step 1: Click the input field to activate cursor (as per instructions)
        logMessage("🖱️ Clicking input field to get blinking cursor...");
        editorDiv.click();
        editorDiv.focus();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 2: Clear any existing content
        editorDiv.innerHTML = '<div data-contents="true"><div class="" data-block="true" data-editor="" data-offset-key=""><div data-offset-key="" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"><span data-offset-key=""><br data-text="true"></span></div></div></div>';
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Step 3: Simulate actual keyboard typing character by character
        logMessage("⌨️ Simulating keyboard strokes...");
        let typedContent = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            typedContent += char;
            
            // Dispatch keyboard events for each character
            const keydownEvent = new KeyboardEvent('keydown', {
                key: char,
                char: char,
                keyCode: char.charCodeAt(0),
                which: char.charCodeAt(0),
                bubbles: true,
                cancelable: true
            });
            editorDiv.dispatchEvent(keydownEvent);
            
            // Update the content progressively with proper TikTok structure
            editorDiv.innerHTML = `<div data-contents="true"><div class="" data-block="true" data-editor="" data-offset-key=""><div data-offset-key="" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"><span data-offset-key=""><span data-text="true">${typedContent}</span></span></div></div></div>`;
            
            // Dispatch input events
            const inputEvent = new InputEvent('input', {
                inputType: 'insertText',
                data: char,
                bubbles: true,
                cancelable: true
            });
            editorDiv.dispatchEvent(inputEvent);
            
            const keyupEvent = new KeyboardEvent('keyup', {
                key: char,
                char: char,
                keyCode: char.charCodeAt(0),
                which: char.charCodeAt(0),
                bubbles: true,
                cancelable: true
            });
            editorDiv.dispatchEvent(keyupEvent);
            
            // Small delay between characters to simulate real typing
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Final events to ensure TikTok recognizes the input
        const finalInputEvent = new InputEvent('input', {
            inputType: 'insertText',
            data: text,
            bubbles: true,
            cancelable: true
        });
        editorDiv.dispatchEvent(finalInputEvent);
        
        const changeEvent = new Event('change', { bubbles: true });
        editorDiv.dispatchEvent(changeEvent);
        
        logMessage(`✅ Completed typing simulation for: "${text}"`);
        return true;
    }
    
    // Enhanced function to ensure page has focus before clipboard operations
    async function ensurePageFocus() {
        try {
            // Focus the window first
            window.focus();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Focus the document body
            if (document.body) {
                document.body.focus();
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Try to focus any visible input element on the page to establish focus context
            const focusableElements = document.querySelectorAll('input, textarea, button, [tabindex], [contenteditable]');
            for (const element of focusableElements) {
                if (element.offsetParent !== null) { // Check if element is visible
                    try {
                        element.focus();
                        await new Promise(resolve => setTimeout(resolve, 50));
                        element.blur();
                        break;
                    } catch (e) {
                        // Continue to next element if this one fails
                    }
                }
            }
            
            logMessage("🎯 Page focus established for clipboard operations");
            return true;
        } catch (error) {
            logMessage(`❌ Error establishing page focus: ${error.message}`);
            return false;
        }
    }

    // Enhanced clipboard functions with focus management
    async function copyToClipboard(text) {
        try {
            // Ensure page has focus before clipboard operations
            await ensurePageFocus();
            
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                logMessage(`📋 Successfully copied to clipboard: "${text}"`);
                return true;
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const result = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (result) {
                    logMessage(`📋 Successfully copied to clipboard (fallback): "${text}"`);
                    return true;
                } else {
                    logMessage(`❌ Failed to copy to clipboard (fallback)`);
                    return false;
                }
            }
        } catch (error) {
            logMessage(`❌ Error copying to clipboard: ${error.message}`);
            return false;
        }
    }
    
    async function simulateClipboardPaste(editorDiv, text) {
        logMessage(`📋 Starting clipboard paste simulation for: "${text}"`);
        
        try {
            // Step 1: Copy the text to clipboard first
            const copySuccess = await copyToClipboard(text);
            if (!copySuccess) {
                logMessage(`❌ Failed to copy text to clipboard`);
                return false;
            }
            
            // Step 2: Click the input field to focus
            logMessage("🖱️ Clicking input field for clipboard paste...");
            editorDiv.click();
            editorDiv.focus();
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Step 3: Clear existing content
            editorDiv.innerHTML = '<div data-contents="true"><div class="" data-block="true" data-editor="" data-offset-key=""><div data-offset-key="" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"><span data-offset-key=""><br data-text="true"></span></div></div></div>';
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Step 4: Simulate Ctrl+V paste operation
            logMessage("⌨️ Simulating Ctrl+V paste...");
            
            // Dispatch keydown for Ctrl+V
            const ctrlVKeyDown = new KeyboardEvent('keydown', {
                key: 'v',
                code: 'KeyV',
                keyCode: 86,
                which: 86,
                ctrlKey: true,
                bubbles: true,
                cancelable: true
            });
            editorDiv.dispatchEvent(ctrlVKeyDown);
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Update content with pasted text
            editorDiv.innerHTML = `<div data-contents="true"><div class="" data-block="true" data-editor="" data-offset-key=""><div data-offset-key="" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"><span data-offset-key=""><span data-text="true">${text}</span></span></div></div></div>`;
            
            // Dispatch paste event
            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: new DataTransfer()
            });
            
            // Add text to clipboard data
            if (pasteEvent.clipboardData) {
                pasteEvent.clipboardData.setData('text/plain', text);
            }
            
            editorDiv.dispatchEvent(pasteEvent);
            
            // Dispatch input event
            const inputEvent = new InputEvent('input', {
                inputType: 'insertFromPaste',
                data: text,
                bubbles: true,
                cancelable: true
            });
            editorDiv.dispatchEvent(inputEvent);
            
            // Dispatch keyup for Ctrl+V
            const ctrlVKeyUp = new KeyboardEvent('keyup', {
                key: 'v',
                code: 'KeyV',
                keyCode: 86,
                which: 86,
                ctrlKey: true,
                bubbles: true,
                cancelable: true
            });
            editorDiv.dispatchEvent(ctrlVKeyUp);
            
            logMessage(`✅ Completed clipboard paste simulation for: "${text}"`);
            return true;
            
        } catch (error) {
            logMessage(`❌ Error in clipboard paste simulation: ${error.message}`);
            return false;
        }
    }

    // Enhanced function to find send button using Tab navigation
    async function findSendButtonWithTabNavigation(startElement) {
        logMessage("🔍 Starting Tab navigation to find send button...");
        
        try {
            // Focus on the start element (message input)
            startElement.focus();
            await new Promise(resolve => setTimeout(resolve, 200));
            
            let currentElement = startElement;
            let tabAttempts = 0;
            const maxTabAttempts = 15; // Limit tab attempts to prevent infinite loop
            
            while (tabAttempts < maxTabAttempts) {
                tabAttempts++;
                
                // Simulate Tab key press
                const tabEvent = new KeyboardEvent('keydown', {
                    key: 'Tab',
                    code: 'Tab',
                    keyCode: 9,
                    which: 9,
                    bubbles: true,
                    cancelable: true
                });
                
                currentElement.dispatchEvent(tabEvent);
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Get the newly focused element
                currentElement = document.activeElement;
                
                if (currentElement) {
                    logMessage(`Tab ${tabAttempts}: Focused on element: ${currentElement.tagName} (${currentElement.className})`);
                    
                    // Check if this element is the send button
                    const isSendButton = checkIfSendButton(currentElement);
                    if (isSendButton) {
                        logMessage(`✅ Found send button via Tab navigation: ${currentElement.tagName}`);
                        return currentElement;
                    }
                }
                
                // Break if we've cycled back to the start
                if (currentElement === startElement && tabAttempts > 2) {
                    logMessage("🔄 Tab navigation cycled back to start element");
                    break;
                }
            }
            
            logMessage(`❌ Send button not found after ${tabAttempts} tab attempts`);
            return null;
            
        } catch (error) {
            logMessage(`❌ Error in Tab navigation: ${error.message}`);
            return null;
        }
    }

    // Helper function to check if an element is the send button
    function checkIfSendButton(element) {
        if (!element) return false;
        
        // Check various attributes and characteristics of send buttons
        const attributes = [
            element.getAttribute('data-e2e'),
            element.getAttribute('aria-label'),
            element.getAttribute('title'),
            element.textContent,
            element.className
        ].filter(Boolean).join(' ').toLowerCase();
        
        // Look for send-related keywords
        const sendKeywords = ['send', 'message-send', 'submit', 'post'];
        const isSendButton = sendKeywords.some(keyword => attributes.includes(keyword));
        
        // Also check parent elements for send button indicators
        let parent = element.parentElement;
        let parentChecks = 0;
        while (parent && parentChecks < 3) {
            const parentAttrs = [
                parent.getAttribute('data-e2e'),
                parent.getAttribute('aria-label'),
                parent.getAttribute('title'),
                parent.className
            ].filter(Boolean).join(' ').toLowerCase();
            
            if (sendKeywords.some(keyword => parentAttrs.includes(keyword))) {
                logMessage(`🎯 Send button found via parent element (${parentChecks + 1} levels up)`);
                return true;
            }
            
            parent = parent.parentElement;
            parentChecks++;
        }
        
        // Check if element contains SVG with send indicators
        if (element.querySelector && element.querySelector('svg[data-e2e="message-send"]')) {
            logMessage("🎯 Send button found via contained SVG");
            return true;
        }
        
        return isSendButton;
    }

    // Enhanced function to click send button with multiple fallback methods
    async function clickSendButton(sendButton) {
        if (!sendButton) {
            logMessage("❌ No send button provided for clicking");
            return false;
        }
        
        logMessage(`🖱️ Attempting to click send button: ${sendButton.tagName} (${sendButton.className})`);
        
        try {
            // Method 1: Direct click
            if (typeof sendButton.click === 'function') {
                logMessage("🔧 Method 1: Direct click");
                sendButton.click();
                await new Promise(resolve => setTimeout(resolve, 500));
                return true;
            }
            
            // Method 2: Mouse events
            logMessage("🔧 Method 2: Mouse events");
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            sendButton.dispatchEvent(clickEvent);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Method 3: If it's an SVG, try clicking the parent button
            if (sendButton.tagName.toLowerCase() === 'svg') {
                logMessage("🔧 Method 3: SVG parent click");
                let parent = sendButton.parentElement;
                while (parent && parent.tagName.toLowerCase() !== 'button') {
                    parent = parent.parentElement;
                    if (!parent || parent === document.body) break;
                }
                
                if (parent && parent.tagName.toLowerCase() === 'button') {
                    logMessage("🎯 Found parent button, clicking it");
                    parent.click();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return true;
                }
            }
            
            // Method 4: Keyboard Enter key
            logMessage("🔧 Method 4: Enter key simulation");
            sendButton.focus();
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
            });
            sendButton.dispatchEvent(enterEvent);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Method 5: Space key (for buttons)
            logMessage("🔧 Method 5: Space key simulation");
            const spaceEvent = new KeyboardEvent('keydown', {
                key: ' ',
                code: 'Space',
                keyCode: 32,
                which: 32,
                bubbles: true,
                cancelable: true
            });
            sendButton.dispatchEvent(spaceEvent);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            logMessage("✅ Send button click attempts completed");
            return true;
            
        } catch (error) {
            logMessage(`❌ Error clicking send button: ${error.message}`);
            return false;
        }
    }
    
    // Enhanced function to send message using ONLY clipboard paste method (user discovery)
    async function sendStreakMessage() {
        try {
            // Wait for the message input to be available
            const editorDiv = await waitForElement("div.public-DraftEditor-content");
            logMessage("Found message input area, starting CLIPBOARD-ONLY system...");
            
            // Get current message from input or use default
            const messageToSend = customMessage.trim() || DEFAULT_STREAK_MESSAGE;
            logMessage(`Using message: "${messageToSend}"`);
            logMessage(`🎯 Strategy: CLIPBOARD PASTE method ONLY (user discovery: copy-paste triggers send button!)`);
            
            let messageInputSuccess = false;
            let sendButtonVisible = false;
            
            // === CLIPBOARD PASTE METHOD (5 attempts) - ONLY METHOD ===
            logMessage("🚀 === CLIPBOARD PASTE METHOD (ONLY METHOD) ===");
            logMessage("📋 Using clipboard paste as the ONLY method based on user discovery!");
            const clipboardAttempts = 5;
            
            for (let attempt = 1; attempt <= clipboardAttempts; attempt++) {
                logMessage(`📋 Clipboard Attempt ${attempt}/${clipboardAttempts} - Copy-paste method...`);
                
                try {
                    // Use clipboard paste simulation as the only method
                    await simulateClipboardPaste(editorDiv, messageToSend);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Verify the message was actually pasted
                    const currentText = editorDiv.textContent || editorDiv.innerText || "";
                    logMessage(`🔍 Checking clipboard paste content: "${currentText.trim()}"`);
                    
                    if (currentText.includes(messageToSend) || currentText.trim() === messageToSend) {
                        messageInputSuccess = true;
                        logMessage(`✅ Clipboard paste verified: "${messageToSend}" (attempt ${attempt})`);
                        
                        // Wait for send button to appear after pasting
                        logMessage(`⏳ Waiting for send button to appear after clipboard paste...`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        
                        // Verify send button appeared
                        sendButtonVisible = verifySendButtonAppeared();
                        if (sendButtonVisible) {
                            logMessage(`✅ SUCCESS: Send button appeared after clipboard method (attempt ${attempt})`);
                            logMessage(`🎉 USER DISCOVERY CONFIRMED: Copy-paste method works!`);
                            break; // Success! Exit the clipboard attempts loop
                        } else {
                            logMessage(`❌ Send button not found after clipboard paste (attempt ${attempt})`);
                            messageInputSuccess = false; // Reset for next attempt
                        }
                    } else {
                        logMessage(`❌ Clipboard paste not detected. Found: "${currentText.trim()}"`);
                    }
                    
                    // If this is not the last attempt, wait before retry
                    if (attempt < clipboardAttempts) {
                        logMessage(`⏳ Waiting before next clipboard attempt...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    
                } catch (clipboardError) {
                    logMessage(`❌ Clipboard attempt ${attempt} failed: ${clipboardError.message}`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            // === FINAL VERIFICATION AND TERMINATION ===
            if (!messageInputSuccess || !sendButtonVisible) {
                logMessage(`🚨 === CLIPBOARD METHOD FAILED ===`);
                logMessage(`❌ Clipboard paste method failed after ${clipboardAttempts} attempts`);
                logMessage(`📊 Total attempts made: ${clipboardAttempts}`);
                logMessage(`🔄 Script terminating and returning to initial state...`);
                logMessage(`🎯 Ready for next execution when user triggers automation again`);
                return false; // This will cause the automation to terminate and reset
            }
            
            // === SUCCESS: PROCEED TO SEND MESSAGE ===
            logMessage(`🎉 === CLIPBOARD METHOD SUCCESSFUL ===`);
            logMessage(`✅ Message successfully input using CLIPBOARD PASTE method`);
            logMessage(`📊 Total attempts used: ${clipboardAttempts} or fewer`);
            
            // Wait a moment to ensure the UI is ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (!DEBUG_MODE) {
                logMessage(`📤 PRODUCTION MODE: Attempting to send message...`);
                
                // Method 1: Try traditional selectors first
                let sendButton = document.querySelector("svg[data-e2e='message-send']") || 
                                document.querySelector("svg.css-d7yhdo-StyledSendButton") ||
                                document.querySelector("button[data-e2e='message-send']") ||
                                document.querySelector("button[aria-label*='Send']");
                
                if (sendButton) {
                    logMessage(`🎯 Found send button using traditional selectors: ${sendButton.tagName}`);
                    const clickSuccess = await clickSendButton(sendButton);
                    if (clickSuccess) {
                        logMessage("✅ Streak message sent successfully!");
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return true;
                    }
                }
                
                // Method 2: Use Tab navigation fallback
                logMessage("🔄 Traditional selectors failed, trying Tab navigation...");
                const tabSendButton = await findSendButtonWithTabNavigation(editorDiv);
                if (tabSendButton) {
                    const clickSuccess = await clickSendButton(tabSendButton);
                    if (clickSuccess) {
                        logMessage("✅ Streak message sent successfully via Tab navigation!");
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        return true;
                    }
                }
                
                // Method 3: Try Enter key on the input field as last resort
                logMessage("🔄 Tab navigation failed, trying Enter key on input field...");
                try {
                    editorDiv.focus();
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                    const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    });
                    editorDiv.dispatchEvent(enterEvent);
                    
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    logMessage("✅ Attempted to send message via Enter key");
                    return true;
                } catch (enterError) {
                    logMessage(`❌ Enter key method failed: ${enterError.message}`);
                }
                
                logMessage("❌ All send button methods failed");
                return false;
            } else {
                logMessage("🔧 DEBUG MODE: Message input successful but not actually sent");
                return true;
            }
            
        } catch (error) {
            logMessage(`❌ Critical error in sendStreakMessage: ${error.message}`);
            logMessage(`🔄 Script terminating and returning to initial state...`);
            return false;
        }
    }
    
    // Enhanced function to process all users with better status reporting
    async function processUsers() {
        logMessage("=== Starting User Processing ===");
        logMessage(`Target users: ${PRIORITY_USERS.join(", ")}`);
        logMessage(`📊 CURRENT MODE: ${DEBUG_MODE ? 'DEBUG (Safe Mode - NO messages sent)' : 'PRODUCTION (Messages WILL be sent)'}`);
        logMessage(`Message to send: "${customMessage || DEFAULT_STREAK_MESSAGE}"`);
        
        let usersProcessed = 0;
        
        for (let i = 0; i < PRIORITY_USERS.length; i++) {
            const username = PRIORITY_USERS[i];
            
            try {
                logMessage(`--- Processing user ${i + 1}/${PRIORITY_USERS.length}: ${username} ---`);
                
                // Find the user
                const userElement = await findUserInChatList(username);
                if (!userElement) {
                    logMessage(`❌ User ${username} not found in chat list - skipping`);
                    continue;
                }
                
                // Open chat with the user
                logMessage(`📱 Opening chat with ${username}...`);
                const chatOpened = await openChatWithUser(userElement);
                if (!chatOpened) {
                    logMessage(`❌ Failed to open chat with ${username} - skipping`);
                    continue;
                }
                
                // Send the streak message with proper TikTok simulation
                logMessage(`💬 Sending streak message to ${username}...`);
                const messageSent = await sendStreakMessage();
                if (messageSent) {
                    usersProcessed++;
                    logMessage(`✅ Successfully processed ${username} (${usersProcessed}/${PRIORITY_USERS.length})`);
                } else {
                    logMessage(`❌ Failed to send message to ${username}`);
                }
                
                // Wait before processing next user
                if (i < PRIORITY_USERS.length - 1) {
                    logMessage("⏳ Waiting before next user...");
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                
            } catch (error) {
                logMessage(`❌ Error processing user ${username}: ${error.message}`);
            }
        }
        
        logMessage(`=== Processing Complete ===`);
        logMessage(`📊 Successfully processed: ${usersProcessed}/${PRIORITY_USERS.length} users`);
        logMessage(`🎯 AUTOMATION FINISHED - All priority users have been processed!`);
        
        if (DEBUG_MODE) {
            logMessage("🔧 DEBUG MODE: No actual messages were sent");
        } else {
            logMessage("✅ PRODUCTION MODE: Messages were sent to users");
        }
    }
    
    // Function to update button appearance and text
    function updateButtonState(running) {
        if (!automationButton || !messageInput) return;
        
        if (running) {
            automationButton.textContent = 'Stop Automation';
            automationButton.style.backgroundColor = '#ef1d26'; // Red
            messageInput.disabled = true;
            messageInput.style.backgroundColor = '#f0f0f0';
            messageInput.style.color = '#999';
            logMessage("Button state changed to: Stop Automation, Message input disabled");
        } else {
            automationButton.textContent = 'Start Automation';
            automationButton.style.backgroundColor = '#49b86b'; // Green
            messageInput.disabled = false;
            messageInput.style.backgroundColor = '#fff';
            messageInput.style.color = '#000';
            logMessage("Button state changed to: Start Automation, Message input enabled");
        }
    }
    
    // Function to toggle debug mode
    function toggleDebugMode() {
        DEBUG_MODE = !DEBUG_MODE;
        updateDebugToggleState();
        logMessage(`Current DEBUG_MODE value: ${DEBUG_MODE}`);
    }
    
    // Function to update debug toggle visual state
    function updateDebugToggleState() {
        if (DEBUG_MODE) {
            // Debug mode is ENABLED (safe mode)
            debugToggle.style.backgroundColor = '#49b86b';
            debugStatus.textContent = 'Status: Enabled';
            debugStatus.style.color = '#49b86b';
            logMessage("🔧 Debug mode: ENABLED (Safe mode - no messages will be sent)");
        } else {
            // Debug mode is DISABLED (production mode)
            debugToggle.style.backgroundColor = '#ccc';
            debugStatus.textContent = 'Status: Disabled';
            debugStatus.style.color = '#666';
            logMessage("✅ Debug mode: DISABLED (Production mode - messages will be sent)");
        }
    }
    
    // Function to toggle console log display
    function toggleConsoleLog() {
        showConsoleLog = !showConsoleLog;
        updateConsoleToggleState();
        logMessage(`Console Log Display: ${showConsoleLog ? 'ENABLED' : 'DISABLED'}`);
    }
    
    // Function to update console log toggle visual state
    function updateConsoleToggleState() {
        // Safety check to ensure elements exist before updating
        if (!consoleToggle || !consoleStatus || !consoleContainer) {
            return;
        }
        
        if (showConsoleLog) {
            // Console log is ENABLED
            consoleToggle.style.backgroundColor = '#49b86b';
            consoleStatus.textContent = 'Status: Enabled';
            consoleStatus.style.color = '#49b86b';
            consoleContainer.style.display = 'block';
            logMessage("📺 Console Log Display: ENABLED");
        } else {
            // Console log is DISABLED  
            consoleToggle.style.backgroundColor = '#ccc';
            consoleStatus.textContent = 'Status: Disabled';
            consoleStatus.style.color = '#666';
            consoleContainer.style.display = 'none';
            logMessage("📺 Console Log Display: DISABLED");
        }
    }
    
    // Function to clear console log
    function clearConsoleLog() {
        if (consoleLogArea) {
            consoleLogArea.innerHTML = '';
            logMessage("🧹 Console log cleared");
        }
    }
    
    // Function to copy all console log entries to clipboard
    function copyAllConsoleLog() {
        if (consoleLogArea && consoleLogArea.children.length > 0) {
            const allEntries = Array.from(consoleLogArea.children)
                .map(entry => entry.textContent)
                .join('\n');
            
            // Copy to clipboard
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(allEntries).then(() => {
                    logMessage("📋 All console logs copied to clipboard successfully!");
                }).catch(err => {
                    logMessage(`❌ Failed to copy logs: ${err.message}`);
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = allEntries;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const result = document.execCommand('copy');
                    if (result) {
                        logMessage("📋 All console logs copied to clipboard successfully!");
                    } else {
                        logMessage("❌ Failed to copy logs to clipboard");
                    }
                } catch (err) {
                    logMessage(`❌ Failed to copy logs: ${err.message}`);
                }
                
                document.body.removeChild(textArea);
            }
        } else {
            logMessage("⚠️ No console logs to copy");
        }
    }
    
    // Function to export all console log entries as .txt file
    function exportAllConsoleLog() {
        if (consoleLogArea && consoleLogArea.children.length > 0) {
            try {
                const allEntries = Array.from(consoleLogArea.children)
                    .map(entry => entry.textContent)
                    .join('\n');
                
                // Create header for the export file
                const now = new Date();
                const timestamp = now.getFullYear() + '-' + 
                                 String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                                 String(now.getDate()).padStart(2, '0') + ' ' + 
                                 String(now.getHours()).padStart(2, '0') + ':' + 
                                 String(now.getMinutes()).padStart(2, '0') + ':' + 
                                 String(now.getSeconds()).padStart(2, '0');
                
                const header = `TikTok Streak Saver - Console Log Export
Export Date: ${timestamp}
Total Entries: ${consoleLogArea.children.length}
======================================================

`;
                
                const fileContent = header + allEntries;
                
                // Create blob and download link
                const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
                const downloadUrl = window.URL.createObjectURL(blob);
                
                // Create temporary download link
                const downloadLink = document.createElement('a');
                downloadLink.href = downloadUrl;
                downloadLink.download = `TikTok_Streak_Saver_Logs_${timestamp.replace(/[:\s]/g, '_')}.txt`;
                downloadLink.style.display = 'none';
                
                // Trigger download
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // Clean up the blob URL
                setTimeout(() => {
                    window.URL.revokeObjectURL(downloadUrl);
                }, 1000);
                
                logMessage(`📁 Console logs exported successfully as "${downloadLink.download}"`);
                logMessage("💾 File saved to your Downloads folder");
                
            } catch (error) {
                logMessage(`❌ Failed to export logs: ${error.message}`);
            }
        } else {
            logMessage("⚠️ No console logs to export");
        }
    }
    
    // Enhanced function to toggle automation with better state management
    async function toggleAutomation() {
        if (isAutomationRunning) {
            // Stop automation
            logMessage("Automation stopped by user");
            isAutomationRunning = false;
            updateButtonState(false);
            return;
        }
        
        // Update custom message from input
        customMessage = messageInput.value.trim() || DEFAULT_STREAK_MESSAGE;
        if (!messageInput.value.trim()) {
            messageInput.value = DEFAULT_STREAK_MESSAGE;
            customMessage = DEFAULT_STREAK_MESSAGE;
            logMessage("Empty message detected, using default message");
        }
        
        // Start automation
        isAutomationRunning = true;
        updateButtonState(true);
        
        logMessage("=== Automation triggered by user ===");
        logMessage("Checking current page and preparing for automation...");
        
        try {
            await main();
        } catch (error) {
            logMessage(`ERROR in automation: ${error.message}`);
            isAutomationRunning = false;
            updateButtonState(false);
        }
    }
    
    // Function to toggle window visibility
    function toggleWindowVisibility() {
        isMinimized = !isMinimized;
        
        if (isMinimized) {
            contentArea.style.display = 'none';
            guiContainer.style.borderBottom = 'none';
            toggleButton.textContent = '+';
            toggleButton.title = 'Expand window';
            logMessage("GUI window minimized");
        } else {
            contentArea.style.display = 'block';
            guiContainer.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            toggleButton.textContent = '−';
            toggleButton.title = 'Minimize window';
            logMessage("GUI window expanded");
        }
    }

    // Enhanced function to create draggable GUI with all new features
    function createDraggableGUI() {
        try {
            logMessage("Starting GUI creation...");
            
            // Create main container
            guiContainer = document.createElement('div');
        guiContainer.id = 'tiktok-streak-gui';
        guiContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            user-select: none;
            overflow: hidden;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        
        // Create title bar
        const titleBar = document.createElement('div');
        titleBar.style.cssText = `
            background: rgba(0,0,0,0.2);
            padding: 12px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            cursor: move;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Create toggle button (minimize/maximize)
        toggleButton = document.createElement('button');
        toggleButton.textContent = '−';
        toggleButton.title = 'Minimize window';
        toggleButton.style.cssText = `
            position: absolute;
            left: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            line-height: 1;
        `;
        
        // Add hover effect for toggle button
        toggleButton.addEventListener('mouseenter', () => {
            toggleButton.style.background = 'rgba(255,255,255,0.3)';
            toggleButton.style.transform = 'translateY(-50%) scale(1.1)';
        });
        
        toggleButton.addEventListener('mouseleave', () => {
            toggleButton.style.background = 'rgba(255,255,255,0.2)';
            toggleButton.style.transform = 'translateY(-50%) scale(1)';
        });
        
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWindowVisibility();
        });
        
        const title = document.createElement('h3');
        title.textContent = 'Tiktok Streak Saver Automation';
        title.style.cssText = `
            margin: 0;
            color: white;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            flex: 1;
        `;
        
        titleBar.appendChild(toggleButton);
        titleBar.appendChild(title);
        
        // Create content area
        contentArea = document.createElement('div');
        contentArea.style.cssText = `
            padding: 20px;
            text-align: center;
        `;
        
        // Create message input section
        const messageSection = document.createElement('div');
        messageSection.style.cssText = `
            margin-bottom: 15px;
            text-align: left;
        `;
        
        const messageLabel = document.createElement('label');
        messageLabel.textContent = 'Message';
        messageLabel.style.cssText = `
            display: block;
            color: white;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 5px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        `;
        
        messageInput = document.createElement('input');
        messageInput.type = 'text';
        messageInput.value = DEFAULT_STREAK_MESSAGE;
        messageInput.placeholder = 'Please type your message...';
        messageInput.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 6px;
            background: rgba(255,255,255,0.9);
            color: #333;
            font-size: 14px;
            box-sizing: border-box;
            transition: all 0.3s ease;
        `;
        
        messageInput.addEventListener('focus', () => {
            messageInput.style.background = 'rgba(255,255,255,1)';
            messageInput.style.borderColor = 'rgba(255,255,255,0.6)';
        });
        
        messageInput.addEventListener('blur', () => {
            messageInput.style.background = 'rgba(255,255,255,0.9)';
            messageInput.style.borderColor = 'rgba(255,255,255,0.3)';
        });
        
        messageInput.addEventListener('input', () => {
            customMessage = messageInput.value.trim();
        });
        
        messageSection.appendChild(messageLabel);
        messageSection.appendChild(messageInput);
        
        // Create automation button
        automationButton = document.createElement('button');
        automationButton.textContent = 'Start Automation';
        automationButton.style.cssText = `
            background-color: #49b86b;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            width: 100%;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
        `;
        
        // Add hover effects
        automationButton.addEventListener('mouseenter', () => {
            automationButton.style.transform = 'translateY(-2px)';
            automationButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
        });
        
        automationButton.addEventListener('mouseleave', () => {
            automationButton.style.transform = 'translateY(0)';
            automationButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
        
        // Add click event
        automationButton.addEventListener('click', toggleAutomation);
        
        // Create breakline
        const breakLine = document.createElement('hr');
        breakLine.style.cssText = `
            border: none;
            height: 1px;
            background: rgba(255,255,255,0.2);
            margin: 15px 0;
        `;
        
        // Create debug mode section
        const debugSection = document.createElement('div');
        debugSection.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 10px;
        `;
        
        debugToggle = document.createElement('button');
        debugToggle.style.cssText = `
            width: 50px;
            height: 24px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        `;
        
        debugStatus = document.createElement('span');
        debugStatus.style.cssText = `
            font-size: 12px;
            font-weight: 600;
        `;
        
        debugToggle.addEventListener('click', toggleDebugMode);
        
        const debugLabel = document.createElement('label');
        debugLabel.textContent = 'Debug Mode';
        debugLabel.style.cssText = `
            color: white;
            font-size: 12px;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        `;
        
        debugSection.appendChild(debugLabel);
        debugSection.appendChild(debugToggle);
        
        // Initialize debug toggle state properly
        updateDebugToggleState();
        
        // Create console log toggle section
        const consoleSection = document.createElement('div');
        consoleSection.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 10px;
        `;
        
        consoleToggle = document.createElement('button');
        consoleToggle.style.cssText = `
            width: 50px;
            height: 24px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        `;
        
        consoleStatus = document.createElement('span');
        consoleStatus.style.cssText = `
            font-size: 12px;
            font-weight: 600;
        `;
        
        consoleToggle.addEventListener('click', toggleConsoleLog);
        
        const consoleLabel = document.createElement('label');
        consoleLabel.textContent = 'Console Log';
        consoleLabel.style.cssText = `
            color: white;
            font-size: 12px;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        `;
        
        consoleSection.appendChild(consoleLabel);
        consoleSection.appendChild(consoleToggle);
        
        // Assemble the GUI
        contentArea.appendChild(messageSection);
        contentArea.appendChild(automationButton);
        contentArea.appendChild(breakLine);
        contentArea.appendChild(debugSection);
        contentArea.appendChild(consoleSection); // Add console section
        contentArea.appendChild(document.createElement('br'));
        contentArea.appendChild(debugStatus);
        contentArea.appendChild(consoleStatus); // Add console status
        
        guiContainer.appendChild(titleBar);
        guiContainer.appendChild(contentArea);
        
        // Create console log display container
        consoleContainer = document.createElement('div');
        consoleContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 340px;
            width: 400px;
            max-height: 300px;
            background: rgba(0, 0, 0, 0.9);
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            user-select: none;
            overflow: hidden;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            display: none;
        `;
        
        // Console header with title and action buttons
        const consoleHeader = document.createElement('div');
        consoleHeader.style.cssText = `
            background: rgba(255,255,255,0.1);
            padding: 8px 15px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        
        const consoleTitle = document.createElement('span');
        consoleTitle.textContent = 'Console Log';
        consoleTitle.style.cssText = `
            color: white;
            font-size: 12px;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        `;
        
        // Create button container for Clear, Copy All, and Export All buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 4px;
        `;
        
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear';
        clearButton.style.cssText = `
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 4px 6px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 9px;
            font-weight: 600;
            transition: all 0.2s ease;
        `;
        
        clearButton.addEventListener('mouseenter', () => {
            clearButton.style.background = 'rgba(255,255,255,0.3)';
        });
        
        clearButton.addEventListener('mouseleave', () => {
            clearButton.style.background = 'rgba(255,255,255,0.2)';
        });
        
        clearButton.addEventListener('click', clearConsoleLog);
        
        const copyAllButton = document.createElement('button');
        copyAllButton.textContent = 'Copy All';
        copyAllButton.style.cssText = `
            background: rgba(76, 175, 80, 0.7);
            color: white;
            border: none;
            padding: 4px 6px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 9px;
            font-weight: 600;
            transition: all 0.2s ease;
        `;
        
        copyAllButton.addEventListener('mouseenter', () => {
            copyAllButton.style.background = 'rgba(76, 175, 80, 0.9)';
            copyAllButton.style.transform = 'scale(1.05)';
        });
        
        copyAllButton.addEventListener('mouseleave', () => {
            copyAllButton.style.background = 'rgba(76, 175, 80, 0.7)';
            copyAllButton.style.transform = 'scale(1)';
        });
        
        copyAllButton.addEventListener('click', copyAllConsoleLog);
        
        const exportAllButton = document.createElement('button');
        exportAllButton.textContent = 'Export All';
        exportAllButton.style.cssText = `
            background: rgba(33, 150, 243, 0.7);
            color: white;
            border: none;
            padding: 4px 6px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 9px;
            font-weight: 600;
            transition: all 0.2s ease;
        `;
        
        exportAllButton.addEventListener('mouseenter', () => {
            exportAllButton.style.background = 'rgba(33, 150, 243, 0.9)';
            exportAllButton.style.transform = 'scale(1.05)';
        });
        
        exportAllButton.addEventListener('mouseleave', () => {
            exportAllButton.style.background = 'rgba(33, 150, 243, 0.7)';
            exportAllButton.style.transform = 'scale(1)';
        });
        
        exportAllButton.addEventListener('click', exportAllConsoleLog);
        
        buttonContainer.appendChild(clearButton);
        buttonContainer.appendChild(copyAllButton);
        buttonContainer.appendChild(exportAllButton);
        
        consoleHeader.appendChild(consoleTitle);
        consoleHeader.appendChild(buttonContainer);
        
        // Console log area (scrollable)
        consoleLogArea = document.createElement('div');
        consoleLogArea.style.cssText = `
            height: 250px;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 8px;
            background: rgba(0, 0, 0, 0.7);
            font-family: 'Courier New', monospace;
        `;
        
        // Custom scrollbar for console
        const scrollbarStyle = document.createElement('style');
        scrollbarStyle.textContent = `
            #tiktok-streak-gui ~ div div:last-child::-webkit-scrollbar {
                width: 6px;
            }
            #tiktok-streak-gui ~ div div:last-child::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.1);
                border-radius: 3px;
            }
            #tiktok-streak-gui ~ div div:last-child::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.3);
                border-radius: 3px;
            }
            #tiktok-streak-gui ~ div div:last-child::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.5);
            }
        `;
        document.head.appendChild(scrollbarStyle);
        
        consoleContainer.appendChild(consoleHeader);
        consoleContainer.appendChild(consoleLogArea);
        
        // Add initial welcome message to console
        setTimeout(() => {
            if (showConsoleLog) {
                logMessage("📺 Console Log Display initialized");
            }
        }, 500);
        
        // Make it draggable
        makeDraggable(guiContainer, titleBar);
        
        // Add both containers to page
        document.body.appendChild(guiContainer);
        document.body.appendChild(consoleContainer);
        
        // Initialize console toggle state after all elements are created and added to page
        updateConsoleToggleState();
        
        logMessage("Enhanced TikTok Streak Saver GUI created with proper input simulation");
        
        } catch (error) {
            console.error("Error creating GUI:", error);
            logMessage(`❌ Error creating GUI: ${error.message}`);
        }
    }
    
    // Function to make element draggable (fixed for both X and Y movement)
    function makeDraggable(element, handle) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let elementX = 0;
        let elementY = 0;
        
        // Initialize element position
        const rect = element.getBoundingClientRect();
        elementX = rect.left;
        elementY = rect.top;
        
        handle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        function dragStart(e) {
            // Only start drag if clicking on the handle (not the toggle button)
            if (e.target === toggleButton) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            element.style.cursor = 'grabbing';
            handle.style.cursor = 'grabbing';
            
            // Prevent text selection
            e.preventDefault();
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // Calculate new position
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            elementX += deltaX;
            elementY += deltaY;
            
            // Keep within viewport bounds
            const elementRect = element.getBoundingClientRect();
            const maxX = window.innerWidth - elementRect.width;
            const maxY = window.innerHeight - elementRect.height;
            
            elementX = Math.max(0, Math.min(elementX, maxX));
            elementY = Math.max(0, Math.min(elementY, maxY));
            
            // Update element position
            element.style.left = elementX + 'px';
            element.style.top = elementY + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
            
            // Update start position for next movement
            startX = e.clientX;
            startY = e.clientY;
        }
        
        function dragEnd() {
            if (!isDragging) return;
            
            isDragging = false;
            element.style.cursor = '';
            handle.style.cursor = 'move';
        }
    }
    
    // Enhanced main automation function with smart redirection
    async function main() {
        if (!isAutomationRunning) return;
        
        logMessage("=== TikTok Streak Saver Automation Started ===");
        logMessage(`📊 CURRENT MODE: ${DEBUG_MODE ? 'DEBUG (Safe Mode - NO messages sent)' : 'PRODUCTION (Messages WILL be sent)'}`);
        
        // Step 1: Check current page and redirect if necessary
        logMessage("Step 1: Checking current page location...");
        const needsRedirection = redirectToMessagesPage();
        
        if (needsRedirection) {
            logMessage("Redirection initiated. Automation will continue when messages page loads.");
            
            // Set up a listener to continue automation after redirection
            const continueAutomation = () => {
                setTimeout(async () => {
                    if (isOnMessagesPage() && isAutomationRunning) {
                        logMessage("Messages page loaded after redirection. Continuing automation...");
                        await executeAutomationSteps();
                    }
                }, 3000);
            };
            
            // Listen for page load after redirection
            window.addEventListener('load', continueAutomation, { once: true });
            return;
        }
        
        // Step 2: We're already on messages page, proceed directly
        logMessage("Already on messages page. Proceeding with automation...");
        await executeAutomationSteps();
    }
    
    // Separated automation execution steps
    async function executeAutomationSteps() {
        try {
            logMessage("Step 2: Waiting for page to be fully ready...");
            await waitForPageReady();
            
            logMessage("Step 3: Verifying we're on the correct page...");
            if (!isOnMessagesPage()) {
                logMessage("ERROR: Not on messages page after redirection. Stopping automation.");
                isAutomationRunning = false;
                updateButtonState(false);
                return;
            }
            
            logMessage("Step 4: Page verification successful. Starting user processing...");
            await processUsers();
            
            logMessage("=== Automation Completed Successfully ===");
            
        } catch (error) {
            logMessage(`ERROR during automation execution: ${error.message}`);
        } finally {
            // Reset automation state
            isAutomationRunning = false;
            updateButtonState(false);
        }
    }
    
    // Enhanced initialization with better detection
    function initializeScript() {
        try {
            logMessage("Script starting initialization...");
            
            // Check if we're on TikTok at all
            if (!isOnTikTok()) {
                logMessage("Not on TikTok domain, script will not initialize");
                return;
            }
            
            logMessage("TikTok domain detected, initializing enhanced GUI...");
            createDraggableGUI();
            logMessage("Enhanced TikTok Streak Saver GUI initialized with proper input simulation");
            
            // Log current page status
            if (isOnMessagesPage()) {
                logMessage("Already on messages page - ready for automation");
            } else {
                logMessage("Not on messages page - will redirect when automation starts");
            }
        } catch (error) {
            console.error("Error during initialization:", error);
            logMessage(`❌ Error during initialization: ${error.message}`);
        }
    }
    
    // Multiple initialization approaches to ensure the script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeScript, 1000);
        });
    } else {
        // Document already loaded
        setTimeout(initializeScript, 1000);
    }
    
    // Backup initialization on window load
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!guiContainer) {
                logMessage("Backup initialization triggered");
                initializeScript();
            }
        }, 2000);
    });
    
    // Additional initialization for SPAs (Single Page Applications)
    let initCheckCount = 0;
    const maxInitChecks = 10;
    
    const checkForInit = setInterval(() => {
        initCheckCount++;
        if (!guiContainer && isOnTikTok()) {
            logMessage(`Periodic initialization check ${initCheckCount}/${maxInitChecks}`);
            initializeScript();
        }
        
        if (initCheckCount >= maxInitChecks || guiContainer) {
            clearInterval(checkForInit);
        }
    }, 3000);
    
    // Script fully loaded confirmation
    console.log("✅ TikTok Streak Saver Script Fully Loaded");
})();