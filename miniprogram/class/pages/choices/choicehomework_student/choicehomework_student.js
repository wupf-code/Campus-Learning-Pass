// class/pages/choices/choicehomework_student/choicehomework_student.js
const db = wx.cloud.database()
const _ = db.command
const userInfo = db.collection('userInfo')
const choices_question = db.collection('choices_question')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    groupid:'',
    time:'',
    date:'',
    index:1,
    questions:[],
    studentanswer: [],
    questiontype:'',
    judge:'1',
    choice:[],
    radio:'',
    num:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    choices_question.where({
      groupid:options.groupid,
      time:options.time,
      date:options.date
    }).get().then(res=>{
      let questiontype=''
      if(res.data[0].questions[1].questiontype=='0'){
        questiontype='判断题'
      }
      else if(res.data[0].questions[1].questiontype=='1'&&res.data[0].questions[1].choice.length==1){
        questiontype='单选题'
      }
      else{
        questiontype='多选题'
      }
      that.setData({
        questions:res.data[0].questions,
        groupid:res.data[0].groupid,
        time:res.data[0].time,
        date:res.data[0].date,
        questiontype:questiontype,
        num:res.data[0].questionnum
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  changejudge(e){
    this.setData({
      judge:e.detail.value,
    })
  },

  Changeradio(e){
    this.setData({
      radio: e.detail,
    });
  },

  changechoices(e){
    this.setData({
      choice: e.detail,
    })
  },

  lastquestion(e){
    var that=this
    let index=that.data.index
    let studentanswer=that.data.studentanswer
    let x=studentanswer.length
    let questiontype=''
    if(that.data.questiontype=='单选题'){
      studentanswer[index]=that.data.radio
    }
    else if(that.data.questiontype=='多选题'){
      studentanswer[index]=that.data.choice
    }
    else{
      studentanswer[index]=that.data.judge
    }
    index=index-1
    if(that.data.questions[index].questiontype=='0'){
      questiontype='判断题'
    }
    else if(that.data.questions[index].questiontype=='1'&&that.data.questions[index].choice.length==1){
      questiontype='单选题'
    }
    else{
      questiontype='多选题'
    }
    that.setData({
      studentanswer:studentanswer,
      index:index,
      questiontype:'',
      judge:studentanswer[index],
      choice:studentanswer[index],
      radio:studentanswer[index],
      questiontype:questiontype
    })
  },

  nextquestion(e){
    var that=this
    let index=that.data.index
    let studentanswer=that.data.studentanswer
    let x=studentanswer.length
    let questiontype=''
    if(that.data.questiontype=='单选题'){
      studentanswer[index]=that.data.radio
    }
    else if(that.data.questiontype=='多选题'){
      studentanswer[index]=that.data.choice
    }
    else{
      studentanswer[index]=that.data.judge
    }
    index=index+1
    if(that.data.questions[index].questiontype=='0'){
      questiontype='判断题'
    }
    else if(that.data.questions[index].questiontype=='1'&&that.data.questions[index].choice.length==1){
      questiontype='单选题'
    }
    else{
      questiontype='多选题'
    }
    if(studentanswer.length==x){
        that.setData({
          studentanswer:studentanswer,
          index:index,
          questiontype:'',
          judge:studentanswer[index],
          choice:studentanswer[index],
          radio:studentanswer[index],
          questiontype:questiontype
        })
      }
    else{
      that.setData({
        studentanswer:studentanswer,
        index:index,
        questiontype:'',
        judge:'1',
        choice:'',
        radio:'',
        questiontype:questiontype
      })
    }
  },

  //上一题
  isempty_up(e){
    if(this.data.questiontype=='单选题'){
      if(this.data.radio==''){
        wx.showToast({
          title: '答案不能为空',
          icon:'error'
        })
      }
      else{
        this.lastquestion()
      }
    }
    else if(this.data.questiontype=='多选题'){
      if(this.data.choice==''){
        wx.showToast({
          title: '答案不能为空',
          icon:'error'
        })
      }
      else{
        this.lastquestion()
      }
    }
    else{
      this.lastquestion()
    }
  },
  //下一题
  isempty_down(e){
    if(this.data.questiontype=='单选题'){
      if(this.data.radio==''){
        wx.showToast({
          title: '答案不能为空',
          icon:'error'
        })
      }
      else{
        this.nextquestion()
      }
    }
    else if(this.data.questiontype=='多选题'){
      if(this.data.choice==''){
        wx.showToast({
          title: '答案不能为空',
          icon:'error'
        })
      }
      else{
        this.nextquestion()
      }
    }
    else{
      this.nextquestion()
    }
  },
  submit(e){
    if(this.data.questiontype=='单选题'){
      if(this.data.radio==''){
        wx.showToast({
          title: '答案不能为空',
          icon:'error'
        })
      }
      else{
        this.submit_()
      }
    }
    else if(this.data.questiontype=='多选题'){
      if(this.data.choice==''){
        wx.showToast({
          title: '答案不能为空',
          icon:'error'
        })
      }
      else{
        this.submit_()
      }
    }
    else{
      this.submit_()
    }
  },
  submit_(e){
    var that=this
    let index=that.data.index
    let studentanswer=that.data.studentanswer
    if(that.data.questiontype=='单选题'){
      studentanswer[index]=that.data.radio
    }
    else if(that.data.questiontype=='多选题'){
      studentanswer[index]=that.data.choice
    }
    else{
      studentanswer[index]=that.data.judge
    }
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
        choices_question.where({
          groupid:that.data.groupid,
          time:that.data.time,
          date:that.data.date
        }).update({
          data:{
            answer:_.push({answer:studentanswer,studentid:res1.result.openid})
          }
        }).then(res2=>{
          wx.navigateBack({
            delta: 2,
          })
          wx.showToast({
            title: '提交成功',
            icon:'success'
          })
        })
      }
    })
  }
})