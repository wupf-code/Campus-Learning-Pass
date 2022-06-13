// pages/addSubject/addSubject.js
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
    focus4: false,
    focus5: false,
    focus6:false,
    focus7:false,
    kcmc: "",
    didian:"",
    startzhou:"",
    endzhou:"",
    kcxx:"",
    index:"",
    xqj:"",
    sksj:"",
    wlist:[],
    openid:"",
  },
  bindButtonTap: function () {
    this.setData({
      focus: true
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      kcmc: e.detail.value
    })
  
  },
  bindButtonTap2: function () {
    this.setData({
      focus2: true
    })
  },
  bindKeyInput2: function (e) {
    this.setData({
      xqj: e.detail.value
    })
  },
  bindButtonTap3: function () {
    this.setData({
      focus3: true
    })
  },
  bindKeyInput3: function (e) {
    this.setData({
      sksj: e.detail.value
    })
  },
  bindButtonTap4: function () {
    this.setData({
      focus4: true
    })
  },
  bindKeyInput4: function (e) {
    this.setData({
      didian: e.detail.value
    })
  },
  bindButtonTap5: function () {
    this.setData({
      focus5: true
    })
  },
  bindKeyInput5: function (e) {
    this.setData({
      skcd: e.detail.value
    })
  },
  bindButtonTap6: function () {
    this.setData({
      focus5: true
    })
  },
  bindKeyInput6: function (e) {
    this.setData({
      startzhou: e.detail.value
    })
  },
  bindButtonTap7: function () {
    this.setData({
      focus6: true
    })
  },
  bindKeyInput7: function (e) {
    this.setData({
      endzhou: e.detail.value
    })
  },
  
  //用于保存修改的数据
  save:function(){
    this.data.kcxx=this.data.kcmc + "  "+ this.data.didian + "  " + this.data.startzhou + "~" + this.data.endzhou + "周"
    var list={'xqj':this.data.xqj,'sksj':this.data.sksj,'skcd':this.data.skcd,'startzhou':this.data.startzhou,'endzhou':this.data.endzhou,'kcxx':this.data.kcxx}
    console.log(list)
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
          this.setData({openid:res1.result.openid})
        timeTable.where({
          openid:res1.result.openid
        }).count().then(res2=>{
          if(res2.total==1)
          {
            timeTable.where({
              openid:res1.result.openid
            }).get().then(res3=>{
              this.setData({
                wlist:res3.data[0].wlist[0]
              }),
              this.data.wlist.push(list)
              var temp=[]
              temp.push(this.data.wlist)
              timeTable.where({
                openid:res1.result.openid
              }).update({
                data:{wlist:temp},
                success:res4=>{wx.switchTab({
                  url: '../timeable/timeable'
                })},
                fail:res5=>{console.log("error")}
              })
            })
          }
          else if(res2.total==0)
          {
            this.data.wlist.push(list)
              var temp=[]
              temp.push(this.data.wlist)
              
              console.log(temp)
              timeTable.add({
                data:{wlist:temp,openid:this.data.openid},
                success:res4=>{
                  wx.switchTab({
                    url: '../timeable/timeable',
                  })
                },
                fail:res5=>{console.log("失败")}
              })
          }
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
