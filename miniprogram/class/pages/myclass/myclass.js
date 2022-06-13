// class/pages/myclass/myclass.js
var WebIM = require('../../../utils/WebIM.js')
var WebIM = WebIM.default
var app=getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    username:'',
    groups:[],
    havenewmeassage:false
  },
  onLoad:function(){
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
        this.setData({
          username:res1.result.openid
        }) 
      }
    })
    var that=this;
    // 列出当前登录用户加入的所有群组
    var options = {
      success: function (resp) {
        that.setData({
          groups:resp.data
        })
      },
      error: function (e) {}
    }
    WebIM.conn.getGroup(options)
    if(app.globalData.groupList!='')
    {
      this.setData({
        havenewmeassage:true
      })
    }
    else{
      this.setData({
        havenewmeassage:false
      })
    }
  },
  choosegroup(e){
    wx.navigateTo({
      url: '../groupchat/groupchat?username='+this.data.username+'&groupname=' + e.currentTarget.dataset.item.groupname+'&groupid=' + e.currentTarget.dataset.item.groupid,
    })
  },
  tomessage(e){
    wx.navigateTo({
      url: '../classmessage/classmessage',
    })
  }
})