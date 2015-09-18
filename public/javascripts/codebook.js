
$(document).ready(function(){
	$("#browser").treeview();
	$("#f" + $("#now_id").text()).addClass("treeItemSelected");
});

function addSection() {
	var sectionName = $("#sectionName").val();
	$("#sectionName").val("");
	if (sectionName == "" || sectionName == null || $("#"+sectionName).length) {
		return;
	}

	$("#section").append("<li class='col-md-12' id='" + sectionName + "' >"
		+"<span>"+sectionName+"</span>"
		+"<button type='button' class='btn btn-danger btn-xs btn-lg pull-right' onclick='removeSection(\""+sectionName+"\")'><span class='glyphicon glyphicon-remove'></span></button>"
		+"<ul class='code'></ul></li>");
	$("#codeType").append("<option value='" + sectionName + "'>" + sectionName + "</option>");
};

function removeSection(tag) {
	if (confirm("Are you sure?")) {
		$("#codeType option[value='"+tag+"']").remove();
		$("#"+tag).remove();
	}
}

function removeCode(tag) {
	if (confirm("Are you sure?")) {
		$(tag).remove();
	}
};

function addCode() {
	var sectionName = $("#codeType").val();

	$("input[type='checkbox']").each(function() {
		if (this.checked) {
			$(this).attr('checked', false);
			if ($("#"+sectionName+" .code"+" ."+$(this).val()).length) {
				return;
			}

			$("#"+sectionName + " .code").append("<li class='"+$(this).val()+"'>"
				+"<span>"+$(this).next().html()+"</span>"
				+"<button type='button' class='btn btn-danger btn-xs btn-lg pull-right' onclick='removeCode(\"#"+sectionName+" .code"+" ."+$(this).val()+"\")'>"
				+"<span class='glyphicon glyphicon-remove'></span></button></li>");
		}
	});
};

$(window).bind('beforeunload',function(){
	if ($("#section").html() !== "") {
		return "尚未存檔 你確定要放棄編輯?";
	}
});

function createCodebook() {
	var cbName = $("#codebookName").val();
	if (cbName == "" || cbName == null) {
		return;
	}
	$(window).unbind('beforeunload');

	var section = $("#codeType option").toArray();

	var sectionArray = [];
	for (var i = 0; i < section.length; i++) {
		var name = section[i].value;
		var code = $("#"+name+" .code li").toArray();
		var codeArray = [];
		for (var j = 0; j < code.length; j++) {
			codeArray.push(code[j].className);
		}
		sectionArray.push({"Name": name, "Code": codeArray});
	}

	var Codebook = {"CodebookName": cbName, "Content": sectionArray};

	$.ajax({
		type : "post",
		url : "/createCodebook",
		dataType : "json",
		contentType : "application/json; charset=UTF-8",
		data : JSON.stringify(Codebook)
	}).always(function(){
		location.reload(true);
//		$("#codebookName").val("");
//		$("#section").html("");
//		$("#codeType").html("");
	});
};

function getObjects(data) {
	var preID = $("#now_id").text();
	$("#f" + preID).removeClass("treeItemSelected");
	$("#f" + data).addClass("treeItemSelected");
	$("#now_id").html(data);

	$.ajax({
		type : "post",
		url : "/getObjects",
		dataType : "json",
		contentType : "application/json; charset=UTF-8",
		data : JSON.stringify({parent_id : data})
	}).done(function(res) {
		var data = JSON.parse(res);
		
		var panelHtml = "<table>";
		for (var i = 0; i < data.length; i++) {
			if (data[i].type !== 0 && data[i].type !== 100 ) {
				//panelHtml += "id: " + data[i].id + ", name: " + data[i].name + ", type: " + data[i].type + "<br/>";
				panelHtml += "<tr><td><div class='checkbox'>";
				panelHtml += "<label><input type='checkbox' value='" + data[i].id + "'><p>" + data[i].name + "</p></label>";
				panelHtml += "</div></td></tr>";
			}
		}
		panelHtml += "</table>";
		$("#panel").html(panelHtml);
	});
}
