var fs = require("fs");
var url = require("url");
var path = require("path");
var rq = require("request");
var async = require("async");
var express = require('express');
var cheerio = require("cheerio");
var formidable = require('formidable');
var bodyParser = require('body-parser');
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
app.use(bodyParser.urlencoded({ extended: true,limit:'50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
http.listen(3000,function(){
	console.log("port 3000 listening");
});
io.on("connection",function(socket){
	app.get("/");
	app.post("/spider/:director",function(req,res){
		var director = req.params.director;
		var fields = req.body;
		var filedir = "public/links/"+director[parseInt(Math.random()*13)]+Math.ceil(new Date().getTime()*Math.random().toString()+new Date().getTime())+".txt";
		var filetypes = fields.filetypes.split(",");
		var depth = parseInt(fields.depth);//深度
		var counter = 0;//计步器
		var timescale = parseInt(fields.timescale);//并行爬取间隔
		var count = parseInt(fields.parallelnum);//并行数量控制
		var repositary = [];//存储所有的links
		var warehouse = [];//存储当前级别links
		var protocol = fields.start_url.split("://")[0];
		var operate_url = [fields.start_url];//操作当前级别的links
		var server_url = fields.server_url;//服务器根路径
		var options= {"filetypes":filetypes,"Duplicate_remove":true,"start_url":server_url,"hash":true,"query":true};

		function get_link(link,callback){
			console.log("正在爬取 : "+link);
			io.emit(director,"正在爬取 : "+link);	
			rq(link,function(error, response, body){
				// var reg = /^(http)/g;
				$ = cheerio.load(body);
			    for(var i = 0 ; i < $("a").length ; i++){
			    	if($("a")[i].attribs.href && $("a")[i].attribs.href.indexOf("mailto")==-1 && $("a")[i].attribs.href.indexOf("https")==-1)
			    	{

			    		// console.log(url.resolve(link,$("a")[i].attribs.href));
			    		var get_the_link = url.resolve(link,$("a")[i].attribs.href);
			    		// if(get_the_link.split("://")[0]==="http")
			    		// {
							var pathbody = get_the_link.split("://")[1];
							get_the_link = protocol+"://"+pathbody;
			    		// }
			    		// replace the http to https
			    		// get_the_link.replace(reg,"https");
			    		warehouse.push(get_the_link);
			    	}
			    }
			    setTimeout(function(){
			    	 callback(null,link);
			    	},timescale);
			});
		}

		// ---------------------------------------------------------------------
		// 排除数组中相同的项
		Array.prototype.unique = function(){
			var context = this;
			var res = [];
			var flag = false;
			for(var i = 0 ; i < context.length ; i++)
			{
				for(var j = 0 ; j < res.length ; j++)
				{
					if(context[i] === res[j] || context[i]+"/" === res[j] || context[i] === res[j]+"/")
					{
						flag = true;
						break;
					}
				}
				if(!flag)
				{
					res.push(context[i]);
				}
				else{
					flag = false;
				}
				// console.log(res);
			}
			return res;
		}
		// ---------------------------------------------------------------
		// 过滤器,过滤不想要的格式
		function filter(arr,options){

			var bufferArray = [];
			var array = [];
			if(options.Duplicate_remove == undefined || options.Duplicate_remove == "")
			{
				options.Duplicate_remove = true;
			}
			if(options.Duplicate_remove)
			{
				arr = arr.unique();
			}
			if(options.hash)
			{
				// var reg = /"#"/g;
				for(var i = 0 ; i < arr.length ; i++)
				{
					if(arr[i].indexOf("#")==-1)
					{
						array.push(arr[i]);
					}
				}
				arr = [];
				arr = array;
				array=[];
			}
			if(options.query)
			{
				var flag = true;
				var flag_index = true;
				var path = 0;
				// var reg = /\?/g;
				for(var i = 0 ; i < arr.length ; i++)
				{
					// console.log(arr[i].indexOf("?"));
					if(arr[i].indexOf("?")>-1)
					{
						path = arr[i].split("?")[0];//获得纯path
						if(path.indexOf("/index.html")>-1)
						{
							path = path.split("index.html")[0];
						}
						// console.log(path);
						for(var j = 0 ; j < arr.length ; j++)
						{
							if(path === arr[j] || path+"index.html" === arr[j])
							{
								flag = false;
								break;
							}
						}
						if(flag)
						{
							array.push(arr[i]);
						}
					}
					else{
						if(arr[i].indexOf("/index.html")>-1)
						{
							for(var m = 0 ; m < arr.length ; m++)
							{
								if(arr[i].split("index.html")[0] === arr[m])
								{
									flag_index = false;
									break;
								}
							}
							if(flag_index)
							{
								array.push(arr[i]);
							}
							flag_index = true;
						}
						else{
							array.push(arr[i]);
						}
						
					}
					flag = true;
				}
				arr = [];
				arr = array
			}

			if(options.filetypes == "" || options.filetypes == undefined)
			{
				return arr;
			}
			else{
				var str = "";
				var types = options.filetypes;
				str = types.join("|");
				var reg = new RegExp("("+ str +")$");
				for(var i = 0 ; i < arr.length ; i++)
				{
					if(!reg.test(arr[i])&&arr[i].indexOf(options.start_url)>-1)
					{
						bufferArray.push(arr[i]);
					}
				}
				return bufferArray;
			}
		}
		// ----------------------------------------------------------------------
		// 将数组中的数据写入目标文件objFile中 txt文件
		function dataToFile(arr,objFile){
			for(var i = 0 ; i < arr.length ; i++)
			{
				fs.appendFileSync(objFile, `${arr[i]}\n`);
			}
		}
		function operate(operate_url){
			async.mapLimit(operate_url,count,function(url,callback){get_link(url,callback)}
			,function(err,result){
				// console.log(warehouse);
				warehouse = filter(warehouse,options);
				repositary = repositary.concat(warehouse);
				// console.log(repositary);
				operate_url = [];
				operate_url = warehouse;
				warehouse = [];
				counter++;
				if(counter>=depth)
				{
					repositary = filter(repositary,options);
					dataToFile(repositary,filedir);
					console.log("爬取完毕");
					io.emit(director,"爬取完毕");
					res.send("<span id='loadfile'>"+ filedir +"</span>");
					return;
				}
				operate(operate_url);
			})
		}
		operate(operate_url);
	});
});









