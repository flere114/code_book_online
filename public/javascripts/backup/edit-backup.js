var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("codeArea"), {
   	mode: 'text/x-c++src',
	theme: 'solarized light',
	keyMap: 'sublime',
	placeholder: 'Code goes here...',
	// line settings
	lineNumbers: true,
	lineWrapping: true,
	styleActiveLine: true,
	// indent settings
	indentUnit: 4,
	indentWithTabs: true,
	matchBrackets: true,
	autoCloseBrackets: true,
	showCursorWhenSelecting: true
});

$(window).bind('beforeunload',function(){
	if (myCodeMirror.getValue() !== "" && !myCodeMirror.getOption("readOnly")) {
		return "尚未存檔 你確定要放棄編輯?";
	}
});

$('form').submit(function() {
    $(window).unbind('beforeunload');
});

function fullscreen() {
	$("#treePanel").css('display', 'none');
	$("#container").css('width', '100%');
	$("#bodyPanel").css('width', '100%');
	$("#screenButton").html("<span class='glyphicon glyphicon-resize-small' aria-hidden='true'></span>");
	$("#screenButton").attr("onclick", "smallscreen()");
	$("#buttonArea").css('display', 'none');
};

function smallscreen() {
	$("#treePanel").css('display', '');
	$("#container").css('width', '');
	$("#bodyPanel").css('width', '');
	$("#screenButton").html("<span class='glyphicon glyphicon-resize-full' aria-hidden='true'></span>");
	$("#screenButton").attr("onclick", "fullscreen()");
	$("#buttonArea").css('display', '');
};

function chooseCode(data) {
	if (myCodeMirror.getValue() !== "" && !myCodeMirror.getOption("readOnly")) {
		if (!confirm("尚未存檔 你確定要放棄編輯?"))
			return;
	}
	getFile(data);
	$("#now_id").html(data);
};

function editButton() {
	myCodeMirror.setOption("readOnly", false);
	$("#editor input[name='Submit']").attr("disabled", false);
};

function getFile(data) {
	var code_id = data;
	$.ajax({
		type : "post",
		url : "/getCode",
		dataType : "json",
		contentType : "application/json; charset=UTF-8",
		data : JSON.stringify({code_id : data})
	}).done(function(data) {
		$("#codeName").attr("value", data.name);
		myCodeMirror.setValue(data.code);
		myCodeMirror.setOption("mode", data.mode);
		myCodeMirror.setOption("readOnly", true);
		$("#editor").attr("action", "/updateCode");
		$("#editor").append("<input type='hidden' name='code_id' value='" + code_id + "'>");
		$("#codeType").val(data.type);
		$("#editor input[name='Submit']").attr("disabled", true);
	});
};

$("#codeType").change(function() {
	switch ($("#codeType").val()) {
		case "1" :
			myCodeMirror.setOption("mode", "text/x-c++src");
			break;
		case "2" :
			myCodeMirror.setOption("mode", "text/x-java");
			break;
		case "3" :
			myCodeMirror.setOption("mode", "text/x-python");
			break;
		default :
			myCodeMirror.setOption("mode", "text/x-c++src");
	}
});
