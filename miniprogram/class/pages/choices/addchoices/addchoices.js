// class/pages/choices/addchoices/addchoices.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const choices_question = db.collection('choices_question')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    groupid:'',
    num:0,
    totaltitle:'',
    questiontitle:'',
    index:1,
    questions:[],
    questiontype:'1',
    judge:'1',
    choice: [],
    Acontent:'',
    Bcontent:'',
    Ccontent:'',
    Dcontent:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      groupid:options.groupid,
      num:options.num,
      totaltitle:options.title,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  changequestiontype(e){
    this.setData({
      questiontype:e.detail.value,
    })
  },
  changejudge(e){
    this.setData({
      judge:e.detail.value,
    })
  },
  addquestiontitle(e){
    this.setData({
      questiontitle:e.detail.value
    })
  },
  addchoicecontent(e){
    var content=e.detail.value
    if(e.currentTarget.dataset.name=='A'){
      this.setData({
        Acontent:content
      })
    }
    if(e.currentTarget.dataset.name=='B'){
      this.setData({
        Bcontent:content
      })
    }
    if(e.currentTarget.dataset.name=='C'){
      this.setData({
        Ccontent:content
      })
    }
    if(e.currentTarget.dataset.name=='D'){
      this.setData({
        Dcontent:content
      })
    }
  },
  lastquestion(e){
    var that=this
    if(this.data.questiontype=='1'){
      if(this.data.questiontitle.length==0||this.data.Acontent.length==0||this.data.Bcontent.length==0||this.data.Ccontent.length==0||this.data.Dcontent.length==0||this.data.choice.length==0){
        wx.showToast({
          title: '不能为空',
          icon:'error'
        })
      }
      else{
        var options={
          question:that.data.questiontitle,
          questiontype:that.data.questiontype,
          judge:that.data.judge,
          A:that.data.Acontent,
          B:that.data.Bcontent,
          C:that.data.Ccontent,
          D:that.data.Dcontent,
          choice:that.data.choice
        }
        var questions=that.data.questions
        questions[that.data.index]=options
        let index=this.data.index-1
        this.setData({
          index:index,
          questions:questions,
          judge:that.data.questions[that.data.index-1].judge,
          questiontype:that.data.questions[that.data.index-1].questiontype,
          Acontent:that.data.questions[that.data.index-1].A,
          Bcontent:that.data.questions[that.data.index-1].B,
          Ccontent:that.data.questions[that.data.index-1].C,
          Dcontent:that.data.questions[that.data.index-1].D,
          choice:that.data.questions[that.data.index-1].choice,
          questiontitle:that.data.questions[that.data.index-1].question
        })
      }
    }
    else{
      if(this.data.questiontitle.length==0){
        wx.showToast({
          title: '不能为空',
          icon:'error'
        })
      }
      else{
        var options={
          question:that.data.questiontitle,
          questiontype:that.data.questiontype,
          judge:that.data.judge,
          A:that.data.Acontent,
          B:that.data.Bcontent,
          C:that.data.Ccontent,
          D:that.data.Dcontent,
          choice:that.data.choice
        }
        var questions=that.data.questions
        questions[that.data.index]=options
        let index=this.data.index-1
        this.setData({
          index:index,
          questions:questions,
          questiontype:that.data.questions[that.data.index-1].questiontype,
          questiontitle:that.data.questions[that.data.index-1].question,
          judge:that.data.questions[that.data.index-1].judge,
          Acontent:that.data.questions[that.data.index-1].A,
          Bcontent:that.data.questions[that.data.index-1].B,
          Ccontent:that.data.questions[that.data.index-1].C,
          Dcontent:that.data.questions[that.data.index-1].D,
          choice:that.data.questions[that.data.index-1].choice
        })
      }
    }
  },

  nextquestion(e){
    var that=this
    console.log(that.data.questions)
    if(this.data.questiontype=='1'){
      if(this.data.questiontitle.length==0||this.data.Acontent.length==0||this.data.Bcontent.length==0||this.data.Ccontent.length==0||this.data.Dcontent.length==0||this.data.choice.length==0){
        wx.showToast({
          title: '不能为空',
          icon:'error'
        })
      }
      else{
        var options={
          question:that.data.questiontitle,
          questiontype:that.data.questiontype,
          judge:that.data.judge,
          A:that.data.Acontent,
          B:that.data.Bcontent,
          C:that.data.Ccontent,
          D:that.data.Dcontent,
          choice:that.data.choice
        }
        var questions=that.data.questions
        questions[that.data.index]=options
        let index=this.data.index+1
        if(that.data.questions.length>index){
          this.setData({
            index:index,
            questions:questions,
            judge:that.data.questions[that.data.index+1].judge,
            questiontype:that.data.questions[that.data.index+1].questiontype,
            Acontent:that.data.questions[that.data.index+1].A,
            Bcontent:that.data.questions[that.data.index+1].B,
            Ccontent:that.data.questions[that.data.index+1].C,
            Dcontent:that.data.questions[that.data.index+1].D,
            choice:that.data.questions[that.data.index+1].choice,
            questiontitle:that.data.questions[that.data.index+1].question
          })
        }
        else{
          this.setData({
            index:index,
            questions:questions,
            judge:'1',
            questiontype:'1',
            Acontent:'',
            Bcontent:'',
            Ccontent:'',
            Dcontent:'',
            choice:'',
            questiontitle:'',
          })
        }
      }
    }
    else{
      if(this.data.questiontitle.length==0){
        wx.showToast({
          title: '不能为空',
          icon:'error'
        })
      }
      else{
        var options={
          question:that.data.questiontitle,
          questiontype:that.data.questiontype,
          judge:that.data.judge,
          A:that.data.Acontent,
          B:that.data.Bcontent,
          C:that.data.Ccontent,
          D:that.data.Dcontent,
          choice:that.data.choice
        }
        var questions=that.data.questions
        questions[that.data.index]=options
        let index=this.data.index+1
        if(that.data.questions.length>index){
          this.setData({
            questions:questions,
            judge:that.data.questions[that.data.index+1].judge,
            questiontype:that.data.questions[that.data.index+1].questiontype,
            Acontent:that.data.questions[that.data.index+1].A,
            Bcontent:that.data.questions[that.data.index+1].B,
            Ccontent:that.data.questions[that.data.index+1].C,
            Dcontent:that.data.questions[that.data.index+1].D,
            choice:that.data.questions[that.data.index+1].choice,
            questiontitle:that.data.questions[that.data.index+1].question,
            index:index
          })
        }
        else{
          this.setData({
            index:index,
            questions:questions,
            judge:'1',
            questiontype:'1',
            Acontent:'',
            Bcontent:'',
            Ccontent:'',
            Dcontent:'',
            choice:'',
            questiontitle:'',
          })
        }
      }
    }
  },
  changechoices(e){
    this.setData({
      choice: e.detail,
    })
  },
  submit(e){
    var that=this
    if(this.data.questiontype=='1'){
      if(this.data.questiontitle.length==0||this.data.Acontent.length==0||this.data.Bcontent.length==0||this.data.Ccontent.length==0||this.data.Dcontent.length==0||this.data.choice.length==0){
        wx.showToast({
          title: '不能为空',
          icon:'error'
        })
      }
      else{
        var options={
          question:that.data.questiontitle,
          questiontype:that.data.questiontype,
          judge:that.data.judge,
          A:that.data.Acontent,
          B:that.data.Bcontent,
          C:that.data.Ccontent,
          D:that.data.Dcontent,
          choice:that.data.choice
        }
        var questions=that.data.questions
        questions[that.data.index]=options
        this.setData({
          questions:questions
        })

        var timestamp = Date.parse(new Date());
        var date = new Date(timestamp);
        var Y =date.getFullYear();
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var h = date.getHours()
        var m = date.getMinutes()
        var s = date.getSeconds()
        choices_question.add({
          data:{
            title:that.data.totaltitle,
            questionnum:that.data.num,
            groupid:that.data.groupid,
            questions:that.data.questions,
            date:Y+'-'+M+'-'+D,
            time:h+':'+m+':'+s,
            answer:[]
          },
        }).then(res=>{
          console.log(res)
          wx.navigateBack({
            delta: 2,
          })
          wx.showToast({
            title: '发布成功',
            icon:'success'
          })
        })
      }
    }
    else{
      if(this.data.questiontitle.length==0){
        wx.showToast({
          title: '不能为空',
          icon:'error'
        })
      }
      else{
        var options={
          question:that.data.questiontitle,
          questiontype:that.data.questiontype,
          judge:that.data.judge,
          A:that.data.Acontent,
          B:that.data.Bcontent,
          C:that.data.Ccontent,
          D:that.data.Dcontent,
          choice:that.data.choice
        }
        var questions=that.data.questions
        questions[that.data.index]=options
        var timestamp = Date.parse(new Date());
        var date = new Date(timestamp);
        var Y =date.getFullYear();
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var h = date.getHours()
        var m = date.getMinutes()
        var s = date.getSeconds()
        choices_question.add({
          data:{
            title:that.data.totaltitle,
            questionnum:that.data.num,
            groupid:that.data.groupid,
            questions:that.data.questions,
            date:Y+'-'+M+'-'+D,
            time:h+':'+m+':'+s,
            answer:[]
          },
        }).then(res=>{
          console.log(res)
          wx.navigateBack({
            delta: 2,
          })
          wx.showToast({
            title: '发布成功',
            icon:'success'
          })
        })
      }
    }
  }
})