// pages/classroom/classroom.js
var WebIM = require('../../utils/WebIM.js')
var WebIM = WebIM.default
const db=wx.cloud.database()
const userInfo=db.collection('userInfo')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
        userInfo.where({
          _openid:res1.result.openid
        }).count().then(res2=>{
          if(res2.total==1) {userInfo.where({
            _openid:res1.result.openid
          })
          .get().then(res3=>{
             this.setData({
               userInfo:res3.data[0],
               hasUserInfo:true
             })
             var loginmessage = { 
              apiUrl: WebIM.config.apiURL,
              user: res1.result.openid,
              pwd: res1.result.openid,
              appKey: WebIM.config.appkey
            };
            WebIM.conn.open(loginmessage);
          })
          }
        })
      }
    })
  },

  toregister(e){
    wx.switchTab({
      url: '../personal/personal'
    })
  },
  createclass(e){
    wx.navigateTo({
      url: '../../class/pages/createclass/createclass'
    })
  },
  joinclass(e){
    wx.navigateTo({
      url: '../../class/pages/joinclass/joinclass'
    })
  },
  myclass(e){
    wx.navigateTo({
      url: '../../class/pages/myclass/myclass'
    })
  },
  onTabItemTap(e){
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
        userInfo.where({
          _openid:res1.result.openid
        }).count().then(res2=>{
          if(res2.total==1) {userInfo.where({
            _openid:res1.result.openid
          })
          .get().then(res3=>{
             this.setData({
               userInfo:res3.data[0],
               hasUserInfo:true
             })
          })
        }
        })
      }
    })
  }
})
