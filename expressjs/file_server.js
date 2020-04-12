const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = "1010";
const UPLOAD_DEST = 'uploads';	
const mltr = multer({dest: UPLOAD_DEST});
const singleFileUploader = mltr.single('file');
const multiFileUploader = mltr.array('file', 5);

var fileUploader = function(req, res){
	singleFileUploader(req, res, uploadCallback);
	
	function fileRenameSuccessCb(err){
		if(err){
			res.status(500).send("Upload failed: Failed to rename to "+req.file.originalname);
		} else {
			res.status(200).send("Upload success")
		}
	}
	
	function uploadCallback(err){
		if(err){
			res.status(400).send("Upload failed: "+err.message);
		}else if(req.file){
			var oldFilePath = __dirname+path.sep+req.file.path;
			var newFilePath = path.dirname(oldFilePath)+path.sep+req.file.originalname;
			//console.log("old file path: "+oldFilePath);
			//console.log("new file path: "+newFilePath);
			fs.rename(oldFilePath, newFilePath, fileRenameSuccessCb);
		}else{
			res.status(400).send("Cannot read file to upload. Upload a file again");
		}
	}
}

var filesUploader = function(req, res){
	multiFileUploader(req, res, uploadCallback);
	var response = {};
	
	function uploadCallback(err){
		if(err){
			res.status(400).send("Upload failed: "+err.message);
		}else if(req.files && req.files.length > 0){
			req.files.forEach(file => {
				var oldFilePath = __dirname+path.sep+file.path;
				var newFilePath = path.dirname(oldFilePath)+path.sep+file.originalname;
				//console.log("old file path: "+oldFilePath);
				//console.log("new file path: "+newFilePath);
				try{
					fs.renameSync(oldFilePath, newFilePath);
					response[file.originalname] = "Success";
				}catch(err){
					response[file.originalname] = "Failed";
				}
			});
			res.status(200).json(response);
		}else{
			res.status(400).send("Cannot read files to upload. Upload a files again");
		}
	}
}

var listFiles = function(req, res){
	try{
		var files = fs.readdirSync(UPLOAD_DEST);
		res.json(files);
	}catch(err){
		res.status(500).send(err.message);
	}
}

var downloadFile = function(req, res){
	var filename = req.query.file;
	if((filename = req.query.file) || (filename = req.params.file)){
		download(res, filename);
	}else{
		res.status(400).send("Unable to get the filename to be downloaded");
	}
}

var download = function(res, filename){
	if(filename){
		res.download(UPLOAD_DEST+path.sep+filename, filename, downloadError);
		//res.sendFile(filename, {root:UPLOAD_DEST});
	}else{
		res.status(400).send("Unable to get the filename to be downloaded");
	}
	
	function downloadError(err){
		if(!res.headersSent){
			if(err)
				res.status(404).send("Unable to find file "+filename);
		}
	}
}

app.post("/uploadFile", fileUploader);
app.post("/uploadFiles", filesUploader);
app.get("/list", listFiles);
app.get("/downloadFile", downloadFile);
app.get("/download/:file", downloadFile);

app.listen(PORT, ()=>console.log("File Upload server listening on port: "+PORT));