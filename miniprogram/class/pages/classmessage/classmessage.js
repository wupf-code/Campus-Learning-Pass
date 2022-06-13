var WebIM = require('../../../utils/WebIM.js')
var WebIM = WebIM.default
const db=wx.cloud.database()
const userInfo=db.collection('userInfo')
var app=getApp()
// 好友邀请提醒
Page({
	data: {
		groupList: [],
		listennewmessage:''
	},
      
	onLoad(){
		var that=this
		wx.showLoading({
			title: '请稍后',
		})
		console.log(wx.getStorageSync('groupList'))
		let x=[]
		setTimeout(() => {
			wx.hideLoading()
			this.setData({
				groupList:x.reverse()
			})
		}, 1000);
		x=wx.getStorageSync('groupList')
		if(!x){
			x=[]
		}
		if(app.globalData.groupList!=''){
			for(let i=0;i<app.globalData.groupList.length;i++){
				console.log(app.globalData.groupList[i].type)
				if(app.globalData.groupList[i].type=='joinGroupNotifications'||app.globalData.groupList[i].type=='memberJoinPublicGroupSuccess'||app.globalData.groupList[i].type=='leaveGroup'){
          userInfo.where({
            _openid: db.RegExp({
              regexp: app.globalData.groupList[i].from,
              options: 'i',
						})
					}).get().then(res1=>{
						app.globalData.groupList[i].from=res1.data[0].nickName
						x.push(app.globalData.groupList[i])
						wx.setStorageSync('groupList', x)
						getApp().globalData.groupList=[]
					})
				}
				else{
					x.push(app.globalData.groupList[i])
					wx.setStorageSync('groupList', x)
					getApp().globalData.groupList=[]
				}
		}
	}
	},
	onShow(){
	},
	clearmessage(){
		wx.clearStorage('groupList')
		this.setData({
			groupList:[]
		})
	},
	agreejoinclass(e){
		var that=this
		let x=[]
		var options = {
			applicant: e.target.dataset.applicant,
			groupId: e.target.dataset.classid,
			success: function(resp){
				setTimeout(() => {
					that.setData({
						groupList:x
					})
				}, 1000);
				x=wx.getStorageSync('groupList')
				for(let i=0;i<x.length;i++){
					if(x[i].fromJid.name==e.target.dataset.applicant&&x[i].gid==e.target.dataset.classid){
						x[i].reason='已同意'
						wx.setStorageSync('groupList', x)
					}
				}
			},
			error: function(e){}
		};
		WebIM.conn.agreeJoinGroup(options);
	},
	rejectclass(e){
		var that=this
		let x=[]
		var options = {
			applicant: e.target.dataset.applicant,
			groupId: e.target.dataset.classid,
			success: function(resp){
				setTimeout(() => {
					that.setData({
						groupList:x
					})
				}, 1000);
				x=wx.getStorageSync('groupList')
				for(let i=0;i<x.length;i++){
					if(x[i].fromJid.name==e.target.dataset.applicant&&x[i].gid==e.target.dataset.classid){
						x[i].reason='已拒绝'
						wx.setStorageSync('groupList', x)
					}
				}
			},
			error: function(e){}
		};
		WebIM.conn.rejectJoinGroup(options);
	}
});