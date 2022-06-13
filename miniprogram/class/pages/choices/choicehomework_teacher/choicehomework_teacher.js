// class/pages/choices/choicehomework_student_prepare/choicehomework_student_prepare.js
var WebIM = require('../../../../utils/WebIM.js')
var WebIM = WebIM.default
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const classmember=db.collection('classmember')
const choices_question = db.collection('choices_question')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    questions:[],
    showscore:0,
    nonedone:false,
    errornum:[['','',[]]],
    averageerrornum:0,
    shownosubmit:false,
    showsubmit:false,
    groupid:''
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
          that.setData({
            questions:res2.data[0],
            groupid:options.groupid
          })
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that=this
    wx.showLoading({
      title: '请稍后',
      mask:true
    })
    var errornum=[]
    setTimeout(() => {
      wx.hideLoading()
      var averageerrornum=0
      for(let i=0;i<errornum.length;i++){
        averageerrornum+=errornum[i][1]
      }
      averageerrornum/=errornum.length
      that.setData({
        errornum:errornum,
        averageerrornum:averageerrornum
      })
      console.log(errornum)
    }, 2000);
    setTimeout(() => {
      var answer=that.data.questions.answer
      var questions=that.data.questions.questions
      if(answer.length==0){
        that.setData({
          nonedone:true
        })
      }
      else{
        for(let i=0;i<answer.length;i++){
          errornum[i]=[]
          errornum[i][0]=answer[i].studentid
          errornum[i][1]=0
          errornum[i][2]=[]
          for(let j=1;j<questions.length;j++){
            errornum[i][2][j]=0
            if(questions[j].questiontype=='0'){
              if(questions[j].judge!=answer[i].answer[j]){
                errornum[i][2][j]+=1
                errornum[i][1]+=1
              }
            }
            else{
              if(answer[i].answer[j].length==1){
                if(questions[j].choice[0]!=answer[i].answer[j]){
                  errornum[i][2][j]+=1
                  errornum[i][1]+=1
                }
              }
              else{
                if(questions[j].choice.sort().join('')!=answer[i].answer[j].sort().join('')){
                  errornum[i][2][j]+=1
                  errornum[i][1]+=1
                }
              }
            }
          }
        }
      }
    }, 1000);
  },
  shownosubmit(e){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var that=this
    var errornum=that.data.errornum
    var options = {
        pageNum: 1,
        pageSize: 100,
        groupId: that.data.groupid,
        success: function (resp) { 
          var notsubmit=[]
          for(let i=0;i<resp.data.length;i++){
            let judge=0
            if(resp.data[i].member!=undefined){
              for(let j=0;j<errornum.length;j++){
                if(errornum[j][0].toLowerCase()==resp.data[i].member.toLowerCase()){
                  judge+=1
                }
              }
              if(judge==0){
                  var count=0
                  classmember.where({
                    groupid:that.data.groupid
                  }).get().then(res1=>{
                    if(res1.data.length!=0){
                      for(let j=0;j<res1.data[0].studentname.length;j++){
                        if(res1.data[0].studentname[j][0].toLowerCase()==resp.data[i].member.toLowerCase()){
                          notsubmit.push(res1.data[0].studentname[j][1])
                          break;
                        }
                      }
                    }
                    if(count==0){
                      userInfo.where({
                        _openid:new db.RegExp({
                          regexp: resp.data[i].member,
                          options: 'i',
                        })
                      }).get().then(res2=>{
                        notsubmit.push(res2.data[0].nickName)
                      })
                    }
                  })
                }
              }
            }
            setTimeout(() => {
              wx.hideLoading()
              that.setData({
                shownosubmit:true,
                notsubmit:notsubmit
              })
            }, 2000);
        },
        error: function(e){}
    };
    WebIM.conn.listGroupMember(options);
  },

  showsubmit(e){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var that=this
    var errornum=that.data.errornum
    for(let i=0;i<errornum.length;i++){
      var count=0
      classmember.where({
        groupid:that.data.groupid
      }).get().then(res1=>{
        if(res1.data.length!=0){
          for(let j=0;j<res1.data[0].studentname.length;j++){
            if(res1.data[0].studentname[j][0].toLowerCase()==errornum[i][0].toLowerCase()){
              errornum[i][0]=res1.data[0].studentname[j][1]
              break;
            }
          }
        }
        if(count==0){
          userInfo.where({
            _openid:new db.RegExp({
              regexp: errornum[i][0],
              options: 'i',
            })
          }).get().then(res2=>{
            errornum[i][0]=res2.data[0].nickName
          })
        }
      })
      setTimeout(() => {
        wx.hideLoading()
        this.setData({
          errornum:errornum,
          showsubmit:true
        })
        console.log(errornum)
      }, 2000);
    }
  }
})