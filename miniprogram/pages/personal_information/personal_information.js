// pages/personal_information/personal_information.js
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
  }
})