# Tiktok Automated Streak
On this instruction is the detailed context of the said script.
This is a python automation script

## Flow of the excution
- Open the Edge (New Tab Window)
- Redirect to the link `https://www.tiktok.com/messages?lang=en`
- Go find the list of the chat message with the specific persons whom I have streak into.
- Send each of them a message of `STREAK SAVER 🔥🔥🔥`
- For now do not send as this is on the debugging mode

## Instructions
First the user will run the script named `tiktok-streak.py`
After that the script will run the browser which is the `Edge`
Then open the link `https://www.tiktok.com/messages?lang=en`
Here the Javascript will take now the lead and run the following code:
The javascript will confirmed if the said current is `https://www.tiktok.com/` or `https://www.tiktok.com/messages?lang=en` to make sure it is on the right path, if not try to navigate back again to this link `https://www.tiktok.com/messages?lang=en`. THis is to make sure that we are lessening the errors.
Then if success, the javascript will scan the users, the main priority persons named:
- L4NC3
- ry
- lemmmy
- Rea Mae ❤️❤️❤️
- Keiane
- Uiharu
- woogie

Note that this is the order of sending the message so take note of that.

You can find each of them on the HTML line `<p class="css-16y88xx-PInfoNickname eii3f6d9" id="htflow-570" hf-data-width="136.125px" hf-data-display="block"></p>`
So the code will try to find that line and keep focusing on that.

Each of the person are under on the parent `div`: `<div class="css-149gota-DivScrollWrapper e1b4u1n2" style="height: 100%; overflow: auto;">` and inside of it are the scroll list of the chat persons whom I have streak into.

After the javascript finding the people name, each of them are inclosed to an interactive clickable `div` that when click it will open the chat `<div id="more-acton-icon-0" tabindex="0" data-e2e="chat-list-item" class="css-1ojajeq-DivItemWrapper eii3f6d3">`
Now before proceeding, the code check if you already opened that specific chat, but if not this will be the shown always
`<div class="css-1xdo7n9-DivIconContainer ediam1h3"><svg fill="currentColor" color="var(--ui-shape-neutral-3)" font-size="92" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><path d="M28 34h-4c-7.68 0-12.04-1.83-14.48-4.07C7.14 27.74 6 24.58 6 20.5 6 13.85 13.16 7 24 7s18 6.85 18 13.5c0 4.46-1.93 8.49-5.3 12.23a45.03 45.03 0 0 1-8.7 7.23V34Zm0 10.7c9.52-5.82 18-13.66 18-24.2C46 10.84 36.15 3 24 3S2 10.84 2 20.5 7.5 38 24 38v7.32a.99.99 0 0 0 1.47.86A93.58 93.58 0 0 0 28 44.7Z"></path></svg></div>`

If you success clicked a specific person then this will be the sample chat you will see:
```
<div class="css-nhbyau-DivChatBottom e1823izs0"><div data-focus-guard="true" tabindex="-1" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div><div data-focus-lock-disabled="disabled"></div><div data-focus-guard="true" tabindex="-1" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div><div class="css-z1eu53-DivMessageInputAndSendButton e1823izs1"><div data-e2e="message-input-area" class="css-2qu84l-DivInputAreaContainer e1823izs4"><div class="css-1a4kn3-DivEditorContainer e1823izs2"><div class="css-18bfb8o-DivInputAreaContainer edzwif20"><div class="css-zxf3x3-DivOutlineReceiver edzwif23"></div><div class="DraftEditor-root"><div class="public-DraftEditorPlaceholder-root"><div class="public-DraftEditorPlaceholder-inner" id="placeholder-vpjr" style="white-space: pre-wrap;">Send a message...</div></div><div class="DraftEditor-editorContainer"><div aria-describedby="placeholder-vpjr" aria-label="Send a message..." class="notranslate public-DraftEditor-content" contenteditable="true" role="textbox" spellcheck="false" tabindex="0" style="outline: none; user-select: text; white-space: pre-wrap; overflow-wrap: break-word;"><div data-contents="true"><div class="" data-block="true" data-editor="vpjr" data-offset-key="an7fc-0-0"><div data-offset-key="an7fc-0-0" class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"><span data-offset-key="an7fc-0-0"><br data-text="true"></span></div></div></div></div></div></div></div></div><div class="TUXTooltip-reference" style="margin-bottom: 20px;"><div tabindex="0" role="button" aria-expanded="false" aria-haspopup="true" aria-controls="emoji-suggestion-container" class="css-12vf5cb-DivEmojiButton e1823izs5"><svg class="css-138ulyj-StyledEmojiIcon e1823izs19" width="1em" data-e2e="" height="1em" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6ZM2 24C2 11.8497 11.8497 2 24 2C36.1503 2 46 11.8497 46 24C46 36.1503 36.1503 46 24 46C11.8497 46 2 36.1503 2 24Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M17 23C18.6569 23 20 21.2091 20 19C20 16.7909 18.6569 15 17 15C15.3431 15 14 16.7909 14 19C14 21.2091 15.3431 23 17 23Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M31 23C32.6569 23 34 21.2091 34 19C34 16.7909 32.6569 15 31 15C29.3431 15 28 16.7909 28 19C28 21.2091 29.3431 23 31 23Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M16 28.3431C16 31.4673 19.5817 36 24 36C28.4183 36 32 31.4673 32 28.3431C32 25.219 16 25.219 16 28.3431Z"></path></svg></div></div></div></div></div>
```
Note: this is a sample source code only from a specific person, the contents may change so be aware of that.

Again the javascript will verify if succesfully executed the instructions. If not try again.

See there is a `Send a message...` input therefore you successfully opened a certain chat.
The the java script will find that `input` and type a simple message `STREAK SAVER 🔥🔥🔥` message
Note that this script will not send first, this is a test debugging only.
Then again the script will verify if the message on the `input` `STREAK SAVER 🔥🔥🔥` was there.

On the previous list as you observe that I have 7 persons and the are organized based on the sending priority. Now if one person on the list is done inputing the streak message, then go find another person up untill all names are met and finished. If done send a console log and a CLI display message that thi process is done.

Note:
It must be a log display for every status in the CLI so that the user can track the activity of the script.
The log must be have this format in the first of the line `[2025-04-29 08:59:10]` this is the example only.
On every verification, there must be a corresponding console log and python CLI log.
