PASSWORD = 'INSERT_A_PASSWORD';

//setup
buttons = document.getElementsByClassName('submit btn-brand');
for (var x = 0; x < buttons.length; x++) {
	buttons[x].disabled = false;
	updateFormat(buttons[x]);
	buttons[x].onclick = function(event) {
		check(event);
	};
}

//TODO this
//get info about a question that is needed for lcoating it in the sheet
function getQuestionInfo(element) {
	return lesson, problem, possPoints, possTries
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
				element.disabled = true;
				//TODO add tries and score info
			}
		}
	});
}

//when submit is clicked, this compares your answer to the correct answer and runs submit().
function check(event) {
	//find the code for the answer URL
	problemCode = event.path[5].id.split('_')[1];
	//sometimes the code can't be found for whatever reason
	//so I just reload in those cases as this isn't production grade
	if (problemCode === undefined) {
		alert('Could not find problem code. Refreshing now.')
		location.reload()
	}

	//get the answer
	$.get('https://courses.edx.org/courses/course-v1:RiceX+AdvCAL.1x+2015_T3/xblock/block-v1:RiceX+AdvCAL.1x+2015_T3+type@problem+block@' + problemCode + '/handler/xmodule_handler/problem_show',	
	function(data) {
		console.log(data.answers);
	});
	//TODO make eval work for multiple questions in one submit
	submit(score, event.srcElement.parentElement);
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
				alert('Upload failed with "' + data + '"')
			}
		}
	});

	//update the question UI to reflect the data
	updateFormat(element);
}