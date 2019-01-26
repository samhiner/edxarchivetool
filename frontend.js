//TODO make it so the script can handle a bad password

PASSWORD = 'arbys';
problemButtons = [];

startArchiveTool();

var currTitle = document.title;
window.setInterval(function() {
	if (document.title !== currTitle) {
		startArchiveTool();
		currTitle = document.title;
	}
}, 100);

function startArchiveTool() {
	var buttons = document.getElementsByClassName('submit btn-brand');

	for (var x = 0; x < buttons.length; x++) {
		buttons[x].disabled = false;
		updateFormatWrapper(buttons[x]);

		var currButton = buttons[x];

		//make button
		buttons[x].onclick = function(event) {
			//temporary measure so you can't click after you submit but before the script loads
			//to re-enable the button. Later in script it is evaluated if script should be re-
			//enabled onclick
			keepSubmit(currButton, false);

			checkAnswer(event);
		};
	}
}

//make sure that the submit does not get greyed out onclick
//for some reason it happens with questions with multiple responses
//"keep" is a bool that can reverse function to destroy onclick for the responseArea
function keepSubmit(element, keep = true) {
	var responses = element.parentElement.parentElement.parentElement.children[0].children;
	//sometimes the questions are stored inside an extra span
	if (responses.length === 1) {
		responses = responses[0].children
	}

	var responseArea = element.parentElement.parentElement.parentElement.children[0];

	responseArea.onclick = function(event) {
		//if "keep" is true, make button not disabled; else, disable it.
		element.disabled = !keep;
	};
}

//get info about a question that is needed for locating it in the sheet
function getQuestionInfo(element) {
	if (element.className === 'submit-attempt-container') {
		element = element.firstElementChild;
	}

	var lesson = document.title.split(' ')[0];
	var problem = parseInt(getLastNum(element.parentElement.parentElement.parentElement.previousElementSibling.previousElementSibling.firstChild.data));
	var possPoints = parseInt(getLastNum(element.parentElement.parentElement.parentElement.previousElementSibling.innerText));
	var possTries = parseInt(getLastNum(element.nextElementSibling.childNodes[0].data));

	return [lesson, problem, possPoints, possTries];
}

function getLastNum(string) {
	string = string.split(new RegExp('/| |#', 'g'));
	for (var x = string.length - 1; x >= 0; x--) {
		//if the word at "x" is a number
		if (!isNaN(parseFloat(string[x])) && isFinite(string[x])) {
			return string[x];
		}
	}
}

function updateFormatExec(data, buttonIndex) {
	var element = window.problemButtons[buttonIndex];
	var questionInfo = getQuestionInfo(element);

	[score, tries] = data.split(',');
	//if you have maxed out tries or score
	if (tries == questionInfo[3] || score == questionInfo[2]) {
		element.disabled = true;
		keepSubmit(element, false);
		//TODO add tries and score info
	} else {
		//if button is supposed to stay on keep it on
		element.disabled = false;
		keepSubmit(element);
	}
}

//make question reflect the "tries" and "score" data in the spreadsheet
function updateFormatWrapper(element) {
	if (window.problemButtons.indexOf(element) === -1) {
		window.problemButtons.push(element)
	}

	var questionInfo = getQuestionInfo(element);

	var args = 'lesson:' + questionInfo[0] + ',problem:' + questionInfo[1] + ',type:getTries,possTries:' + questionInfo[3] + ',possPoints:' + questionInfo[2]
		+ '&button=' + window.problemButtons.indexOf(element) + '&password=' + window.PASSWORD;

	window.currProblemButton = element;

	//this ajax request executes a script to run "updateFormatExec()" and gives that function the data it needs
	$.ajax({
		url: 'https://script.google.com/macros/s/AKfycbyPdkk_VoJjlOolZChvmekYU70SHgDJy73Vn8PBDHR5Zl-UvuV9/exec?request=' + args,
		dataType: 'jsonp'
	});
}

