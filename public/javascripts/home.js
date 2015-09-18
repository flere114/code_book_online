
$(document).ready(function(){
	$("#browser").treeview();
	$("#buttonArea input[name='Paste']").attr("disabled","disabled");
	$("#buttonArea input[name='Download']").attr("disabled","disabled");
	$("#buttonArea input[name='Edit']").attr("disabled","disabled");
	$("#f" + $("#now_id").text()).addClass("treeItemSelected");
});
/*function getObjects(data) {
	var parent_id = data;
	$.ajax({
		type : "post",
		url : "/getObjects",
		dataType : "json",
		contentType : "application/json; charset=UTF-8",
		data : JSON.stringify({"parent_id" : data})
	}).done(function(res) {
		var data = JSON.parse(res);
		
		var panelHtml = "<div id='now_id' style='display:none;'>"+parent_id+"</div>";
		for (var i = 0; i < data.length; i++) {
			panelHtml += "id: " + data[i].id + ", name: " + data[i].name + ", type: " + data[i].type + "<br/>";
		}
		$("#panel").html(panelHtml);
	});
};
*/

function chooseFolder(data) {
	if (myCodeMirror.getValue() !== "" && !myCodeMirror.getOption("readOnly")) {
		if (!confirm("尚未存檔 你確定要放棄編輯?"))
			return;
	}
	var preID = $("#now_id").text();
	$("#f"+preID).removeClass("treeItemSelected");
	$("#f"+data).addClass("treeItemSelected");

		$("#buttonArea input[name='Download']").attr("disabled","disabled");
		$("#buttonArea input[name='Edit']").attr("disabled","disabled");
		if($("#cut_id").text() == "")
			$("#buttonArea input[name='Paste']").attr("disabled","disabled");
		else
			$("#buttonArea input[name='Paste']").removeAttr("disabled");
		$("#buttonArea input[name='Create']").removeAttr("disabled");
		$("#buttonArea input[name='Rename']").removeAttr("disabled");
		$("#buttonArea input[name='Delete']").removeAttr("disabled");
		$("#buttonArea input[name='Cut']").removeAttr("disabled");
	$("#now_id").html(data);
	$("#parent_code_ID").val(data);
	$("#codeName").val("");
	myCodeMirror.setValue("");
	myCodeMirror.setOption("mode", "text/x-c++src");
	myCodeMirror.setOption("readOnly", false);
	$("#editor").attr("action", "/createCode");
	$("#codeType").val(1);
	$("#editor input[name='Submit']").attr("disabled", false);
};

function choosePDF(data) {
	if (myCodeMirror.getValue() !== "" && !myCodeMirror.getOption("readOnly")) {
		if (!confirm("尚未存檔 你確定要放棄編輯?"))
			return;
	}
	var preID = $("#now_id").text();
	$("#f"+preID).removeClass("treeItemSelected");
	$("#f"+data).addClass("treeItemSelected");

		$("#buttonArea input[name='Create']").attr("disabled","disabled");
		$("#buttonArea input[name='Paste']").attr("disabled","disabled");
		$("#buttonArea input[name='Edit']").attr("disabled","disabled");
		$("#buttonArea input[name='Delete']").removeAttr("disabled");
		$("#buttonArea input[name='Cut']").removeAttr("disabled");
		$("#buttonArea input[name='Download']").removeAttr("disabled");
		$("#buttonArea input[name='Rename']").removeAttr("disabled");
	$("#now_id").html(data);
	$("#parent_code_ID").val("");
	$("#codeName").val("");
	myCodeMirror.setValue("");
	myCodeMirror.setOption("readOnly", true);
	$("#editor input[name='Submit']").attr("disabled", true);
};

function downloadButton() {
	downloadFile($("#now_id").html());
};

function downloadFile(code_id) {
	if (confirm("確定要下載到本地端?")) {
		$('<form action="/downloadFile" method="POST">'
			+ '<input type="hidden" name="code_id" value="' + code_id+ '">'
			+ '</form>').submit();
	}
};

