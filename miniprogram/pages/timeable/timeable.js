// pages/timeable/timeable.js
var WebIM = require('../../utils/WebIM.js')
var WebIM = WebIM.default
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const timeTable = db.collection('timetable')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    temp_now: 0,
    focus: false,
    hiddenmodalput: true,
    firstdate: "2022-1-1",
    today: null,
    now: 1,
    isRuleTrue: false,
    fwlist: false,
    userInfo: {},
    hasUserInfo: false,
    colorArrays: ["#85B8CF", "#90C652", "#D8AA5A", "#FC9F9D", "#0A9A84", "#61BC69", "#12AEF3", "#E29AAD"],
    wlist: [
      //上课长度全部默认为两节课

    ]

  },

  showCardView: function (e) {
    wx.navigateTo({
      url: '../subject/subject?id=' + e.currentTarget.dataset.index

    });
    console.log(e.currentTarget.dataset)
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
    var today = new Date()
    var end = today.getTime()
    console.log(today)
    wx.cloud.callFunction({
      name: 'getUserInfo',
      complete: res1 => {
        userInfo.where({
          _openid: res1.result.openid
        }).count().then(res2 => {
          if (res2.total == 1) {


            userInfo.where({
                _openid: res1.result.openid
              })
              .get().then(res3 => {
                this.setData({
                  userInfo: res3.data[0],
                  hasUserInfo: true
                })

                timeTable.where({
                  openid: res1.result.openid
                }).get({
                  success: res3 => {
                    this.setData({
                      firstdate: res3.data[0].firstzhou,
                      wlist: res3.data[0].wlist[0],
                      fwlist: true,
                    })
                    console.log(res3)
                    let start_num = new Date(this.data.firstdate.replace(/-/g, "/"))
                    this.setData({
                      now: parseInt(parseInt((end - start_num.getTime()) / (1000 * 60 * 60 * 24)) / 7) + 1
                    })


                    console.log(this.data.now)


                  },
                  fail: err => {
                    console.error('[云函数] 返回数据结果 调用失败', err)

                  }
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

  actioncnt: function () {
    var that = this
    wx.showActionSheet({
      itemList: ['添加', '切换周数', '设置第一周开始日期'],
      success: function (res) {
        if (res.tapIndex == 0) {
          wx.navigateTo({
            url: '../addSubject/addSubject'
          })
        }
        if (res.tapIndex == 1) {
          that.setData({
            hiddenmodalput: !that.data.hiddenmodalput
          })
        }
        if (res.tapIndex == 2) {
          wx.navigateTo({
            url: '../initzhou/initzhou'
          })
        }
        console.log(res.tapIndex)
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
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

  },
  changezhou: function (e) {
    this.data.temp_now = e.detail.value
  },
  cancel: function () {
    this.setData({
      hiddenmodalput: true
    });
  },
  //确认  
  confirm: function (e) {

    this.setData({
      now: this.data.temp_now,
      hiddenmodalput: true

    })

    console.log(this.data.now)

  },


})