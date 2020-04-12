const express = require('express');
const app = express();
const port = 1010;
var requestCount = 1;

var preProcessor = function(req, res, next){
	req.requestTime = new Date();
	next();
}
var postProcessor = function(req, res, next){
	console.log("Handled request no. "+requestCount);
	requestCount++;
}

app.use(preProcessor);

app.get("/", (req, res, next)=>{
							var content = "<h2>Hello World</h2><h3>"+req.requestTime+"</h3>";
							res.send(content);
							next();
						}
		);

app.use(postProcessor);

app.listen(port, ()=>console.log("Time server listening on port: "+port));

