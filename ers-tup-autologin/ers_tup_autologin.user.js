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

let username = 'TUPM-21-1608'
let password = 'MISSION'
let birthDate = '11/06/2002'

setTimeout(() => {
    let findForm = document.querySelector('form')

    if (findForm) {
        findForm.querySelector('input[name="username"]').value = username
        findForm.querySelector('input[name="password"]').value = password
        findForm.querySelector('input[name="bdate"]').value = birthDate
        findForm.submit()
    }
}, 2000)

