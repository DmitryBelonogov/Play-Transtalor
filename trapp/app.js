var express         = require('express');
var path            = require('path');
var fileUpload 		= require('express-fileupload');
var parseString 	= require('xml2js').parseString;
var xml2js 			= require('xml2js');
var translate 		= require('yandex-translate')('trnsl.1.1.20170227T233115Z.0f4f9203dd5961b8.093600007844ea36dcfb4d5b589a01f549ddaaaa');

var app = express();

app.use(fileUpload({
  limits: { fileSize: 500 * 1024 * 1024 },
}));

    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
    });


app.all('/upload', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.get('/', function(req, result) {
  //res.send('hello world');
  	translate.translate('You can burn my house, steal my car, drink my liquor from an old fruitjar.', { to: 'ru' }, function(err, res) {
	  result.send(res.text);
	});
});

app.post('/upload', function(req, res) {
	console.log(req.files);
	let sampleFile = req.files.sampleFile;

	var xml = sampleFile.data.toString('utf-8');

	parseString(xml, function (err, result) {
	    var resultXML = xml.toString('utf-8');
	    var resultJSON = {}
	    var key = 'Translates';
		resultJSON[key] = [];

	    getTranslate(resultXML, resultJSON, result.resources.string, 0, function(resultXml, resultJson) {

	console.log(JSON.stringify(resultJson));
		    //res.set('Content-Type', 'text/json');
		    //res.writeHead(200, { 'Content-Type': 'application/json' }); 
		    res.json(JSON.stringify(resultJson));
		    //res.end();
		    //res.send(JSON.stringify(resultJson));
		});
	    
	});
});

var getTranslate = function(resultXML, resultJSON, data, i, callback) {
	if(i < data.length) {
		translate.translate(data[i]._, { to: 'ru' }, function(err, res) {
	    	resultXML = resultXML.replace(data[i]._, res.text);

	    	var item = {
			    original: data[i]._,
			    translated: res.text
			};

			var key = 'Translates';
			resultJSON[key].push(item);

	    	data[i]._ = res.text;
	    	getTranslate(resultXML, resultJSON, data, i + 1, callback);
		});
	}
	else {
		if(typeof callback === "function") {
            callback(resultXML, resultJSON);
        }
	}
};


app.listen(80, function(){
    console.log('Express server listening on port 1337');
});