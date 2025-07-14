// ==UserScript==
// @name         Disable Anti-Dev
// @namespace    http://tampermonkey.net/
// @version      2025-01-28
// @description  This is a script to detect and prevent anti-debugging techniques
// @author       JOIBOI
// @match        https://ers.tup.edu.ph/aims/students/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edu.ph
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

    // Wait for the webpage to load
    setTimeout(() => {
          // Restore right-click functionality
  document.addEventListener(
    "contextmenu",
    function (e) {
      e.stopPropagation();
      return true;
    },
    true
  );

  // Prevent keyboard shortcut blocking
  document.addEventListener(
    "keydown",
    function (e) {
      // Allow F12
      if (e.key === "F12") {
        e.stopPropagation();
        return true;
      }

      // Allow Ctrl+Shift combinations
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case "i": // Inspector
          case "j": // Console
          case "c": // Element picker
            e.stopPropagation();
            return true;
        }
      }

      // Allow Ctrl+U (View source)
      if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.stopPropagation();
        return true;
      }
    },
    true
  );

  // Prevent console.log blocking
  const originalLog = console.log;
  Object.defineProperty(console, "log", {
    get: function () {
      return originalLog;
    },
    set: function () {
      return originalLog;
    },
  });

  // Prevent debugger statements
  const originalDebugger = window.debugger;
  Object.defineProperty(window, "debugger", {
    get: function () {
      return originalDebugger;
    },
    set: function () {
      return originalDebugger;
    },
  });

  // Log that the script is active
  console.log("Anti-dev detection script is active");
    }, 3000);
})();
