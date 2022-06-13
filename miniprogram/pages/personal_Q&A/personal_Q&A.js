// pages/personal_Q&A/personal_Q&A.js
const db=wx.cloud.database()
const userInfo=db.collection('userInfo')
const question=db.collection('question')
Page({
  /**
   * 页面的初始数据
  */
  data: {
  openid:"",//当前登录用户的openid
  question:[],//当前用户提问的所有记录
  answer:[],//回答
  questioncontent:[],//当前用户所有问题的问题内容前60个字
  deletequestion:'',
  deleteanswer:"",
  userInfo: {},
  hasUserInfo: false,
  isShown:false,
  isShown1:false,
  ischufa:false,
    tabs:[
      {
          id:0,
          value:"我的提问",
          isactive:true
      },
      {
          id:1,
          value:"我的回答",
          isactive:false
      }
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name:'getUserInfo',
      complete:res1=>{
        userInfo.where({
          _openid:res1.result.openid
        }).count().then(res2=>{
          if(res2.total==1) {userInfo.where({
            _openid:res1.result.openid
          })
          .get().then(res3=>{
             this.setData({
               userInfo:res3.data[0],
               hasUserInfo:true
             })
          })
        }
        })
      }
    })
  },
  onShow:function(option){
    this.setData({
      question:[],
      answer:[],
      questioncontent:[]
    })
  // 先获取当前登录用户的openid
  wx.cloud.callFunction({
    name:'getUserInfo',
    complete:res=>{
    this.setData({
      openid:res.result.openid
    })
    // 根据用户_openid获取question中问题内容 问题照片 问题码
    question.where({
    _openid:this.data.openid
    }).get().then(res=>{
      // 可以直接获取当前用户提问的所有信息
    this.setData({
    question:res.data
    })
    //  获取问题内容前60个字
      let questioncontent=this.data.questioncontent
        for(let i=0;i<res.data.length;i++)
        questioncontent.push(res.data[i].question.split('&hc').join('\n').substring(0, 60) + '...')
        this.setData({
          questioncontent
        })
        // 然后获取当前用户的回答的所有信息
        question.where({
          comment:{
          _openid:this.data.openid
          }
        }).get().then(res=>{
          // 获取到了包含当前用户评论过的所有问题记录
          var question=res.data
          // 将获取到的数据重新整理一下 即变成每个元素都是包含问题码 问题内容 评论图片 评论内容的数组的二维数组：[[],[],[]....]
          for(let i=0;i<question.length;i++){{
            for(let j=0;j<question[i].comment.length;j++)
            if(question[i].comment[j]._openid==this.data.openid){
            let array=[]
            array.push(question[i].question_id)
            array.push(question[i].comment[j].photo_url)
            array.push(question[i].comment[j].question.split("&hc").join('\n').substring(0,60)+'...')
            array.push(question[i].comment[j].comment_id)
            this.setData({
            answer:this.data.answer.concat([array])//注意这里的赋值方式
            })
            }
          }
        }
      })
    })
  }
})
},

  toregister(e){
    wx.switchTab({
      url: '../personal/personal'
    })
  },

  handletabsitemchange(e){
    const index=e.detail.index;
    let tabs=this.data.tabs;
    tabs.forEach((v,i)=>{i===index?v.isactive=true:v.isactive=false});
    this.setData({
      tabs
    })
  },

  toquestion(e){
    var i=e.currentTarget.dataset.item
    if(!this.data.ischufa)
    wx.navigateTo({
      url: '../question/question?question_id='+i
    })
  },
  toanswer(e){
    var i=e.currentTarget.dataset.item[0]
    if(!this.data.ischufa)
    wx.navigateTo({
      url: '../question/question?question_id='+i
    })
  },
  deletequestion(e){
    var i=e.currentTarget.dataset.item
    this.setData({
      ischufa:true,
      isShown:true,
      deletequestion:i
    })
  },
  deleteanswer(e){
    var i=e.currentTarget.dataset.item
    this.setData({
      ischufa:true,
      isShown1:true,
      deleteanswer:i
    })

  },
  closedialog(e) {
    this.setData({
      ischufa:false,
      isShown: false,
      isShown1:false,
      deletequestion:'',
      deleteanswer:''
    })
  },

  allowdeletequestion(e){
    this.setData({
      isShown:false,
      ischufa:false
    })
    question.where({
      question_id:this.data.deletequestion
    }).get().then(res=>{
      console.log(res)
      var delete_url=res.data[0].photo_url
      for(let i=0;i<delete_url.length;i++)
      {
        wx.cloud.deleteFile({
          fileList:[delete_url[i]],
          complete(res){
          },
        })
      }
      var delete_comment=res.data[0].comment
      console.log(delete_comment)
      for(let i=0;i<delete_comment.length;i++)
        for(let j=0;j<delete_comment[i].photo_url.length;j++)
        {
          wx.cloud.deleteFile({
            fileList:[delete_comment[i].photo_url[j]],
            complete(res){
            },
          })
        }
      question.where({
        question_id:this.data.deletequestion
      }).remove()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      this.onShow()
    })
  }, 

  allowdeleteanswer(e){
    this.setData({
      isShown1:false,
      ischufa:false
    })
    question.where({
      question_id:this.data.deleteanswer[0]
    }).get().then(res=>{
      var comment=res.data[0].comment
      var comment_temp=[]
      for(let i=0;i<comment.length;i++)
      {
        if(comment[i].comment_id==this.data.deleteanswer[3])
        {
          for(let j=0;j<comment[i].photo_url.length;j++)
          {
            wx.cloud.deleteFile({
              fileList:[comment[i].photo_url[j]],
              complete(res){
              },
            })
          }
        }
        else{
          comment_temp.push(comment[i])
        }
      }
      console.log(comment_temp)
      question.where({
        question_id:this.data.deleteanswer[0]
      }).update({
        data:{comment:comment_temp},
        success:res=>{
          console.log(res.data[0].comment)
        },
        fail:res=>{
          console.log(res)
        }
      })
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      this.onShow()
    })
  },
    // 用于回答界面
  selectquestion1(e){
  // 点击触发的currentTarget事件
  wx.navigateTo({
    url: '../question/question?question_id='+e.currentTarget.dataset.item[0]
  })
  },
})