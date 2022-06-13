// class/pages/choices/choicehomework_student_prepare/choicehomework_student_prepare.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const choices_question = db.collection('choices_question')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    questions:[],
    havedone:false,
    answer:[],
    rightnum:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
        choices_question.where({
          groupid:options.groupid,
          time:options.time,
          date:options.date
        }).get().then(res2=>{
          for(let i=0;i<res2.data[0].answer.length;i++){
            if(res1.result.openid==res2.data[0].answer[i].studentid){
              that.setData({
                havedone:true,
                answer:res2.data[0].answer[i].answer
              })
              break
            }
          }
          that.setData({
            questions:res2.data[0]
          })
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (){
    wx.showLoading({
      title: '请稍候',
      mask:true
    })
    setTimeout(() => {
      var answer=this.data.answer
      var questions=this.data.questions.questions
      var rightnum=0
      setTimeout(() => {
        this.setData({
          rightnum:rightnum
        })
        wx.hideLoading()
      }, 1000);
      if(this.data.havedone){
        for(let i=1;i<questions.length;i++){
          if(questions[i].questiontype=='0'){
            if(questions[i].judge==answer[i]){
              rightnum+=1
            }
          }
          else{
            if(answer[i].length==1){
              if(questions[i].choice[0]==answer[i]){
                rightnum+=1
              }
            }
            else{
              if(questions[i].choice.sort().join('')==answer[i].sort().join('')){
                rightnum+=1
              }
            }
          }
        }
      }
    }, 1000);
  },
  begin(e){
    wx.navigateTo({
      url: '../choicehomework_student/choicehomework_student?groupid=' + this.data.questions.groupid+'&time='+this.data.questions.time+'&date='+this.data.questions.date
    })
  }
})