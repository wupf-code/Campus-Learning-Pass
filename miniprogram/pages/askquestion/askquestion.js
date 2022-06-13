// pages/askquestion/askquestion.js
// pages/personal_article_write/personal_article_write.js
const db=wx.cloud.database()
const fs = wx.getFileSystemManager()
const question=db.collection('question')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    photo:[],
    photo_url:[],
    isShown:false,
    question:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  addimage(e){
    wx.removeStorageSync('tempFilePaths')
    wx.chooseImage({
      count: 2,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res=> {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        wx.setStorageSync('tempFilePaths', tempFilePaths)
        let photo=this.data.photo
        photo=wx.getStorageSync('tempFilePaths')
        this.setData({
          photo
        })
      }
    })
  },
  addwords(e){
    var value=e.detail.value
    this.setData({
      question: value
    })
  },
  uploadquestion(e){
    if(this.data.question.length==0)
    {
      wx.showToast({
        title: '请添加内容',
        icon: 'error'
      })
    }
    else{
      //跳出提示是否确认保存
      this.setData({
        isShown:true
      })
    }
  },
  closedialog(e) {
    this.setData({
        isShown: false,
        isShown1:false
    })
  },
  allowask(e){
    this.setData({
      isShown:false,
      question:this.data.question.replace('/n','&hc')
    })
    // 生成问题码
    let txt = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z');
    var randomstring1=""
    for(let i = 0; i < 8; i++) {
      let randomnum = Math.floor(Math.random() * 36);
      randomstring1 += txt[randomnum];
    }
    this.setData({
      randomstring:randomstring1
    })
    console.log(this.data.randomstring)
  
    for (var i = 0; i < this.data.photo.length; i++) {
      let randomstring ='qs'+this.data.randomstring+'_'+i + '.png'
      // 为了防止上传至云端的文件路径重复
      wx.cloud.uploadFile({
        // console.log(randomstring)
          cloudPath: randomstring ,
          filePath: this.data.photo[i], // 文件路径
        success: res => {
         this.setData({
           photo_url:this.data.photo_url.concat(res.fileID)
        })
        },
        fail: err => {
          this.data.photo.splice(i,1)
        }
      })
    }
    this.setData({
      question:this.data.question.split('\n').join('&hc')
    })
    // 添加相应数据到云数据库
    wx.showLoading({
      title: '上传中...',
      mask:true
    })
    this.add()
    },
    add(){
      setTimeout(() =>{
        question.add({
        data: {
          question: this.data.question,
          photo_url:this.data.photo_url,
          question_id: this.data.randomstring,
          comment:[]
        },
      })
      .then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
          icon: 'success'
         })
        })
        wx.navigateBack({})
        wx.redirectTo({
          url: '../../pages/questionandask/questionandask'
        })
      },1000)
    },
    lookimage(e)
    {
      console.log(e.currentTarget.dataset)
      wx.previewImage({
        current:e.currentTarget.dataset.item, //当前显示图片的http链接
        urls: this.data.photo // 需要预览的图片http链接列表
      })
    }
})