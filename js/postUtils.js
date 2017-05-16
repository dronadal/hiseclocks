var contid;
var imgname;
var conttype;
var CONTID;
var startModal = $("#myModal .modal-body").html();
var alerts = [ 
	{
	"message" : "Post Saved!",
	"type" : "alert-success",	
	"name" : "save_success"
	},
	{
	"message" : "Post Published!",
	"type" : "alert-success",	
	"name" : "publish_success"
	},
	{
	"message" : "Error Saving post! Email jackconsidine3@gmail.com with details to fix",
	"type" : "alert-danger",
	"name" : "save_error"	
	},
	{
	"message" : "Error publishing post! Email jackconsidine3@gmail.com with details to fix",
	"type" : "alert-danger",
	"name" : "publish_error"		
	},
	{
	"message" : "Nothing changed!",
	"type" : "alert-info",
	"name" : "nothing_changed"		
	}

];

function nextStep (contentid, imagesrc) {
	$("#step1").remove();

     var imgSrc = "/uploads/images/" + imagesrc;
     var contentid = contentid;
     $("#step1").remove();
     $.getScript('/javascripts/image-render.js', function () {
     	$.get("/admin/imgrend/data/" + conttype, function (resp) {
	      $('.myContainer').html(resp.html + $('.myContainer').html() );
	      $('.image-holder').css("background-image", imgSrc);
	      $('.myContainer').css("display", "block");
	      injectVars(resp.articleTypes, resp.orderArray, resp.classnames, resp.css, imgSrc, CONTID);
	    });
     });
}
$('#image-form').submit(function(e) {
      
       e.preventDefault();


       var title = "not-necessary";
     	var contentid = $("#contentId").val();
     $(this).ajaxSubmit({
	       data: {contentid: contentid},
	       contentType: 'application/json',
	       success: function(response){
	       	console.log("The contid is " + CONTID);
	        nextStep (CONTID, response.imgsrc);
	       }
	   });
	     return false;
});	


function showMessage (name) {
	$("#alerts div").addClass("gone");
	$("#" + name).removeClass("gone");

	setTimeout(function() {
        $("#" + name).addClass("gone");
    }, 3000);
}

function initAlerts () {
	var base = '<div id = "ALERT_NAME" class="gone alert alert-dismissable ALERT_TYPE" role="alert"> ALERT_MESSAGE </div>';
	var cont = "";
	for (var i=0; i<alerts.length; i++) {
		cont += base.replace("ALERT_TYPE", alerts[i]["type"]).replace("ALERT_MESSAGE", alerts[i]["message"]).replace("ALERT_NAME", alerts[i]["name"]);
	}
	$("#alerts").html(cont);
}


function setArticleType (publish) {
	content.frontpageStatus = $('.panel-body.pick-content-type input:checked').val();

	refreshContent(publish);
}