//when submit is clicked, this compares your answer to the correct answer and runs submit().
function checkAnswer(event) {
	//find the code for the answer URL
	var problemCode = event.srcElement.parentElement.parentElement.parentElement.parentElement;

	if (problemCode.id === '') {
		problemCode = problemCode.parentElement.id;
		var path = 1;
	} else {
		problemCode = problemCode.id;
		var path = 2;
	}

	console.log('Current DOM setup for problem code is: ' + String(path))

	problemCode = problemCode.split('_')[1];

	//get the answer
	$.get('https://courses.edx.org/courses/course-v1:RiceX+AdvCAL.1x+2015_T3/xblock/block-v1:RiceX+AdvCAL.1x+2015_T3+type@problem+block@' + problemCode + '/handler/xmodule_handler/problem_show',	
	function(data) {
		var choices = getQuestionChoices(event.srcElement.parentElement, path);

		console.log(choices)

		var x = 0;
		var score = 0;
		for (var answerIndex in data.answers) {
			var answer = data.answers[answerIndex];

			if (typeof answer === 'object') {
				answer = answer[0];
			}

			if (answer == undefined) {
				console.error('Failed to get user answer.')
			}

			console.log('Choice:', choices[x], 'Answer:', answer)

			if (choices[x] == answer) {
				score += 1;
			}
			x++;
		}
		//TODO change x so it supports when score doesn't match questions
		alert('Score: ' + score + '/' + x + '.');

		submit(score, event.srcElement.parentElement);
	});
}

//this finds the individual problems in a question and calls getChoicesInsideQuestion() to get the answer choices.
function getQuestionChoices(element) {
	var fullQuestionElement = element

	choices = [];
	while (element.className != 'problem') {
		element = element.parentElement;
	}
	element = element.firstElementChild;

	var foundQuestionWrapper = false;
	for (var x = 0; x < element.children.length; x++) {
		if (element.children[x].nodeName === 'DIV') {
			element = element.children[x];
			foundQuestionWrapper = true;
			break;
		}
	}

	if (foundQuestionWrapper === false) {
		console.error('Could not find question wrapper. Debugging tool below:');
		console.log(fullQuestionElement)
	}

	if (element.nodeName == 'SPAN') {
		for (var x = 0; x < element.children.length; x++) {
			if (element.children[x].className === 'wrapper-problem-response' || element.children[x].className === 'inline') {
				choices.push(getChoicesInsideQuestion(element.children[x], fullQuestionElement));
			}
		}
	} else {
		choices.push(getChoicesInsideQuestion(element, fullQuestionElement));
	}
	return choices;
}

//this gets the answer choice from a problem (a question can have multiple problems in it)
function getChoicesInsideQuestion(question, element) {
	question = question.firstElementChild;

	//if it is a write in question
	if (Array.from(question.classList).indexOf('formulaequationinput') !== -1 || Array.from(question.classList).indexOf('text-input-dynamath') !== -1) {
		while (question.nodeName !== 'INPUT') {
			question = question.firstElementChild;
		}
		return question.value;
	//if it is a multiple choice question
	} else if (Array.from(question.classList).indexOf('choicegroup') !== -1) {
		var fieldsetAttribute = question.firstElementChild.attributes[0].nodeValue;
		var finalAnswer = 'None';
		$('fieldset[aria-describedby*="' + fieldsetAttribute + '"] input:radio').each(function() {
			if (this.checked) {
				finalAnswer = this.value;
			}
		});
		return finalAnswer;
	} else {
		console.error('Could not find choices in HTML DOM. Debugging tool below:')
		console.log(element.attributes)
	}
}

//submits the new data to the google sheet that keeps track of progress
function submit(score, element) {
	//get the arguments for the URL
	var questionInfo = getQuestionInfo(element);
	var args = 'lesson:' + questionInfo[0] + ',problem:' + questionInfo[1] + ',type:submit,possTries:' + questionInfo[3] + ',possPoints:' + questionInfo[2] + ',score:' + score + '&password=' + window.PASSWORD;

	//submit the data
	$.ajax({
		url: 'https://script.google.com/macros/s/AKfycbyPdkk_VoJjlOolZChvmekYU70SHgDJy73Vn8PBDHR5Zl-UvuV9/exec?method=handleRequest&request=' + args,
		dataType: 'jsonp',
		complete: function() {
			//update the question UI to reflect the data
			updateFormatWrapper(element);
		}
	});

	//TODO get a wrong answer notification to pop up

}