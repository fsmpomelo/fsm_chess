var pomelo = require('pomelo');
var app = pomelo.createApp();
app.set('name', 'bigtwo');
var routeUtil = require('./app/util/routeUtil');
var fs = require('fs');

 
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 30,
      /* ssl: {
        type: 'wss',
        key: fs.readFileSync('./key/214582638900012.key'),  
        cert: fs.readFileSync('./key/214582638900012.pem')
      },  */       
      useDict : true,
      useProtobuf : true,
      handshake : function(msg, cb){
				cb(null, {});
			}
    });
});

app.loadConfig("mysql", app.getBase() + "/config/mysql.json"); 
app.loadConfig('memcached',app.getBase()+'/config/memcached.json');

app.configure('production|development', 'dle|shaibao|sangong|chat|pontoon|sangongcj' ,function () {

    var dbclient = require('./app/dao/mysql/mysql').init(app);
	  app.set('dbclient', dbclient); 
    

    var Memclient = require('./app/dao/memcached/memcached');
    var memclientuser = new Memclient(app,0);//用户
    app.set('memclientuser',memclientuser);

    var memclientroom = new Memclient(app,1);//房间
    app.set('memclientroom',memclientroom);

    var memclientnum = new Memclient(app,2);//房间
    app.set('memclientnum',memclientnum);


    var memclientnumsb = new Memclient(app,3);//晒宝
    app.set('memclientnumsb',memclientnumsb);

    var memclientroomsg = new Memclient(app,4);//sangong
    app.set('memclientroomsg',memclientroomsg);

    var memclientnumsg = new Memclient(app,5);//sangong
    app.set('memclientnumsg',memclientnumsg);

    var memclientroompt = new Memclient(app,6);//21房间配置
    app.set('memclientroompt',memclientroompt);

    var memclientnumpt = new Memclient(app,7);//21在线人数
    app.set('memclientnumpt',memclientnumpt);

   var memclientroomcj = new Memclient(app,8);//吃鸡房间配置
    app.set('memclientroomcj',memclientroomcj);

    var memclientnumcj = new Memclient(app,9);//吃鸡在线人数
    app.set('memclientnumcj',memclientnumcj); 
   
})

var routeT = new routeUtil();
app.route('chat', 	routeT.chat);
app.route('shaibao', 	routeT.shaibao);
app.route('dle', 	routeT.dle);
app.route('sangong', 	routeT.sangong); 
app.route('pontoon', 	routeT.pontoon); 
app.route('sangongcj', 	routeT.sangongcj); 
var HttpServer = require('./app/gamehttp/httpServer');
var httpServer = new HttpServer(app);
app.set('httpServer', httpServer); 
var roomManager = require('./app/game/roomManager');
var gamescene = require('./app/game/gameid').gamescene;
app.configure('production|development', 'dle|shaibao|sangong|pontoon|sangongcj',function () {
  const serverType = app.serverType;
  const scene = gamescene[serverType];
  for(const key in scene)
  {
    const sbj = scene[key];
    let room = new roomManager(sbj.time);
    app.set(sbj.room,room);
    room.timerForOutCard();
    if(serverType === 'shaibao')
    {
      room.scheduleCronstyle();
    }
  }
 
})
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});