function createFolder() {
	var name = prompt("Please enter folder name", "");	//get folder name
	if (name == null || name == "" || name.length > 30){
		alert('Please enter a valid name. (length 1~30)');
		return;
	}
	var parent_id = $("#now_id").html();				//get parent id
	$.ajax({
		type : "post",
		url : "/createFolder",
//		dataType : "json",
		contentType : "application/json; charset=UTF-8",
		data : JSON.stringify({"folderName" : name, "parent_id" : parent_id}),
		success : function(result,stat,xhr){
			if(xhr.status == 200){
				$("#treePanel").html(result.rebuildHTML);
				$("#browser").treeview();
				$("#f" + $("#now_id").text()).addClass("treeItemSelected");
			}else{
				alert('Bad Request!');
			}
		},
		error : function(xhr,stat,error){
			alert('xhr = ' + xhr.result + ', stat = ' + stat + ', error = ' + error);
			location.reload(true);			
		}
	});
};

function removeObject() {
	var nowID = $("#now_id").text();
	var rootID = $("#root_id").text();
	if(nowID == rootID){
		alert('/root 為萬物之神，無法刪除！');
	}else{
		if (!confirm("你確定要刪除該檔案?")) {
			return;
		}
		var code_id = $("#now_id").html();		//get Object code.id
		$.ajax({
			type : "post",
			url : "/removeObject",
//			dataType : "json",
			contentType : "application/json; charset=UTF-8",
			data : JSON.stringify({"code_id" : code_id}),
			success : function(result,stat,xhr){
				if(xhr.status == 200){
					$("#treePanel").html(result.rebuildHTML);
					$("#browser").treeview();
					$("#now_id").text($("#root_id").text());
					$("#f" + $("#now_id").text()).addClass("treeItemSelected");
				}else{
					alert('Bad Request!');
				}
			},
			error : function(xhr,stat,error){
				alert('xhr = ' + xhr.result + ', stat = ' + stat + ', error = ' + error);
			}
		});
	}
};

function updateName() {
	var nowID = $("#now_id").text();
	var rootID = $("#root_id").text();
	if(nowID == rootID){
		alert('/root 生下來就這名字，不可改名！');
	}else{
		var name = prompt("Please enter new name", "");	//get folder name
		if (name == null || name == "" || name.length > 30){
			alert('Please enter a valid name. (length 1~30)');
			return;
		}
		var code_id = $("#now_id").html();		//get Object code.id
		$.ajax({
			type : "post",
			url : "/updateName",
//			dataType : "json",
			contentType : "application/json; charset=UTF-8",
			data : JSON.stringify({"name" : name, "code_id" : code_id}),
			success : function(result,stat,xhr){
				if(xhr.status == 200){
					$("#f"+nowID).text(name);
				}else{
					alert('Bad Request!');
				}
			},
			error : function(xhr,stat,error){
				alert('Ajax Error!');
			}
		});
	}
};

function cutFile() {
	var nowID = $("#now_id").text();
	var rootID = $("#root_id").text();
	if(nowID == rootID){
		alert('/root 為萬物之源，不可剪下！');
	}else{
		var preID = $("#cut_id").text();
		if(preID != "")
			$("#f"+preID).removeClass("treeItemCutted");
			
		$("#f"+nowID).removeClass("treeItemSelected");
		$("#f"+nowID).addClass("treeItemCutted");
		
		$("#cut_id").text(nowID);
		$("#buttonArea input[name='Paste']").removeAttr("disabled");
	}
}

function updatePath() {
	var parent_id = $("#now_id").text();
	var code_id = $("#cut_id").text();
	$.ajax({
		type : "post",
		url : "/updatePath",
		dataType : "json",
		contentType : "application/json; charset=UTF-8",
		data : JSON.stringify({"parent_id" : parent_id, "code_id" : code_id}),
		success : function(result,stat,xhr){
			if(xhr.status == 200){
				$("#treePanel").html(result.rebuildHTML);
				$("#browser").treeview();
				$("#f" + $("#now_id").text()).addClass("treeItemSelected");
			}else{
				alert('Bad Request!');
			}
		},
		error : function(xhr,stat,error){
			alert('xhr = ' + xhr.result + ', stat = ' + stat + ', error = ' + error);
		}
	});
};

