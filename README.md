# edxarchivetool

## General
This is a software that I created to make taking archived courses on edX easier.
Some archived courses have submit buttons for questions disabled, so you cannot
track your progress. You can inject the frontend.js here into DevTools (or use a
<a href='https://chrome.google.com/webstore/detail/custom-javascript-for-web/poakhlngfciodnhlhhgnaaelnpjljija?hl=en'>chrome extension</a>
to make this automatic), create a Google Script with the backend.gs code in it,
and create a spreadsheet which is organized as shown below, you can track your
progress on that spreadsheet. If you want a percent completion stat, just visit
every question page and the questions will populate as not yet tried on the
spreadsheet.

## Spreadsheet Organization
The first row is left empty. You can put titles there if you want. The first 
column should be filled with the first word (space seperated object) of each
lesson. You can have more than that first word but the first word of the sheet
and on edX must match.

## Bugs
This was made for my personal use, so it is *far* from production grade. Here
are some bugs:
- The frontend script breaks if given an incorrect password.
- If you do not do problems in order (1, 2, 3, etc), they will not submit. This
	does not matter if you refresh.

## Improvement Plans
- Fill in a/b points and c/d tries in the edX UI.
- Make it so you don't have to premake a spreadsheet, there will be a script to make one.
- Turn this into a fully fledged Chrome Extension.

## License
This is licensed under the MIT license, so you may use it how you like, as long
as you provide attribution.

## Note
If anyone else ever sees this and want to use it, great! Just
keep in mind that this trusts the frontend for information about
the correct answer, the number of alloted tries, and more. So, this
shouldn't be used in situations where the users may try to fiddle
with the information. Altough, even if you were to lock this down,
it is still easy to get answers to edX problems without submitting
or clicking "View Answer," so it doesn't really matter in this case.
