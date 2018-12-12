PASSWORD = 'INSERT_A_PASSWORD';

//setup
var buttons = document.getElementsByClassName('submit btn-brand');
for (var x = 0; x < buttons.length; x++) {
	buttons[x].disabled = false;
	updateFormat(buttons[x]);
	buttons[x].onclick = function(event) {
		check(event);
	};
}

//get info about a question that is needed for lcoating it in the sheet
function getQuestionInfo(element) {
	var lesson = document.title.split(' ')[0];
	var problem = parseInt(getLastNum(element.parentElement.parentElement.parentElement.previousElementSibling.previousElementSibling.firstChild.data));
	var possPoints = parseInt(getLastNum(element.parentElement.parentElement.parentElement.previousElementSibling.firstChild.data));
	var possTries = parseInt(getLastNum(element.nextElementSibling.childNodes[0].data));

	console.log(lesson);
	console.log(problem);
	console.log(possPoints);
	console.log(possTries);

	return lesson, problem, possPoints, possTries;
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

//make question reflect the "tries" and "score" data in the spreadsheet
function updateFormat(element) {
	var lesson, problem, possPoints, possTries = getQuestionInfo(element);
	var args = 'lesson:' + lesson + ',problem:' + problem + ',type:getTries,possTries:' + possTries + ',possPoints:' + possPoints + '&password=' + PASSWORD;

	$.ajax({
		url: 'https://script.google.com/macros/s/AKfycbyPdkk_VoJjlOolZChvmekYU70SHgDJy73Vn8PBDHR5Zl-UvuV9/exec?method=handleRequest&request=' + args,
		dataType: 'jsonp',
		success: function(data) {
			[score, tries] = data.split(',');
			if (tries == possTries || score == possPoints) {
				console.log('WOAHHHHHHHH')
				element.disabled = true;
				//TODO add tries and score info
			}
		}
	});
}

//when submit is clicked, this compares your answer to the correct answer and runs submit().
function check(event) {
	//find the code for the answer URL
	var problemCode = event.path[5].id.split('_')[1];
	//sometimes the code can't be found for whatever reason
	//so I just reload in those cases as this isn't production grade
	if (problemCode === undefined) {
		alert("Could not find this question's ID. Refreshing now.");
		location.reload();
	}

	//get the answer
	$.get('https://courses.edx.org/courses/course-v1:RiceX+AdvCAL.1x+2015_T3/xblock/block-v1:RiceX+AdvCAL.1x+2015_T3+type@problem+block@' + problemCode + '/handler/xmodule_handler/problem_show',	
	function(data) {
		choices = getChoices(event.srcElement.parentElement);

		console.log(data.answers)

		var x = 0;
		var score = 0;
		for (answer in data.answers) {
			if (choices[x] == answer) {
				score += 1;
			}
			x++;
		}
		console.log('Score: ' + score + '/' + data.answers.length)

		submit(score, event.srcElement.parentElement);	
	});
}

function getChoices(element) {
	var questions = element.parentElement.parentElement.parentElement.children[0].children[0].children
	
	for (var x = 0; x < questions.length; x++) {
		console.log('some stuff for radio. doesnt work for text tho')
		/*if (questions[x].nodeName === 'DIV') {
			console.log(questions[x].attributes);
			attribute = questions[x].firstElementChild.firstElementChild.attributes[0].value
			$('fieldset[aria-describedby*="' + attribute + '"] input:radio').on('change', function() {
				var value = $(this).val();
			});
		}*/
	}
	console.log(element.attributes)
}

//submits the new data to the google sheet that keeps track of progress
function submit(score, element) {
	//get the arguments for the URL
	var lesson, problem, possPoints, possTries = getQuestionInfo(element);
	var args = 'lesson:' + lesson + ',problem:' + problem + ',type:submit,possTries:' + possTries + ',possPoints:' + possPoints + ',score:' + score + '&password=' + PASSWORD;

	//submit the data
	$.ajax({
		url: 'https://script.google.com/macros/s/AKfycbyPdkk_VoJjlOolZChvmekYU70SHgDJy73Vn8PBDHR5Zl-UvuV9/exec?method=handleRequest&request=' + args,
		dataType: 'jsonp',
		success: function(data) {
			if (data[0] == 'E') {
				alert('Upload failed with "' + data + '"');
			}
		}
	});

	//TODO get a wrong answer notification to pop up

	//update the question UI to reflect the data
	updateFormat(element);
}