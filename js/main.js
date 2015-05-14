Zepto(function($){
	var show_left   = false,
		shown_right = false;
	$(".roundNav").on("click",function(){
		show_left = !show_left;
		$(this).toggleClass("open");
		$("#left_side").toggleClass("shown");
		$("#main,header").toggleClass("show_left");		
	});
	$("#user_btn").on("click",function(){
		shown_right = !shown_right;
		$(this).toggleClass("open");
		$("#right_side").toggleClass("shown");
		$("#main,header").toggleClass("show_right");		
	});
	/*拖动操作*/
	$("body").swipeEvents().on("swipeRight",function(){		
		if(shown_right){
			$("#user_btn").trigger("click");
			return;
		}
		if(!show_left){
			$(".roundNav").trigger("click");			
		}
	}).on("swipeLeft",function(){
		if(show_left)
		{
			$(".roundNav").trigger("click");
			return;
		}
		if(!shown_right){
			$("#user_btn").trigger("click");			
		}		
	});
	
	$(".content_list").on("click","li",function(event){
		var post = {};
		post.postId = $(this).prop("id").split("_")[1];
		post.postTitle = $(this).find("h3").text();
		post.postMeta = $(this).find(".listMeta");
		showPost(post);
		event.preventDefault();
	});
	$("#back_btn").on("click",function(event){
		closeDetail();
		event.preventDefault();
	});
	$(window).on("scroll",onListScroll);
	
});

var pager = {
	postPerPage:10,
	page:1,
	totalPage:1	
},
config = {
	disSet:20
},
curPost ={
	
};

function showPost(post)
{
	$("#main,header,#details,#detail_header").addClass("showDetail");
	$("#detail_title").text(post.postTitle);
	$("#details .listMeta").html(post.postMeta.html());
	$("#detail_co").html("");
	$.ajax({
		type:"get",
		dataType:"json",
		url:"http://www.iguoguo.net/m",
		data:{'id':post.postId,'action':'ajaxPageLoad'},
		async:true,
		success:function(data){
			parsePostDetail(data).appendTo("#detail_co");
			$('.detail_toolbar').data("id",post.postId);
			$("#likes").html(data.likes);
			if(data.web_url&&data.is_site){
				$("#visit_btn").prop("href",data.web_url).show();
			}
			if(data.web_url2&&data.is_ui)
			{
				$("#download_btn").prop("href",data.web_url2).show();
			}
			$("#comment_btn").show().find("#comments").html(data.comments);
		}
	});
	
}

function closeDetail(){
	$("#main,header,#details,#detail_header").removeClass("showDetail");
}
//加载新的列表内容
function loadNewList(page){
		$.ajax({
				type:"get",
				dataType:"json",
				url:"http://www.iguoguo.net/m",
				data:{'paged':page,'action':'ajaxPageLoad'},
				async:true,
				success:function(datas){
					var newElements = "";
					$.parseJSON(datas).each(function(data){
						newElements += parsePost(data);
					});
					$(newElements).appendTo(".content_list");
					pager.page = page;
				}
			});
	}

//文章列表中内容解析成HTML
function parsePost(data)
{
	var postHtml = '<li class="clearfix"  id="post_'+data["id"]+'">'+
		'<div class="imgBox">'+
			'<a href="?id='+data["id"]+'" title="'+data["title"]+'" target="_blank">'+
				'<img src="'+data["pic"]+'" title="'+data["title"]+'" >	'+				
			'</a>'+
		'</div>'+
		'<h3>'+data["title"]+'</h3>'+
		'<div class="listMeta">'+
			'<i class="iconfont">&#xe65f;</i>'+
			'<span>'+data["date"]+'</span>'+
			'<i class="iconfont">&#xe7e6;</i>'+
			'<span>'+data["views"]+'</span>'+
		'</div>'+
	'</li>';
	return postHtml;
}
//解析文章详情页
function parsePostDetail(data){
	var detailHtml = "";
	data = $.parseJSON(data);
	if(data.tags.length>0){
		detailHtml+='<div id="tags">';
		$.each(data.tags, function(tag){
			detailHtml+='<a href="tag_"'+tag+'>'+tag+'</a>';
		});
		detailHtml+='</div>';
	}
	if(data.cats.length>0){
		detailHtml+='<div id="cats">';
		$.each(data.cats, function(cat){
			detailHtml+='<a href="cat_"'+cat+'>'+cat+'</a>';
		});
		detailHtml+='</div>';
	}
	if(data.author&&data.author!="")
	{
		detailHtml+='<div id="author">'+data.author+'</div>';
	}
	detailHtml+='<div id="post_content">'+data.content+'</div>';
	
	return $(detailHtml);
}


function onListScroll()
{		
	var curTop = $(window).scrollTop();
	console.warn(curTop);
	if(curTop>=$(document).height()-$(window).height()-config.disSet)
	{
		loadNewData(pager.page+1);
		$(window).off("scroll",onListScroll);
	}
}
