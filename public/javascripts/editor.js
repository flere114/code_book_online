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
	$("#container").css('width', '100%');//.removeClass("container");
	$("#bodyPanel").css('width', '100%');//.removeClass("col-md-10");
	$("#screenButton").html("<span class='glyphicon glyphicon-resize-small' aria-hidden='true'></span>");
	$("#screenButton").attr("onclick", "smallscreen()");
	$("#buttonArea").css('display', 'none');
	$("#editor").css('height', '100%');
};

function smallscreen() {
	$("#treePanel").css('display', '');
	$("#container").css('width', '');
	$("#bodyPanel").css('width', '');
	$("#screenButton").html("<span class='glyphicon glyphicon-resize-full' aria-hidden='true'></span>");
	$("#screenButton").attr("onclick", "fullscreen()");
	$("#buttonArea").css('display', '');
	$("#editor").css('height', '90%');
};

function chooseCode(data) {
	if (myCodeMirror.getValue() !== "" && !myCodeMirror.getOption("readOnly")) {
		if (!confirm("尚未存檔 你確定要放棄編輯?"))
			return;
	}
	getFile(data);
	var preID = $("#now_id").text();
	$("#f"+preID).removeClass("treeItemSelected");
	$("#f"+data).addClass("treeItemSelected");

//	if($("#cut_id").text() == ""){
		$("#buttonArea input[name='Create']").attr("disabled","disabled");
		$("#buttonArea input[name='Paste']").attr("disabled","disabled");
		$("#buttonArea input[name='Delete']").removeAttr("disabled");
		$("#buttonArea input[name='Cut']").removeAttr("disabled");
		$("#buttonArea input[name='Download']").removeAttr("disabled");
		$("#buttonArea input[name='Edit']").removeAttr("disabled");
		$("#buttonArea input[name='Rename']").removeAttr("disabled");
/*	}else{
		$("#buttonArea input[name='Create']").attr("disabled","disabled");
		$("#buttonArea input[name='Rename']").attr("disabled","disabled");
		$("#buttonArea input[name='Delete']").attr("disabled","disabled");
		$("#buttonArea input[name='Cut']").attr("disabled","disabled");
		$("#buttonArea input[name='Paste']").attr("disabled","disabled");
		$("#buttonArea input[name='Download']").attr("disabled","disabled");
		$("#buttonArea input[name='Edit']").attr("disabled","disabled");
	}
*/
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
		$("#codeName").val(data.name);
		myCodeMirror.setValue(data.code);
		myCodeMirror.setOption("mode", data.mode);
		myCodeMirror.setOption("readOnly", true);
		$("#editor").attr("action", "/updateCode");
		$("#parent_code_ID").val(code_id);
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