var editor;
var content = {};
function getContent(publish, cb) {
	var i  = document.getElementById('editor').innerHTML;
	var myRegexp = /<img src="data.*?"/g;
	var match; 
	var dat = {};
	dat["info"] = [];
	while ( match = myRegexp.exec(i) ) {
		dat["info"].push(match[0].replace("src=\"", "").replace(/\"$/, ""));
	}
	var delta = JSON.stringify(editor.getContents());
	$.ajax({ 
		type: "POST", 
		url : "/admin/savedataimg", 
		data: JSON.stringify(dat), 
		contentType: "application/json; charset=utf-8", 
		dataType: "json",
		success: function (data) {
			if (data.data.length != dat["info"].length) throw "Not all images saved ";
			dat["imgs"] = data.data;
			for (var j=0; j<dat["info"].length; j++) {	
				var replaced = dat["info"][j].replace("<img ", "");
				i = i.replace(replaced, "/uploads/emailImages/" + data.data[j]);
				delta = delta.replace(replaced, "/uploads/emailImages/" + data.data[j]);
			}
			content["text"] = delta;
			content["publish"] = publish;
 			content["author"] = $("#postAuthor").val();
			if (publish) {
				content["body"] = i.replace(/<input.*?>/, "").replace(/contenteditable=\".*?\"/, "");
			}
			console.log(publish + " IS publish");
			cb();
		}
	});

	return content;
}
function deletePost (id) {
	$.ajax ({
		type: "DELETE",
		url : "/admin/data/" + conttype + "/" + id,
		success : function (resp) {
			$("#" + id).remove();
			console.log(resp);
		}
	});
}
//HORRENDOUS workaround!
$('#titleInput').click(function () {
	setTimeout(function(){
            $("#titleInput").focus();},100);
	
});
function Callback(data)
     {
        alert(JSON.stringify(data));
     }
function initQuill () {
	var Font = Quill.import('formats/font');
	// We do not add Aref Ruqaa since it is the default
	Font.whitelist = ['mirza', 'roboto', 'oswald', 'comic sans ms'];
	Quill.register(Font, true);

	editor = new Quill('#editor', {
	modules: { toolbar: '#toolbar' },
	theme: 'snow'
	});
}
function loadFeaturedImage(id) {
	// get image based on id
	$('.publish-btn-sidebar').prop('disabled', false);
	content.imageId = id;
	console.log("from load, id is " + id);
	$.get("/featuredImage/" + id, function (resp) {
		contid = resp.contentid;
		featuredImageHelper(resp);
		
		refreshContent(false);
		// setFeaturedImage(id);
	});

}
function refreshContent (publish) {
	function cb () {
		content["published"] = publish;
		$.ajax ({
			url: '/admin/data/' + conttype + '/' + content._id,
			dataType: "json",
			contentType: "application/json; charset=utf-8",  
			type : 'PUT',
			data: JSON.stringify(content), 
			success : function(data) {
				console.log("FROM SUCCESS");
				// no request error, but already exists

				if (!data.success) {
					showMessage('nothing_changed');
					return;
				}
				publish ? showMessage("publish_success") : showMessage("save_success");
				
				
			},
			error : function (err) {
				console.log("FROM SUCCESS");
				try {
					publish ? showMessage("publish_error") : showMessage("save_error");
				} catch (err2) {
					//pass
					console.log(err2);
				}
			},
			complete : function () {
				console.log("done!");
				
				// setFeaturedImage(id);
			}

		});
	}
	getContent(publish, cb);
}
$("#title-input").keyup(function () {
	content.title = $(this).val();
	console.log(content);
});
// function called when featured image is saved
function setFeaturedImage(id) {
	$.get('/featuredImage/' + id, function (resp) {
		
		featuredImageHelper(resp);
		content.imageId = id;
		// refreshContent(false);
	});
}
function updatePosition () {
	nextStep(CONTID, imgname);
	$('#myModal').modal('show');

}

function featuredImageHelper (resp) {
	var htmlString = "<img style='width : 100%;' src='" + "/uploads/images/" + resp.imgname +"'>";
		htmlString += "<a class='btn btn-default panel-button' href='#myModal', data-toggle='modal'> Change Featured Image </a>";
		htmlString += "<button class='btn btn-default panel-button' type='button' onclick='updatePosition()'> Change Image Positioning </button>";
		$("#featured-image").html(htmlString);
	contid = resp._id 
	imgname = resp.imgname;
		
}
function initContentType(contType) {
	conttype = contType;
	console.log(conttype);
}
function fillEditContent (id) {

	var post = $.ajax({
		type: 'GET',
		url :  "/admin/data/" + conttype +  "/" + id, 

		success : function (resp, xhr, status) {

			var body = resp.text;

			if (resp[0].text) {
				editor.setContents(JSON.parse(resp[0].text));
			}
			console.log(resp[0]);
			if (resp[0].imageId) {
				
				setFeaturedImage(resp[0].imageId);
			}
			if (resp[0].title) {
				$("#title-input").val(resp[0].title);
			}
			if (resp[0].author) {
				$('#postAuthor').val(resp[0].author);
			}
			CONTID = resp[0]._id;
			content = resp[0];
		    var vis = content.featuredImage ? "block" : "none";

		    $(".featured-panel-wrapper").css("display", vis);

				// set check box
				
				$('#panel-form :checkbox')[0].checked = content.featuredImage;

				 $('.publish-btn-sidebar').prop('disabled', !content.featuredImage || !content.imageId);
			},
		complete : function (resp) {
			if (resp.status == 404) {
			$('body').html(resp.responseText);
			}
		}
		});
}

function resetModal () {
	// $('#myModal').modal('show');
	// // reset the modal to the beginning
	$("#myModal .modal-body").html(startModal);
}
$('#myModal').on('hidden.bs.modal', function () {
    resetModal();
});



$('#panel-form :checkbox').change(function() {  
    content.featuredImage = this.checked; 
    var vis = this.checked ? "block" : "none";
    $(".featured-panel-wrapper").css("display", vis);
    if (content.imageId)
    	$('.publish-btn-sidebar').prop('disabled', !this.checked);
    refreshContent(false);
});


$("#toolbar").css("display", "block");