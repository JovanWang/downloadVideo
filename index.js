var Bagpipe = require('bagpipe');
var request = require('request');
// var cheerio = require('cheerio');
var fs = require('fs');

var url = 'http://101.96.10.45/adultvideo.science/media/videos/iphone/';//远程服务器地址
var local_base_url = "H:/data/videos/";//本地存储地址
var local_dir = "";//本新建文件夹名
var dir_max_num = 100;//本地文件夹内最多放置的视频数
var dir_i = 1;//本地文件夹的初始序号
var origin_no = 100;//从远程服务器下载的文件个数
var origin_start_no = 0;//远程服务器的起始序列号
var pipe_num = 10;//并发创建的任务数
var pipe_timeout = 30000;//新建一组任务的延迟时间（除以1000是秒）

// request(url, function(err, res, body) {
//     if (!err && res.statusCode === 200) {

//     }
// });
//下载视频
var downloadVideo = function(src, dest, i) {
    var src_request = request(src);
    src_request.on('response', function(res) {
        if (res.statusCode != 200) {
            console.log("don't exist " + i + " mp4!");
        } else {
            src_request.pipe(fs.createWriteStream(dest, {
                autoClose: true
            })).on('close', function() {
                console.log("NO " + i + " mp4 download success!");
            });
        }
    })
    src_request.on('error', function(err) {
        console
    })
}
var videoList = [];
for (var i = origin_start_no; i < origin_start_no+origin_no; i++) {
    videoList.push(url + "new_" + i + ".mp4");
}
var bagpipe = new Bagpipe(pipe_num, {
    timeout: pipe_timeout
});
console.log("begin download videos!Please wait...");
for (var i = 0; i < videoList.length; i++) {
    if (i % dir_max_num == 0) {
        local_dir = local_base_url + "dir_" + dir_i + "/";
        if (fs.existsSync(local_dir)) {
            console.log('已经创建过此' + local_dir + '目录了');
        } else {
            fs.mkdirSync(local_dir);
            console.log('更新目录已创建成功\n');
        }
        dir_i++;
    }
    bagpipe.push(downloadVideo, videoList[i], local_dir + i + '.mp4', i, function(err, data) {});
}
bagpipe.on('full', function(length) {
    console.log('底层系统处理不能及时完成，队列堵塞，目前队列长度' + length);
});