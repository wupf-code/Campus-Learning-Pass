// class/pages/choices/choice/choice.js
var WebIM = require('../../../../utils/WebIM.js')
var WebIM = WebIM.default
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const choices_question = db.collection('choices_question')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    groupid:'',
    mytype:'',
    questions:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    that.setData({
      groupid:options.groupid,
      mytype:options.type
    })
    choices_question.where({
      groupid:options.groupid
    }).get().then(res=>{
      that.setData({
        questions:res.data.reverse()
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that=this
    var options = {
        pageNum: 1,
        pageSize: 100,
        groupId: that.data.groupid,
        success: function (resp) { 
          console.log(resp.data)
          wx.cloud.callFunction({
            name:'getUserInfo',
            complete:res1=>{
              for(let i=0;i<resp.data.length;i++){
                if(resp.data[i].owner!=undefined){
                  if(resp.data[i].owner.toLowerCase()==res1.result.openid.toLowerCase()){
                    that.setData({
                      mytype:'owner'
                    })
                  }
                }
                else if(resp.data[i].member.toLowerCase()==res1.result.openid.toLowerCase()){
                  that.setData({
                    mytype:'member'
                  })
                }
              }
            }
          })
        },
        error: function(e){}
    };
    WebIM.conn.listGroupMember(options);
  },

  addquestion(e){
    wx.navigateTo({
      url: '../addquestions/addquestions?groupid=' + this.data.groupid,
    })
  },
  tohomework(e){
    // this.setData({
    //   mytype:'user'
    // })
    if(this.data.mytype=='owner'){
      wx.navigateTo({
        url: '../choicehomework_teacher/choicehomework_teacher?groupid='  + this.data.groupid+'&time='+e.currentTarget.dataset.qs.time+'&date='+e.currentTarget.dataset.qs.date,
      })
    }
    else{
      wx.navigateTo({
        url: '../choicehomework_student_prepare/choicehomework_student_prepare?groupid=' + this.data.groupid+'&time='+e.currentTarget.dataset.qs.time+'&date='+e.currentTarget.dataset.qs.date,
      })
    }
  }
})