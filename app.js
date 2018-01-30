
/**
 * Module dependencies.
 */

require('./lib/db');
var mongoose = require('mongoose');
var Table = mongoose.model('Table');
var fs = require('fs');
var nmap = require('libnmap');
var spawn = require('child_process').spawn;
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var routes = require('./routes');
var user = require('./routes/user');
var path = require('path');
var datetime = new Date();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views')); // 將 views 資料夾定為網頁放置處
app.set('view engine', 'jade'); // 設定網頁形式為 jade
app.use(express.favicon()); // 網頁圖示
app.use(express.logger('dev')); // 紀錄所有 HTTP 資訊
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

/* 啟用 cookie-based session 功能 */
app.configure(function(){
	// 啟用 cookie 解析器
	app.use(express.cookieParser());
	// 啟用 Session
	app.use(express.cookieSession({
		key: 'node',
		secret: 'HelloExpressSESSION'
	}));
	// 啟用 body 解析器
	app.use(express.bodyParser());
});

app.use(app.router); // 啟用路由
app.use(express.static(path.join(__dirname, 'public'))); // 設定 public 為靜態檔案位置

/* development only */
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/* 網頁請求與轉發 */
app.get('/', routes.index); // 登入頁面
app.get('/tap', user.tap); // 監控頁面
app.get('/signout', user.signout); // 登出轉發
app.get('/database', user.database); // 資料庫頁面
//app.get('/apis/audio/:id', user.audio_download);
//app.get('/apis/txt/:id', user.txt_download);
app.get('/apis/delete/:id', user.del_data);
app.post('/apis/login', user.login); // 登入轉發


app.get('/apis/audio/:id', function(req, res){
    var data;
    Table.find({_id: req.params.id}, function(err, tables){
        for(var index in tables){
            data = tables[index];
            console.log('User downleaded ' + data.Audio_file);
        }
        var file = __dirname + '/file/' + data.CreateDate + '/' + data.Audio_file;
        res.download(file, function(err){
            if(err){
                if(res.headersSent){
                    console.log("send header");
                } else{
                    return res.sendStatus(404);
                }
            }
        }); // Set disposition and send it.
    });
    //res.redirect('database');
});

app.get('/apis/txt/:id', function(req, res){
    var data;
    Table.find({_id: req.params.id}, function(err, tables){
        for(var index in tables){
            data = tables[index];
            console.log('User downleaded ' + data.Txt_file);
        }
        var file = __dirname + '/file/' + data.CreateDate + '/' + data.Txt_file;
        res.download(file, function(err){
            if(err){
                if(res.headersSent){
                    console.log("send header");
                } else{
                    return res.sendStatus(404);
                }
            }
        }); // Set disposition and send it.
    });
    // res.redirect('database');
});

/*http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});*/

server.listen(app.get('port')); // 啟用伺服器並開啟 port 3000

/* 與前端網頁連線 */
io.sockets.on('connection', function(socket) {
    var run_copy = null;
    var ip1, ip2, tap_port;
    var tcpdump_run, arpspoof_run, tshark_run, test_run;
    var port_msg;
    var file_dirname;
    var dirname;
    var table_name;
    
    socket.on('message_to_server', function(data) {
        var ip_msg = data["IPmessage"];
        port_msg = data["PORTmessage"];
        var opts = {
            // Scan IANA reserved, registered & some common network ports
            ports: [port_msg /*,'1-100'*/ ],
            range: [ip_msg /*'127.0.0.1','192.168.0.101/24','175.180.166.150'*/ ]
        };

        console.log(data);

        

        nmap.scan(opts, function(err, report) {
            if (err) throw new Error(err);

            var result = {};
            var ip_num = "",
                port_num = "";

            for (var item in report) {
                for (var host in report[item].host) {
                    for (var ports in report[item].host[host].ports) {
                        ip_num = report[item].host[host].address[0].item.addr;
                        console.log(ip_num);
                        result[ip_num] = [];
                        for (var port in report[item].host[host].ports[ports].port) {
                            //console.log(report[item].host[host].ports[ports].port[port].item.portid);
                            //console.log(report[item].host[host].ports[ports].port[port].state[0].item.state);                
                            if (report[item].host[host].ports[ports].port[port].state[0].item.state == 'open') {
                                port_num = report[item].host[host].ports[ports].port[port].item.portid;
                                console.log(port_num);
                                result[ip_num].push(port_num);
                                //console.log(report[item].host[host].ports[ports].port[port].state[0].item.state);
                            }
                        }
                        if (result[ip_num].length == 0) //刪除長度為零的元素
                            delete result[ip_num];
                    }
                }
            }
            item = 0;
            console.log(result[1]);
            console.log(result);
            socket.emit("message_to_client", result);
        });
        
    });

    socket.on('tap_on', function(data) {
        datetime = new Date().toISOString().replace(/T/, '_').replace(/\..+/,'');
        //console.log(datetime);

        for (var item in data) {
            console.log(data[item]);
        }

        ip1 = data[0].ip;
        ip2 = data[1].ip;
        file_dirname = ip1 + '_' + ip2;
        dirname = datetime;

        test_run = spawn('./pings.sh', [ip1, ip2, port_msg, file_dirname + '.pcap', datetime]);
        test_run.stdout.setEncoding('utf8');
        test_run.stderr.setEncoding('utf8');

        test_run.stdout.on("data", function(data) {
            console.log(data);
        });

        test_run.stderr.on("data", function(data) {
            console.log(data);
        });

        test_run.on("exit", function(data) {
            console.log("test_run exited." + data);
            console.log("test_run exited.port_msg" + port_msg); //test port_msg num

            //file download
            app.get('/download', function(req, res) {
                var file = __dirname + '/file/' + datetime + '/' + datetime + '.wav';
                res.download(file); // Set disposition and send it.
            });
            socket.emit("ready_recognition");
        });

        new Table({
            Audio_file: datetime+'.wav',
            Txt_file: datetime+'.txt',
            CreateDate: datetime
        }).save(function(err){
            if(err){
                console.log("Fail to save to DB");
                return;
            }
            console.log("Save to DB");
        });
    });

    socket.on('tap_off', function(data) {
        console.log("close script");
        test_run.kill();
    });

    socket.on("play_audio", function(data){
        var audio_file = 'file/' + datetime + '/' + datetime + '.wav';
        var play = spawn('play', [audio_file]);
        play.stdout.setEncoding('utf8');
        play.stderr.setEncoding('utf8');

        play.stdout.on("data", function(data) {
            console.log(data);
        });

        play.stderr.on("data", function(data) {
            console.log(data);
        });

        play.on('exit', function(data) {
            socket.emit("ok_recognition");
        });
    });

    socket.on("savefile", function(data){
        var txt = data["content"];

        //console.log(txt);

        fs.writeFile(__dirname + '/file/' + datetime + '/' + datetime + '.txt', txt, function(err){
            if(err){
                return console.log(err);
            }

            console.log("The file was saved!");
        });

        //file download
        app.get('/download2', function(req, res) {
            var file = __dirname + '/file/' + datetime + '/' + datetime + '.txt';
            res.download(file); // Set disposition and send it.
        });
    });

});

console.log("the VoIP monitoring platform now is running");
console.log(datetime);
