// pages/question/question.js
const db=wx.cloud.database()
const question=db.collection('question')
const userInfo=db.collection('userInfo')
const _= db.command
Page({
  /**
   * 页面的初始数据
   */
  data: {
    profile_url:"",//用户头像
    photo_url:"",//文章对应的照片,
    inputMessage:'',
    name:"",
    question:"",
    questionid:"",
    comment_id:'',
    comment:[],
    commentphoto:[],
    commentphoto1:[],
    hasdz:false,
    hasUserInfo:false,
    isShown:false,
    openid:'',
    Height:"",
    commentuser:[]
  },
  imgHeight(e){
  var a=wx.getSystemInfoSync().windowWidth
  var b=e.detail.width
  var c=e.detail.height
  var d=a*c/b+"px"
  this.setData({Height:d})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var questionid=options.question_id
    this.setData({
      questionid:questionid
    })
  wx.cloud.callFunction({
    name:'getUserInfo',
    complete:res1=>{
      userInfo.where({
        _openid:res1.result.openid
      }).count().then(res2=>{
        if(res2.total==1) {
          userInfo.where({
            _openid:res1.result.openid
          })
          .get().then(res3=>{
           this.setData({
             openid:res3.data[0]._openid,
             hasUserInfo:true
            })
          })
        }
      })
    }
  })
},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      // 根据文章码获得question数据库中的_openid和文章标题 文章正文
      question.where({
        question_id:this.data.questionid
      })
      .get().then(res=>{
      this.setData({
        photo_url:res.data[0].photo_url,
        question:res.data[0].question.split('&hc').join('\n'),
        comment:res.data[0].comment
      })
      userInfo.where({
        _openid: res.data[0]._openid
      })
      .get().then(res => {
        this.setData({
          name: res.data[0].nickName,
          profile_url: res.data[0].avatarUrl
        })
      })
      // 根据刚才获得的_openid在数据库：userInfo中找到对应的用户头像和昵称
      for(let i=0;i<this.data.comment.length;i++){
        userInfo.where({
          _openid:this.data.comment[i]._openid
        })
        .get().then(res=>{
          let array=[]
          array[0]=res.data[0].avatarUrl
          array[1]=res.data[0].nickName
          let commentuser=this.data.commentuser
          this.data.commentuser[i]=array
          this.setData({
            commentuser
          })
        })
      }
    })
  },
  closedialog(e){
    this.setData({
      isShown:false
    })
  },
  shouquan(e){
    this.setData({
      isShown:false      
    })
    wx.switchTab({
      url: '../personal/personal'
    })
  },
  lookimage(e)
  {
    wx.previewImage({
      current:e.currentTarget.dataset.item, //当前显示图片的http链接
      urls: this.data.photo_url// 需要预览的图片http链接列表
    })
  },
  lookimage_(e)
  {
    wx.previewImage({
      current:e.currentTarget.dataset.item, //当前显示图片的http链接
      urls: e.currentTarget.dataset.item.photo_url// 需要预览的图片http链接列表
    })
  },
  //点击出现输入框
  showInput() {
    if(this.data.hasUserInfo){
      this.setData({
        showInput: true
      })
    }
    else{
      this.setData({
        isShown: true
      })
    }
  },
  // 评论输入框
  bindInputMsg(e){
    this.setData({
      inputMessage: e.detail.value
    })
  },
  chooseimage(e){
    this.setData({
      commentphoto:[],
      commentphoto1:[]
    })
    wx.chooseImage({
      count: 2,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res=> {
        // tempFilePath可以作为img标签的src属性显示图片
        this.setData({
          commentphoto:res.tempFilePaths
        })
      }
    })
  },
  uploadcomment(e){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    this.setData({
      showInput: false
    })
    // 为了防止上传至云端的文件路径重复
    var randomstring1=""
    let txt = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
    for(let i = 0; i < 4; i++) {
      let randomnum = Math.floor(Math.random() * 36);
      randomstring1 += txt[randomnum];
    }
    this.setData({
      comment_id:this.data.questionid+'_'+randomstring1
    })
    for (var i = 0; i < this.data.commentphoto.length; i++) {
      wx.cloud.uploadFile({
        // console.log(randomstring)
          cloudPath:'cm'+this.data.comment_id+'_'+i+'.png',
          filePath: this.data.commentphoto[i], // 文件路径
        success: res => {
          // get resource ID
         this.setData({
           commentphoto1:this.data.commentphoto1.concat(res.fileID)
          })
        },
        fail: err => {
          // handle error
          this.data.commentphoto1.splice(i,1)
        }
      })
    }
    this.add()
  },
  add(e){
    setTimeout(() =>{
      let array={
        '_openid':this.data.openid,'question':this.data.inputMessage,'photo_url':this.data.commentphoto1,'comment_id':this.data.comment_id
    }
      let comment=this.data.comment
      comment[comment.length]=array
      question.where({
        question_id:this.data.questionid
      }).
      update({
        data: {
          comment
        },
      })
      .then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
          icon: 'success'
         })
        })
        this.setData({
          commentphoto:[],
          commentphoto1:[]
        })
        this.onShow()
      },2000)
  }
})