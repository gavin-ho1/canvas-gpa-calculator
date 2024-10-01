# Canvas GPA Calculator
Chrome Extension that calculates GPA on Canvas when blocked by a teacher because I couldn't find an (good) existing extension online.

## **⚠ DISCLAIMER ⚠**
This Chrome Extension is not given permissions to store any senstive/private content (browser history, passwords, etc). It is literally **IMPOSSIBLE** to get this information without permissions. 

Permissons are specified in the `manifest.json` file, under the key `"permissions"` as shown below:

> `"permissions": ["storage"],`

The `"storage"` permission is used to store grades calculated by the extension. This is the only permission used, and there is no way to send this information to and external third party. 

This code does **NOT** "hack" or break into Canvas or any site to get information on grades, it simply takes the already given information on the webpage and calculates it. This would be the same as if a human copy/pasted their own grades from the Canvas webpage and calculated them manually. In fact, many students resort to external tools that such as google sheets to track their grades by manually copying and pasting grades into a spreadsheet. This extension simply automates that process for the user's convience. 

## Installation Guide
1. Download zip file from lastest release (or just source code) and unzip
2. In your browser, go to chrome://extensions/ in your browser
3. Enable dev mode, then select the button labeled "Load unpacked"
4. Select the unzipped file directory and then run in any `instructure.com` subdomain, must be the grades section of an individual course
   - For example: `school.instructure.com/courses/1334/grades`
5. To view GPA, go to your canvas hompage/dashboard (`school.instructure.com`) to see your calculated GPA. 

### [To-Do List](/To-Do.md)

##
Installation should work for other chromium based browsers, but double check on installation of other browsers - this extension has only been tested in chrome
