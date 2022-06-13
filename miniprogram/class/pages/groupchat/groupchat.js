// class/pages/groupchat/groupchat.js
var disp = require("../../../utils/broadcast");
var WebIM = require('../../../utils/WebIM.js')
var WebIM = WebIM.default
const db=wx.cloud.database()
const userInfo=db.collection('userInfo')
const classmember=db.collection('classmember')

Page({
	data: {
		username:'',
		groupid:'',
		sendwords:'',
		isopenmedia:false,
		image:'',
		showmessage:[],
		scrolltop:0,
		myprofile:'',
		allnickname:'',
		showorder:false,
		currentnum:0,
		isowner:false,
		showhomework:false
	},

	// options = 系统传入的 url 参数
	onLoad(options){
		var that=this
		this.setData({
			groupid:options.groupid,
			username:options.username
		})
		wx.setNavigationBarTitle({
			title: options.groupname
		});
		userInfo.where({
			_openid:new db.RegExp({
				regexp: options.username,
				options: 'i',
			})
		}).get().then(res1=>{
			that.setData({ 
				myprofile:res1.data[0].avatarUrl
			});
		})
	},
	Onchangenickname(){
		var that=this
		var message=wx.getStorageSync('message_'+this.data.groupid)
		this.setData({
			currentnum:message.length
		})
		if(message==null){message=[]}
		for(let i=0;i<message.length;i++){
			var count=0;
			classmember.where({
				groupid:that.data.groupid
			}).get().then(res1=>{
				if(res1.data.length!=0){
					for(let j=0;j<res1.data[0].studentname.length;j++){
						if(res1.data[0].studentname[j][0].toLowerCase()==message[i].from.toLowerCase()){
							message[i].from=res1.data[0].studentname[j][1]
							count=1
							break;
						}
					}
				}
				if(count==0){
					userInfo.where({
						_openid:message[i].from
					}).get().then(res2=>{
						message[i].from=res2.data[0].nickName
					})
				}
			}).then(res3=>{
				setTimeout(() => {
					that.setData({
						showmessage:message,
						scrolltop:message.length*1000,
						scrolltop:(message.length+1)*1000
					})
				}, 500);
			})
		}
	},
	onShow(options){
		this.Onchangenickname()
		setInterval(() => {
			var message=wx.getStorageSync('message_'+this.data.groupid)
			if(message.length>this.data.currentnum){
				this.Onchangenickname()
			}
		}, 100);
	},
	inputcontent(e){
		this.setData({
			sendwords:e.detail.value
		})
	},
	//发送文本消息到班级里
	sendtextmessage(e){
		if(this.data.sendwords.trim()==""){
      wx.showToast({
        title: '请输入发送内容',
        icon: 'error'
			})
			this.setData({
				sendwords:''
			})
			
		}
		else{
			var that=this
			// 群组发送文本消息
			var id = WebIM.conn.getUniqueId();            // 生成本地消息id
			var msg = new WebIM.message('txt', id); // 创建文本消息
			var option = {
					msg: that.data.sendwords.replace(/\n/g,'\n'),             // 消息内容
					to: that.data.groupid,                  // 接收消息对象(群组id)
					roomType: false,
					chatType: 'chatRoom',
					success: function () {
							console.log('send room text success');
					},
					fail: function () {
							console.log('failed');
					}
			};

			//存储发送的消息
			let message=[]
			message=wx.getStorageSync('message_'+this.data.groupid)
			if(!message){message=[]}
			var sendmessage = { 
				type:'text',
				msg:option.msg,
				member:'me',
				from:that.data.username,
				avataurl:that.data.myprofile
			};
			message.push(sendmessage)
			wx.setStorageSync('message_'+this.data.groupid, message)
			this.setData({
				showmessage:message
			})
			msg.set(option);
			msg.setGroup('groupchat');
			WebIM.conn.send(msg.body);
			this.setData({
				sendwords:''
			})
		}
	},
	openmedia(e){
		this.setData({
			isopenmedia:true
		})
	},
	hidemedia(e){
		this.setData({
			isopenmedia:false
		})
	},
	//选择图片
	chooseimage(e){
			var that = this;
			wx.chooseImage({
				count: 1,
				sizeType: ["original", "compressed"],
				sourceType: ['album', 'camera'],
				success(res){
					that.upLoadImage(res);
				},
			});
	},
	//发送图片
	upLoadImage(res){
		var that = this;
		var tempFilePaths = res.tempFilePaths;
		var token = WebIM.conn.context.accessToken
		wx.getImageInfo({
			src: res.tempFilePaths[0],
			success(res){
				var allowType = {
					jpg: true,
					gif: true,
					png: true,
					bmp: true
				};
				var str = WebIM.config.appkey.split("#");
				var width = res.width;
				var height = res.height;
				var index = res.path.lastIndexOf(".");
				var filetype = (~index && res.path.slice(index + 1)) || "";
				var domain = WebIM.conn.apiUrl + '/'
				if(filetype.toLowerCase() in allowType){
					wx.uploadFile({
						url: domain + str[0] + "/" + str[1] + "/chatfiles",
						filePath: tempFilePaths[0],
						name: "file",
						header: {
							"Content-Type": "multipart/form-data",
							Authorization: "Bearer " + token
						},
						success(res){
							if(res.statusCode === 400){
								// 图片上传阿里云检验不合法
								var errData = JSON.parse(res.data);
								if (errData.error === 'content improper') {
									wx.showToast({
										title: '图片不合法'
									});
								}
							}
							else{
								var data = res.data;
								var dataObj = JSON.parse(data);
								var id = WebIM.conn.getUniqueId();		// 生成本地消息 id
								var msg = new WebIM.message('img', id);
								var file = {
									type: 'img',
									size: {
										width: width,
										height: height
									},
									url: dataObj.uri + "/" + dataObj.entities[0].uuid,
									filetype: filetype,
									filename: tempFilePaths[0]
								};
								msg.set({
									apiUrl: WebIM.config.apiURL,
									body: file,
									from: that.data.username.myName,
									to: that.data.groupid,
									roomType: false,
									chatType: 'chatRoom',
									success: function (argument) {
										disp.fire('em.chat.sendSuccess', id);
									}
								});

							//存储发送的信息
							let message=[]
							message=wx.getStorageSync('message_'+msg.body.to)
							if(!message){message=[]}
							let sendmessage = { 
								type:'img',
								msg:msg.body.body.url,
								member:'me',
								from:that.data.username,
								avataurl:that.data.myprofile
							};
							message.push(sendmessage)
							console.log(message)
							wx.setStorageSync('message_'+msg.body.to, message)
							that.setData({
								showmessage:message
							})
							msg.setGroup("groupchat");
							WebIM.conn.send(msg.body);
							that.triggerEvent(
								"newImageMsg",
								{
									msg: msg,
									type: 'img'
								},
								{
									bubbles: true,
									composed: true
								}
							);
						}
					}
				})
				}
			}
		})
	},

	//点名功能
	beginorder(e){
		var that=this
		var ownername=''
    var options = {
        pageNum: 1,
        pageSize: 100,
        groupId: that.data.groupid,
				success: function (res1) {
					for(let i=0;i<res1.data.length;i++){
						if(res1.data[i].owner!=undefined){
							ownername=res1.data[i].owner
							break;
						}
					}
					if(ownername.toLowerCase()==that.data.username.toLowerCase()){
						that.setData({
							showorder:true
						})
					}
					else{
						wx.navigateTo({
							url: '../classorderstudent/classorderstudent?groupid=' + that.data.groupid
						})
					}
				},
        error: function(e){}
    };
		WebIM.conn.listGroupMember(options);
	},
	onClickHide(e){
		this.setData({
			showorder:false,
			showhomework:false
		})
	},
	//全屏显示图片
	lookimage(e){
    wx.previewImage({
      current:e.currentTarget.dataset.road, //当前显示图片的http链接
      urls:[e.currentTarget.dataset.road] // 需要预览的图片http链接列表
    })
	},
	//跳转到设置页面
	toclasssetting(e){
		wx.navigateTo({
			url: '../classsetting/classsetting?groupid=' + this.data.groupid
		})
	},
	touchorder(e){
		wx.navigateTo({
			url: '../classorderteacher/classorderteacher?groupid=' + this.data.groupid + '&ordertype=touch'
		})
	},
	locationorder(e){
		wx.navigateTo({
			url: '../classorderteacher/classorderteacher?groupid=' + this.data.groupid + '&ordertype=location'
		})
	},
	filemanagement(e){
		wx.navigateTo({
			url: '../filemanagement/filemanagement?groupid=' + this.data.groupid
		})
	},
	showhomework(e){
		this.setData({
			showhomework:true
		})
	},
	tohomework(e){
		wx.navigateTo({
			url: '../homeworks/homework/homework?groupid=' + this.data.groupid,
		})
	},
	tochoice(e){
		var that=this
		var mytype='user'
    var options = {
        pageNum: 1,
        pageSize: 1000,
        groupId: that.data.groupid,
        success: function (resp) { 
					for(let i=0;i<resp.data.length;i++){
						if(resp.data[i].owner==that.data.myid){
							mytype='owner'
							break
						}
					}
					wx.navigateTo({
						url: '../choices/choice/choice?groupid=' + that.data.groupid+'&type='+mytype,
					})
				},
        error: function(e){}
    };
		WebIM.conn.listGroupMember(options);
	}
});