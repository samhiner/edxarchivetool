//TODO make it so the script can handle a bad password

PASSWORD = 'jellyfish';

//setup
var buttons = document.getElementsByClassName('submit btn-brand');
for (var x = 0; x < buttons.length; x++) {
	buttons[x].disabled = false;
	updateFormat(buttons[x]);

	//make button
	buttons[x].onclick = function(event) {
		check(event);
	};
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

	if (keep) {
		responseArea.onclick = function(event) {
			element.disabled = false;
			console.log('click-on')
		};
	} else {
		responseArea.onclick = function() { console.log('click-off') };
	}
}

//get info about a question that is needed for locating it in the sheet
function getQuestionInfo(element) {
	var lesson = document.title.split(' ')[0];
	var problem = parseInt(getLastNum(element.parentElement.parentElement.parentElement.previousElementSibling.previousElementSibling.firstChild.data));
	var possPoints = parseInt(getLastNum(element.parentElement.parentElement.parentElement.previousElementSibling.firstChild.data));
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

//THIS IS REALLY BROKEN because I can't figure out how to get it to not have a cross-origin error or execute the result.
//make question reflect the "tries" and "score" data in the spreadsheet
function updateFormat(element) {
	var questionInfo = getQuestionInfo(element);
	var args = 'lesson:' + questionInfo[0] + ',problem:' + questionInfo[1] + ',type:getTries,possTries:' + questionInfo[3] + ',possPoints:' + questionInfo[2] + '&password=' + window.PASSWORD;

	$.ajax({
		url: 'https://script.google.com/macros/s/AKfycbyPdkk_VoJjlOolZChvmekYU70SHgDJy73Vn8PBDHR5Zl-UvuV9/exec?method=handleRequest&request=' + args,
		datatype: 'jsonp',
		callback: function() { console.log('hello') },
		success: function(data) {
			[score, tries] = data.split(',');
			//if you have maxed out tries or score
			if (tries == questionInfo[3] || score == questionInfo[2]) {
				console.log('WOAHHHHHHHH')
				element.disabled = true;
				keepSubmit(element, false);
				//TODO add tries and score info
			} else {
				console.log('LLLLLLL')
				//if button is supposed to stay on keep it on
				keepSubmit(element);
			}
		},
	});
}

//when submit is clicked, this compares your answer to the correct answer and runs submit().
function check(event) {
	//find the code for the answer URL
	var problemCode = event.srcElement.parentElement.parentElement.parentElement.parentElement;

	if (problemCode.id === '') {
		problemCode = problemCode.parentElement.id;
		var path = 1;
	} else {
		problemCode = problemCode.id;
		var path = 2;
		console.log('GO');
	}

	problemCode = problemCode.split('_')[1];

	//get the answer
	$.get('https://courses.edx.org/courses/course-v1:RiceX+AdvCAL.1x+2015_T3/xblock/block-v1:RiceX+AdvCAL.1x+2015_T3+type@problem+block@' + problemCode + '/handler/xmodule_handler/problem_show',	
	function(data) {
		var choices = getChoices(event.srcElement.parentElement, path);

		console.log(choices);
		console.log(data.answers);

		var x = 0;
		var score = 0;
		for (var answerIndex in data.answers) {
			var answer = data.answers[answerIndex];

			if (typeof answer === 'object') {
				answer = answer[0];
			}

			if (choices[x] == answer) {
				score += 1;
			}
			x++;
		}
		//TODO change x so it supports when score doesn't match questions
		console.log('Score: ' + score + '/' + x)

		submit(score, event.srcElement.parentElement);	
	});
}

//path: there are two paths, 1 and 2 and the one you use depends on how
//the html happened to be organized on this load. Pretty sure it loads
//differently because the DOM is trying to process a bug but that is just
//conjecture
function getChoices(element, path) {
	console.log(element.attributes)
	var questions = element.parentElement.parentElement.parentElement.children

	if (path === 2) {
		questions = questions[2].children[0].children[0].children;
	} else if (path === 1) {
		questions = questions[0].children[0].children;
	}

	var choices = [];
	for (var x = 0; x < questions.length; x++) {
		if (questions[x].nodeName === 'DIV') {
			if (questions[x].attributes[0].value === 'wrapper-problem-response') {
				attribute = questions[x].firstElementChild.firstElementChild.attributes[0].value
				var checked = false;
				$('fieldset[aria-describedby*="' + attribute + '"] input:radio').each(function() {
					if (this.checked === true) {
						choices.push(this.value)
						checked = true;
					}
				});
				if (!checked) {
					choices.push('None')
				}
			} else if (questions[x].attributes[0].value === 'inline') {
				choices.push(questions[x].firstElementChild.firstElementChild.firstElementChild.value);
			}
		}
	}

	return choices;
}

//submits the new data to the google sheet that keeps track of progress
function submit(score, element) {
	//get the arguments for the URL
	var questionInfo = getQuestionInfo(element);
	var args = 'lesson:' + questionInfo[0] + ',problem:' + questionInfo[1] + ',type:submit,possTries:' + questionInfo[3] + ',possPoints:' + questionInfo[2] + ',score:' + score + '&password=' + window.PASSWORD;

	//submit the data
	$.ajax({
		url: 'https://script.google.com/macros/s/AKfycbyPdkk_VoJjlOolZChvmekYU70SHgDJy73Vn8PBDHR5Zl-UvuV9/exec?method=handleRequest&request=' + args,
		//TODO do i need dataType: 'jsonp',
		success: function(data) {
			if (data[0] === 'E') {
				alert('Upload failed with "' + data + '"');
			}
		}
	});

	//TODO get a wrong answer notification to pop up

	//update the question UI to reflect the data
	updateFormat(element);
}