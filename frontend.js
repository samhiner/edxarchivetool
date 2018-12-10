//setup
buttons = document.getElementsByClassName('submit btn-brand');
for (var x = 0; x < buttons.length; x++) {
	buttons[x].disabled = false;
	button = buttons[x];
	buttons[x].onclick = function(button) {
		check(button);
	};
}

//when submit is clicked, your answer is compared to the correct answer.
function check(element) {
	problemCode = element.path[5].id.split('_')[1];
	$.get('https://courses.edx.org/courses/course-v1:RiceX+AdvCAL.1x+2015_T3/xblock/block-v1:RiceX+AdvCAL.1x+2015_T3+type@problem+block@' + problemCode + '/handler/xmodule_handler/problem_show',	
	function(data) {
		console.log(data.answers);
	});
}

//for later
//HtmlService.handleRequest(requestInfo)