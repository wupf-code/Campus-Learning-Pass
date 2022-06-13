// class/pages/choices/addquestions/addquestions.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title:'',
    groupid:'',
    homeworknum:'',
    choicenum:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    index:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      groupid:options.groupid
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  addtitle(e){
    this.setData({
      title:e.detail.value
    })
  },
  picknum(e){
    this.setData({
      index: e.detail.value
    })
  },
  toaddchoices(e){
    if(this.data.title.length==0){
      wx.showToast({
        title: '请输入标题',
        icon:'error'
      })
    }
    else{
      wx.navigateTo({
        url: '../addchoices/addchoices?groupid=' + this.data.groupid+'&num='+(parseInt(this.data.index)+1)+'&title='+this.data.title,
      })
    }
  }
})