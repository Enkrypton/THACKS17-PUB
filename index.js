var express = require('express');
var app = express();
var router = express.Router();
var gh=require("./githubCall.js")
var cache={}
app.use(express.static('static'))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/data',router.post('/', async function (req, res) {
	var rec={}
	var tags=req.query.tags.split(",")
	var sample=0;
	for (var i=0;i<tags.length;i++){
		sample+=await gh(tags[i],cache,rec)
	}
	sample/=tags.length
	var a = Object.keys(rec);
    //a.map(q=>((rec[q]/sample)>0.10)?(console.log(q),rec[q]=0):1)
    function compareFrequency(a, b) {
        return rec[b] - rec[a];
    }
    a.sort(compareFrequency);
    a = a.map(q => [q, rec[q]*100 / sample]);
	res.status(200).send(a)	
}));
app.listen(process.env.PORT || 3000);