function show2(){
	$.ajax({
		url : "show2",
		data : null,
		type : "get",
		dataType : "json",

		success:
		function(res){
			var content = '<ul class="nav">';
			for(var i=0;i<res.length;i++){
				content += '<li> name : ';
				content += res[i].name;
				content += ', password : ';
				content += res[i].password;
				content += '</li>';
			}
			content += '</ul>';
			$("#home-list").html(content);
		},
		error:
		function(xhr,option,error){
			alert('error');
			alert(xhr.status);
			alert(error);
		}
	});
};
