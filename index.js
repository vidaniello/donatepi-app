var express = require('express');
var serveStatic = require('serve-static');
 
var app = express();
 
app.use(serveStatic('public', { 'index': ['index.html'] }));
app.listen(process.env.PORT,()=>{
  console.log("done");
});