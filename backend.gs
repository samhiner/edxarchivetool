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
//In the URL https://docs.google.com/spreadsheets/d/hello/edit#gid=0, it would be hello
SHEET_ID = '1Gb8IV2CdVWGZi6Mn9Wove2NcNCndEWtxPaaVZBbDmDw';

function handleRequest(request) {
  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet = spreadsheet.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  var lessonIndex = getLesson(data, request);
  if (lessonIndex === -1) {
    Logger.log('Error: Lesson was not found.')
    return;
  }
  
  var currProb = data[lessonIndex][request['problem']];
  
  if (prob === '') {
    //TODO this
    prob.write('0/' + request['possPoints'] + 's, 0/' + request['possTries'] + 'a')
  }
  
  if (request['type'] === 'getTries') {
    return currProb.split('/')[0]
  } else if (request['type'] === 'submit') {
    var cellData = prepareSubmit(currProb);
    
    if (cellData != false) {
      sheet.getRange(lessonIndex,request['problem']).setValue(cellData);
      return cellData;
    } else {
      return false;
    }
  }
  
}

function prepareSubmit(prob, coords, sheet) {
  if (request['score'] > prob.split('/')[0]) {
    prob = prob.split(', ');
    
    prob[0] = prob[0].split('/');
    prob[1] = prob[1].split('/');
    
    prob[0][0] = request['score']
    prob[1][0] = prob[1][0] + 1;
    
    prob[0] = prob[0].join('/');
    prob[1] = prob[1].join('/');

    prob = prob.join(', ');
    
    return prob;
  } else {
    Logger.log('Score is not highest score on this problem');
    return false;
  }
  
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