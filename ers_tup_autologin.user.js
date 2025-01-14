// ==UserScript==
// @name         ERS TUP Auto Login
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Student Portal Auto Login for TUP Manila
// @author       JOIBOI
// @match        https://ers.tup.edu.ph/aims/students/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edu.ph
// @grant        none
// ==/UserScript==

let userName, password;
userName = "YOUR_STUDENT_ID";
password = "YOUR_PASSWORD";

let findForm = document.querySelector('form');

// as the website has been fully loaded, script will now fill the form and submit, the delay of executing of the script maybe 2 seconds delay

if (findForm) {
    findForm.querySelector('input[name="username"]').value = userName;
    findForm.querySelector('input[name="password"]').value = password;
}