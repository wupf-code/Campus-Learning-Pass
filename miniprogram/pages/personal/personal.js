// pages/personal/personal.js
var WebIM = require('../../utils/WebIM.js')
var WebIM = WebIM.default
const db=wx.cloud.database()
const userInfo=db.collection('userInfo')
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
  },
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
          })
        }
        })
      }
    })
  },

//小程序授权api替换 getUserInfo 替换
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        if(this.data.hasUserInfo){
          wx.cloud.callFunction({
            name:'getUserInfo',
            complete:res1=>{
              userInfo.where({
                _openid:res1.result.openid
              }).count().then(res2=>{
                var options = { 
                  username: res1.result.openid,
                  password: res1.result.openid,
                  nickname: this.data.userInfo.nickName,
                  appKey: WebIM.config.appkey,
                  success: function () {console.log('注册成功')},  
                  error: function () {console.log('注册失败')}, 
                  apiUrl: WebIM.config.apiURL
                }; 
                WebIM.conn.registerUser(options);
                if(res2.total==0){
                  userInfo.add({
                    data:this.data.userInfo
                  })
              }
              })
            }
          })
        }
      },
    })
  },
    topersonalinformation(e){
    wx.navigateTo({
      url: '../personal_information/personal_information'
    })
  },
  topersonalfavourite(e){
    wx.navigateTo({
      url: '../personal_favourite/personal_favourite'
    })
  },
  topersonalarticle(e){
    wx.navigateTo({
      url: '../personal_article/personal_article'
    })
  },
  topersonalQandA(e){
    wx.navigateTo({
      url: '../personal_Q&A/personal_Q&A'
    })
  },
  topersonalsetting(e){
    wx.navigateTo({
      url: '../personal_setting/personal_setting'
    })
  },
})
