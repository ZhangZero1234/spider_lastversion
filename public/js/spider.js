~(function($){
	$.fn.spider = function(option){
		var wrap = $(this);
		var socket = io();
		var director = Math.ceil(new Date().getTime()*Math.random().toString()+new Date().getTime());
		var formbody = `<form id="formarea" action="" method="post" target="iframedata">
		<p><label for="start_url"><span class="label_name">网址</span> : <input type="text" name="start_url" id="start_url"></label></p>
		<p><label for="server_url"><span class="label_name">服务器根</span> : <input type="text" name="server_url" id="server_url"></label></p>
		<p><label for="depth"><span class="label_name">深度</span> : <input type="text" name="depth" id="depth"></label></p>
		<p><label for="parallelnum"><span class="label_name">并行数量</span> : <input type="text" name="parallelnum" id="parallelnum"></label></p>
		<p><label for="timescale"><span class="label_name">并行间隔(ms)</span> : <input type="text" name="timescale" id="timescale"></label></p>
		<p><span class="label_name">过滤文件</span> :</p>
		<div id="filetypes">
		   <label for="checkall">全选<input type="checkbox" name="checkall" value="checkall" id="checkall"></label>
		   <span id="checkarea">
			   	<label for="pdf">.pdf<input type="checkbox" name=".pdf" value=".pdf" id="pdf"></label>
			    <label for="mp3">.mp3<input type="checkbox" name=".mp3" value=".mp3" id="mp3"></label>
			    <label for="zip">.zip<input type="checkbox" name=".zip" value=".zip" id="zip"></label>
			    <label for="gif">.gif<input type="checkbox" name=".gif" value=".gif" id="gif"></label>
			    <label for="jpg">.jpg<input type="checkbox" name=".jpg" value=".jpg" id="jpg"></label>
			    <label for="xml">.xml<input type="checkbox" name=".xml" value=".xml" id="xml"></label>
			    <label for="ods">.ods<input type="checkbox" name=".ods" value=".ods" id="ods"></label>
			    <label for="xls">.xls<input type="checkbox" name=".xls" value=".xls" id="xls"></label>
			    <label for="png">.png<input type="checkbox" name=".png" value=".png" id="png"></label>
			    <label for="jpeg">.jpeg<input type="checkbox" name=".jpeg" value=".jpeg" id="jpeg"></label>
			    <label for="doc">.doc<input type="checkbox" name=".doc" value=".doc" id="doc"></label>
			    <label for="psd">.psd<input type="checkbox" name=".psd" value=".psd" id="psd"></label>
		   </span> 
		</div>
		<input type="hidden" name="filetypes" id="ft" value="">
		<p><input id="fsubmit" type="button" value="提交"></p>
		<input id="tsubmit" type="submit">
		</form>
		<p><strong>Seven 友情提示 : </strong>为了保证爬取的顺利进行,请保证并行数量(10以内推荐)和并行间隔(1s推荐) 合理</p>
		<div id="datalist">爬取进度 : <span id="datadetail"></span></div>
		<div id="download">
			<a href="" download>下载数据文件</a>
		</div>`;

		wrap.html($(formbody));

		$("#checkall").change(function(){
			$("#checkarea input[type='checkbox']").attr("checked",this.checked);
		});

		$("#fsubmit").click(function(){
			$("#datadetail").text("");
			$(this).attr("disabled",true);
			
			$("#formarea").attr("action","/spider"+"/"+director);
			var checked = $("#checkarea :checkbox:checked");
			var arr = [];
			var str = "";
			$.each(checked,function(item){
				arr.push($(this).attr("name"));
			})
			str = arr.toString();
			$("#ft").val(str);
			$("#tsubmit").click();
		});
		$("#download a").click(function(){
			$("#download").slideUp();
		});
		socket.on(director,function(msg){
			$("#datadetail").html(msg);
			if($("#datadetail").text() == "爬取完毕")
			{
				var timer;
				(function(callback){
					timer = setInterval(callback,200);
				})(function(){
					$.get("/adress",function(address){
						console.log(address);
						if(address)
						{
							clearInterval(timer);
							var loadfileurl = address.split("/links/")[1];
							$("#download a").attr("href","links/"+loadfileurl);
							$("#download").slideDown(function(){
								$("#fsubmit").attr("disabled",false);
							});
						}
					});
				})
			}
		});
	}
})(jQuery)