var rq = require("request");
var cheerio = require("cheerio");
var url = require("url");
myURL = url.parse('https://www-03.ibm.com/press/');
// console.log(myURL.host)
var options = {
  url: 'https://ibv.dst.ibm.com/',
  headers: {
    'User-Agent': "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Mobile Safari/537.36"
  }
};
try{
	rq("http://www-03.ibm.com/press/us/en/pressrelease/40730.wss&title=City of Bunbury selects IBM PureSystems for government cloud&summary=Australian city of Bunbury delivers local Government private cloud computing with IBM PureSystems",function(error, response, body){
				// var reg = /^(http)/g;
				if(response)
				{
					console.log(response.statusCode);
				}
				
			})
}
catch(e)
{}


