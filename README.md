# edxarchivetool

IMPORTANT: This is all specific to RiceX's Preparing for the AP Calculus AB Exam.
I will update here if I end up abstracting it. You could try to use it for other
courses, but I don't know what will and wont work (once I add this feature, the
program will only be able to find question pages on the Calc course, but it will
be easy to remove that bit, you will just have to directly navigate to every page
with questions).

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
and on edX must match. Here are some formulas you can use for progress tracking
on Google Sheets:

**edX Progress:**<br>
`=(COUNTIF(B1:Z31, "<>") - COUNTIF(B1:Z31, "0*"))/COUNTIF(B1:Z31, "<>")`<br>
edX Progress is the number of correct questions divided by all questions (if you get 1 point on a 2 point question it is factored as half a correct question).<br><br>

**Total Progress:**<br>
`=SUM(ARRAYFORMULA(IFERROR(IF(LEFT(RIGHT(B2:Z31, LEN(B2:Z31) - (FIND(", ", B2:Z31) + 1))) = "0", 0, 1), "N")))/COUNT(ARRAYFORMULA(IFERROR(IF(LEFT(RIGHT(B2:Z31, LEN(B2:Z31) - (FIND(", ", B2:Z31) + 1))) = "0", 0, 1), "N")))`<br>
Total Progress is number of attempted questions divided by all questions. <br><br>

**Current Grade:**<br>
`=SUM(ARRAYFORMULA(IFERROR(IF(LEFT(RIGHT(B2:Z31, LEN(B2:Z31) - (FIND(", ", B2:Z31) + 1))) = "0", "N", DIVIDE(LEFT(B2:Z31, FIND("/", B2:Z31) - 1), RIGHT(LEFT(B2:Z31, FIND(",", B2:Z31) - 2), FIND("/", B2:Z31) - 1))), "N")))/COUNT(ARRAYFORMULA(IFERROR(IF(LEFT(RIGHT(B2:Z31, LEN(B2:Z31) - (FIND(", ", B2:Z31) + 1))) = "0", "N", DIVIDE(LEFT(B2:Z31, FIND("/", B2:Z31) - 1), RIGHT(LEFT(B2:Z31, FIND(",", B2:Z31) - 2), FIND("/", B2:Z31) - 1))), "N")))`<br>
Current Grade is percent correct on attempted questions (multi point questions are counted like edX Progress).<br><br>

## Bugs
This was made for my personal use, so it is *far* from production grade. Here
are some bugs:
- The frontend script breaks if given an incorrect password.
- If you do not do problems in order (1, 2, 3, etc), they will not submit. This
	does not matter if you refresh.
- It doesn't find your answer half of the time.

## Improvement Plans
- Fill in a/b points and c/d tries in the edX UI.
- Make it so you don't have to premake a spreadsheet, there will be a script to make one.
- Turn this into a fully fledged Chrome Extension.
- Make it so if you visit the video first in a page the whole thing doesn't break.
- Make it actually find your answer.

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
