/*
If anyone else ever sees this and want to use it, great! Just
keep in mind that this trusts the frontend for information about
the correct answer, the number of alloted tries, and more. So, this
shouldn't be used in situations where the users may try to fiddle
with the information. Altough, even if you were to lock this down,
it is still easy to get answers to edX problems without submitting
or clicking "View Answer," so it doesn't really matter in this case.
*/

/*
request {
  lesson: (str) First word of the lesson's name. Ex: 1.1, 1.2, Limits, etc.
  problem: (0 < int <= numProbsInLesson).
  type: 
  possTries:
  possPoints:
  score:
}
*/

//I don't use sheet length because that includes my stats below the lessons
NUM_LESSONS = 32; 
//In the URL https://docs.google.com/spreadsheets/d/hello/edit#gid=0, SHEET_ID would be hello
SHEET_ID = '1Gb8IV2CdVWGZi6Mn9Wove2NcNCndEWtxPaaVZBbDmDw';
//this is defined by you so random people can't run your script without knowing the password
//(it's low security but this is a low risk situation)
PASSWORD = 'INSERT_PASSWORD_HERE';

function doGet(request) {
  if (request['parameter']['password'] != PASSWORD) {
    Logger.log('Error: Wrong password.');
    return ContentService.createTextOutput('alert("Upload Error: Wrong password.")')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
    
  args = parseRequest(request['parameter']['request']);
    
  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet = spreadsheet.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  var lessonIndex = getLesson(data, args);
  if (lessonIndex === -1) {
    Logger.log('Error: Lesson was not found.');
    Logger.log('  Lesson:' + args['lesson']);
    return ContentService.createTextOutput('alert("Upload Error: Lesson was not found.")')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  var currProb = data[lessonIndex][args['problem'] - 1];
  
  if (currProb == '' || currProb == undefined) {
    var cellFillerData = '0/' + args['possPoints'] + 's, 0/' + args['possTries'] + 'a';
    sheet.getRange(lessonIndex + 1, args['problem']).setValue(cellFillerData);
    currProb = cellFillerData;
  }
  
  if (args['type'] === 'getTries') {
    result = String(currProb.split('/')[0]) + ',' + String(currProb.split(', ')[1].split('/')[0]);
    return ContentService.createTextOutput('updateFormatExec("' + result + '", ' + request['parameter']['button'] + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (args['type'] === 'submit') {
    var cellData = prepareSubmit(currProb, args);

    sheet.getRange(lessonIndex + 1, args['problem']).setValue(cellData);
    return ContentService.createTextOutput('console.log("Upload Success!");')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
}

function prepareSubmit(prob, request) {
  prob = prob.split(', ');
    
  prob[0] = prob[0].split('/');
  prob[1] = prob[1].split('/');
  
  if (request['score'] > prob[0][0]) {
    prob[0][0] = request['score'];
  } else {
    Logger.log('Score is not highest score on this problem');
  }
  prob[1][0] = parseInt(prob[1][0]) + 1;
  
  prob[0] = prob[0].join('/');
  prob[1] = prob[1].join('/');
  
  prob = prob.join(', ');
  
  return prob;
}

function parseRequest(request) {
  request = request.split(',');
  var newRequest = {};

  for (var x = 0; x < request.length; x++) {
    request[x] = request[x].split(':');
    newRequest[request[x][0]] = request[x][1];
  }
  newRequest['problem'] = parseInt(newRequest['problem']) + 1;
  
  return newRequest;
}

//find the row for the submitted lesson's data
function getLesson(data, request) {
  var lessonIndex = -1;
  for (var x = 1; x < NUM_LESSONS; x++) {
    if (request['lesson'] === data[x][0].split(' ')[0]) {
      lessonIndex = x;
      break;
    }
  }
  return lessonIndex;
  
}