// const content = require('fs').readFileSync(__dirname + '/index.html', 'utf8');

var bodyParser = require('body-parser')
var express = require('express');
const { writeFileSync } = require('fs');
var app = express();
var port = 3000;
app.set('port', port);
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
app.use(bodyParser.json({ limit: '50mb' }));
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const conn = mongoose.createConnection('mongodb://127.0.0.1/my_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
const Education = new Schema({
  id: { type: String },
  name: { type: String },
  address: { type: String },
  link: { type: String }
})
const Work = new Schema({
  id: { type: String },
  name: { type: String },
  address: { type: String },
  link: { type: String }
})
const CurrentCity = new Schema({
  id: { type: String },
  name: { type: String },
  address: { type: String },
  link: { type: String }
})
const Hometown = new Schema({
  id: { type: String },
  name: { type: String },
  address: { type: String },
  link: { type: String }
})
const Relationship = new Schema({
  id: { type: String },
  profile_id: { type: String },
  type: { type: String },
  link: { type: String }
})
const OtherAccount = new Schema({
  id: { type: String },
  username: { type: String },
  domain: { type: String },
  link: { type: String }
})
const OtherWebsite = new Schema({
  id: { type: String },
  domain: { type: String }
})
const Profile = new Schema({
  id: { type: String },
  education: { type: [Education] },
  relationship: { type: [Relationship] },
  work: { type: [Work] },
  locations: [CurrentCity],
  home_towns: [Hometown],
  join: { type: String },
  follower: { type: String },
  other_accounts: [OtherAccount],
  websites: [OtherWebsite]
});

conn.model('ProfileModel', Profile)
const ProfileModel = conn.model('ProfileModel');
ProfileModel.createCollection().then(function (collection) {
  console.log('Collection is created!');
});
app.post('/post', async (req, res) => {
  let data_pages = req.body
  writeFileSync('./tracing/'+data_pages.id + '.json', JSON.stringify(data_pages))
  // console.log(data_pages)
  let pages = data_pages.style_renderer.profile_field_sections[0].profile_fields.nodes
  
  let array_works = []
  let array_educations = []
  let array_curren_citys = []
  let array_hometowns = []
  let array_relationships = []
  for (let pageidx in pages) {
    let temp = []
    let page = pages[pageidx]
    let work_page = page.title;
    // console.log(page)
    if (work_page && work_page.ranges && work_page.ranges.length > 0) {
      for (let rangeidx in work_page.ranges) {
        let range = work_page.ranges[rangeidx]
        let name = ''
        
        name = work_page.text.substr(range.entity.offset, range.entity.length)
        let work = {
          id: range.entity.id,
          link: range.entity.profile_url,
          name: name
        }
        temp.push(work)
      }
    } else {
      if (work_page){
        let name = ''
        if(page.field_type.indexOf('relationship') != -1){
          console.log(page.renderer)
          name = page.renderer.field.text_content.text
        }else{
          name = work_page.text
        }
        let work = {
          id: "",
          link: "",
          name: name
        }
        temp.push(work)
      }
      
    }
    switch (page.field_type) {
      case "work":
        array_works = temp
        break;
      case "education":

        array_educations = temp.map(x=> {
          x.address = x.name
          return x
        })
        break;
      case "current_city":
        array_curren_citys = temp
        break;
      case "hometown":
        array_hometowns = temp
        break;
      case "relationship":
        array_relationships = temp.map(x=> {
          x.type = x.name
          return x
        })
        break;
      default:
        break;
    }
    console.log(temp)
  }

  let profile = {
    id: data_pages.profile_id ,
    education: array_educations,
    relationship: array_relationships,
    work: array_works,
    locations: array_curren_citys,
    home_towns: array_hometowns,
    // join: { type: String },
    // follower: { type: String },
    // other_accounts: [OtherAccount],
    // websites: [OtherWebsite],
    id_trace: data_pages.id
  }
  let old_profile = await ProfileModel.exists({id: profile.id})
  if(!old_profile){
    await ProfileModel.create(profile)
    console.log("save profile ", data_pages.id)
  }else{
    console.log("profile exists")
  }
  res.end("<html></html>")
})


io.on('connection', socket => {
  console.log('connect');
  socket.on('hey', data => {
    console.log('hey', data);
  });
  socket.on('hello', (data) => {
    console.log(data)
    socket.emit('hello', { profile_id: "100009732215120", type: "person" })
  })
});

httpServer.listen(3000, () => {
  console.log('go to http://localhost:3000');
});
