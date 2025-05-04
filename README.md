# <img src="logo.png" width="50"> Canvas GPA Calculator 
![Chrome Users](https://img.shields.io/chrome-web-store/users/hedjldnoldbeihmghalfbkaobifigmhi?style=for-the-badge&label=Chrome%20Users:&labelColor=4285F4&labelColor=4285F4&color=4285F4) ![Edge Addons Users](https://img.shields.io/badge/dynamic/json?label=Edge%20Addons%20Users:\&query=%24.activeInstallCount\&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fkjljmlkojppfklkhdifcbbkhbalhmgfm\&style=for-the-badge\&logo=microsoft-edge\&color=4285F4\&labelColor=4285F4\&labelColor=4285F4)\
![Chrome Rating](https://img.shields.io/chrome-web-store/stars/hedjldnoldbeihmghalfbkaobifigmhi?style=for-the-badge&label=Chrome%20Rating:&labelColor=4285F4&labelColor=4285F4&color=4285F4) ![Edge Rating](https://img.shields.io/badge/dynamic/json?label=Edge%20Rating%3A&query=%24.averageRating&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fkjljmlkojppfklkhdifcbbkhbalhmgfm&style=for-the-badge&logo=microsoft-edge&color=4285F4&labelColor=4285F4&labelColor=4285F4)







Chrome Extension that calculates GPA on Canvas when blocked by a teacher because I couldn't find an (good) existing extension online.


# **⚠ DISCLAIMER ⚠**
This Chrome Extension is not given permissions to store any senstive/private content (browser history, passwords, etc). It is literally **IMPOSSIBLE** to get this information without permissions. 

Permissons are specified in the `manifest.json` file, under the key `"permissions"` as shown below:

> `"permissions": ["storage"],`

The `"storage"` permission is used to store grades calculated by the extension. This is the only permission used, and there is no way to send this information to and external third party. 

This code does **NOT** "hack" or break into Canvas or any site to get information on grades, it simply takes the already given information on the webpage and calculates it. This would be the same as if a human copy/pasted their own grades from the Canvas webpage and calculated them manually. In fact, many students resort to external tools that such as google sheets to track their grades by manually copying and pasting grades into a spreadsheet. This extension simply automates that process for the user's convience. 

### **This extension should not be used to determine your final grade. Your course instructor may have a different method of grade calculation. This extension is only meant to be a productivity tool that gives you a general idea of what your grade is.**

##

### [Official Chrome Web Store Extension](https://chromewebstore.google.com/detail/canvas-gpa-calculator/hedjldnoldbeihmghalfbkaobifigmhi) 
### [Official Microsoft Edge Addons Extension](https://microsoftedge.microsoft.com/addons/detail/canvas-gpa-calculator/kjljmlkojppfklkhdifcbbkhbalhmgfm) 




##

## Features
- Individual course calculation based on published assigment grades
   - Regular grade calculation
   - Weighted grade calculation
- Total GPA calculator
- [Better Canvas](https://chromewebstore.google.com/detail/better-canvas/cndibmoanboadcifjkjbdpjgfedanolh) Compatibility
   - Overrides some features to display accurate grades
   - Writes over Better Canvas' GPA calculator
## Manual Installation Guide (For Alpha and Beta testing only)
1. Download zip file from [lastest release](https://github.com/gavin-ho1/canvas-gpa-calculator/releases/latest) and unzip
2. In your browser, go to chrome://extensions/ in your browser
3. Enable dev mode, then select the button labeled "Load unpacked"
4. Select the unzipped file directory and then run in any `instructure.com` subdomain, must be the grades section of an individual course
   - For example: `school.instructure.com/courses/1334/grades`
5. To view GPA, go to your Canvas hompage/dashboard (`school.instructure.com`) to see your calculated GPA. 

##

### [To-Do List](/To-Do.md)

##

Installation should work for other chromium based browsers, but double check on installation of other browsers - this extension has only been tested in chrome.

