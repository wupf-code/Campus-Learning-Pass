// pages/set/set.js
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
    kcmc: "",
    didian:"",
    startzhou:"",
    endzhou:"",
    kcxx:"",
    index:"",
    wlist:[]
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
      didian: e.detail.value
    })
  },
  bindButtonTap3: function () {
    this.setData({
      focus3: true
    })
  },
  bindKeyInput3: function (e) {
    this.setData({
      skcd: e.detail.value
    })
  },
  bindButtonTap4: function () {
    this.setData({
      focus4: true
    })
  },
  bindKeyInput4: function (e) {
    this.setData({
      startzhou: e.detail.value
    })
  },
  bindButtonTap5: function () {
    this.setData({
      focus5: true
    })
  },
  bindKeyInput5: function (e) {
    this.setData({
      endzhou: e.detail.value
    })
  },
 Del:function(){
  wx.cloud.callFunction({
    name:'getUserInfo',
    complete:res1=>{
      timeTable.where({
        openid:res1.result.openid
      }).get().then(res=>{
        this.setData({
          wlist:res.data[0].wlist[0]
        })
        console.log(this.data.wlist)
        this.data.wlist.splice(this.data.index,1)
        console.log(this.data.wlist)
        let list=[]
        list.push(this.data.wlist)
        console.log(list)
        timeTable.where({
          openid:res1.result.openid
        }).update({
          data:{wlist:list},
          success:res4=>{wx.switchTab({
            url: '../timeable/timeable'
          })},
          fail:res5=>{console.log("error")}
        })
      })
      }
    })
 },
  //用于保存修改的数据
  save:function(){
    
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
        timeTable.where({
          openid:res1.result.openid
        }).get().then(res=>{
          this.setData({
            wlist:res.data[0].wlist[0]
          })
          this.data.wlist[this.data.index].kcxx=this.data.kcmc + "  "+ this.data.didian + "  " + this.data.startzhou + "~" + this.data.endzhou + "周"
            this.data.wlist[this.data.index].skcd=this.data.skcd
            this.data.wlist[this.data.index].startzhou=this.data.startzhou
            this.data.wlist[this.data.index].endzhou=this.data.endzhou
          let list=[]
          list.push(this.data.wlist)
          console.log(list)
          timeTable.where({
            openid:res1.result.openid
          }).update({
            data:{wlist:list},
            success:res4=>{wx.switchTab({
              url: '../timeable/timeable'
            })},
            fail:res5=>{console.log("error")}
          })
        })
        }
      })
      
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   this.setData({
     index:options.id,
   })
    console.log(options)
    console.log(this.data.index)
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
