//app.js
var WebIM = require('utils/WebIM.js')
var WebIM = WebIM.default
App({
  globalData: {
		groupList:[]
	},
  onLaunch: function () {
    wx.cloud.init({
      env:'cloud1-9gfintjc7bd624b3',
      traceUser: true
		})
    var that = this;
    WebIM.conn.listen({
      onOpened: function ( message ) {          //连接成功回调
          // 如果isAutoLogin设置为false，那么必须手动设置上线，否则无法收消息
          // 手动上线指的是调用conn.setPresence(); 如果conn初始化时已将isAutoLogin设置为true
          // 则无需调用conn.setPresence();             
      },  
      onClosed: function ( message ) {},         //连接关闭回调
      //收到文本消息
      onTextMessage(message){
        console.log(message)
        var savemessage=wx.getStorageSync('message_'+message.to)
        if(!savemessage){savemessage=[]}
        let sendmessage = { 
          from:'',
          avataurl:'',
          type:'text',
          msg:message.data,
          member:'others'
        };
        console.log(message.from)
        //存储收到的文本
        let db=wx.cloud.database()
        db.collection('userInfo').where({
          _openid:new db.RegExp({
            regexp: message.from,
            options: 'i',
          })
        }).get().then(res1=>{
          sendmessage.from=message.from,
          sendmessage.avataurl=res1.data[0].avatarUrl
          savemessage.push(sendmessage)
          wx.setStorageSync('message_'+message.to, savemessage)
        })
      },
      onEmojiMessage: function ( message ) {},   //收到表情消息

      //收到图片消息
      onPictureMessage: function ( message ) {
        console.log(message)
        //存储收到的文本
        var savemessage=wx.getStorageSync('message_'+message.to)
        if(!savemessage){savemessage=[]}
        let sendmessage = { 
          from:'',
          avataurl:'',
          type:'img',
          msg:message.url,
          member:'others'
        };
        //存储收到的图片
        let db=wx.cloud.database()
        db.collection('userInfo').where({
          _openid:new db.RegExp({
            regexp: message.from,
            options: 'i',
          })
        }).get().then(res1=>{
          sendmessage.from=message.from
          sendmessage.avataurl=res1.data[0].avatarUrl
          savemessage.push(sendmessage)
          wx.setStorageSync('message_'+message.to, savemessage)
        })
      }, 
      onCmdMessage: function ( message ) {},     //收到命令消息
      onAudioMessage: function ( message ) {},   //收到音频消息
      onLocationMessage: function ( message ) {},//收到位置消息
      onFileMessage: function ( message ) {},    //收到文件消息
      onVideoMessage: function (message) {},   //收到视频消息

			//班级消息通知
			onPresence(message){
				console.log("onPresence", message);
				that.globalData.groupList.push(message) 
				console.log(that.globalData.groupList)
			},

      onRoster: function ( message ) {},         //处理好友申请
      onInviteMessage: function ( message ) {},  //处理群组邀请
      onOnline: function () {},                  //本机网络连接成功
      onOffline: function () {},                 //本机网络掉线
      onError: function ( message ) {},          //失败回调
      onBlacklistUpdate: function (list) {       //黑名单变动
          // 查询黑名单，将好友拉黑，将好友从黑名单移除都会回调这个函数，list则是黑名单现有的所有好友信息
          console.log(list);
      },
      onReceivedMessage: function(message){},    //收到消息送达服务器回执
      onDeliveredMessage: function(message){},   //收到消息送达客户端回执
      onReadMessage: function(message){},        //收到消息已读回执
      onCreateGroup: function(message){},        //创建群组成功回执（需调用createGroupNew）
      onMutedMessage: function(message){}        //如果用户在A群组被禁言，在A群发消息会走这个回调并且消息不会传递给群其它成员
		});
		},
		getRoomPage: function () {

					return this.getPage("")

		},
		getPage: function (pageName) {
					var pages = getCurrentPages()
					return pages.find(function (page) {
						return page.__route__ == pageName
				})
		}
})