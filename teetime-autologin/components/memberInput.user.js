// ==UserScript==
// @name         User Input List
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  A simple script to set the user input on the Tagaytay Highlands Teetime website. The script will automatically input the user's details on the registration form
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
    const memberData = {
        member1FirstName: 'John Doe',
        member1LastName: 'Smith',

        member2FirstName: 'Jane Doe',
        member2LastName: 'Spinther',

        member3FirstName: 'Jill Doe',
        member3LastName: 'Spencer',
    }

    let findForm = document.querySelector('form');

    if (!findForm) {
        console.log('Form not found');
        findForm = document.querySelector('form');
    } else {
        console.log('Form found');
    }

    if (findForm) {
        findForm.querySelector('input[name="player1f"]').value = memberData.member1FirstName;
        findForm.querySelector('input[name="player1l"]').value = memberData.member1LastName;
        findForm.querySelector('input[name="player2f"]').value = memberData.member2FirstName;
        findForm.querySelector('input[name="player2l"]').value = memberData.member2LastName;
        findForm.querySelector('input[name="player3f"]').value = memberData.member3FirstName;
        findForm.querySelector('input[name="player3l"]').value = memberData.member3LastName;
        console.log('User data input successful');
    } else  {
        console.error('User adata input failed');    
    }
}, 9000);