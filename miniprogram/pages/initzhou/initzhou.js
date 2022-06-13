// pages/initzhou/initzhou.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const timeTable = db.collection('timetable')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    focus: false,
    focus2: false,
    focus3: false,
    year:0,
    month:0,
    day:0,
    date:null
  },
  bindButtonTap: function () {
    this.setData({
      focus: true
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      year: e.detail.value
    })

  },
  bindButtonTap2: function () {
    this.setData({
      focus2: true
    })
  },
  bindKeyInput2: function (e) {
    this.setData({
      month: e.detail.value
    })
  },
  bindButtonTap3: function () {
    this.setData({
      focus3: true
    })
  },
  bindKeyInput3: function (e) {
    this.setData({
      day: e.detail.value
    })
  },
  save:function(){
    this.data.date=this.data.year+"-"+this.data.month+"-"+this.data.day
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
        timeTable.where({
          openid:res1.result.openid
        }).update({
          data:{
            firstzhou:this.data.date
          },
          success:res4=>{wx.switchTab({
            url: '../timeable/timeable'
          })},
          fail:res5=>{console.log("error")}
        })

      }
    })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})