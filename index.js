// const content = require('fs').readFileSync(__dirname + '/index.html', 'utf8');

var bodyParser = require('body-parser')
var express = require('express');
var app = express();
var port = 3000;
app.set('port', port);
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
app.use(bodyParser.json({limit: '50mb'}));
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const conn = mongoose.createConnection('mongodb://127.0.0.1/my_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
const Page = new Schema({
  id: {type: String},
  name: { type: String},
  url: { type: String },
  avatar: { type: String},
  
});
conn.model('PageModel', Page)
const PageModel = conn.model('PageModel');
  PageModel.createCollection().then(function(collection) {
    console.log('Collection is created!');
  });
app.post('/post',async (req, res)=>{
  let pages = req.body
  
  for (pageidx in pages){
    let page = pages[pageidx]
    
    if (page.relay_rendering_strategy && page.relay_rendering_strategy.view_model && page.relay_rendering_strategy.view_model.profile) {
      console.log("Have page")
      let profile = page.relay_rendering_strategy.view_model.profile
      let oldPage = await PageModel.exists({id: profile.id})
      if (!oldPage){
        console.log("New Page")
        let new_page = {
          name: profile.name,
          url: profile.url,
          id: profile.id,
          avatar: profile.profile_picture.uri
        }
        console.log(new_page)
        await PageModel.create(new_page)
      }else{
        console.log(oldPage)
      }
    }else{
      console.log(page)
    }
    // console.log(page)
  }
  res.end("<html></html>")
})


io.on('connection', socket => {
  console.log('connect');
  socket.on('hey', data => {
    console.log('hey', data);
  });
  socket.on('hello', (data)=>{
      console.log(data)
      socket.emit('hello', {profile_id:"100009732215120", type: "person" })
  })
});

httpServer.listen(3000, () => {
  console.log('go to http://localhost:3000');
});
