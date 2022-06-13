// pages/personal_article_write/personal_article_write.js
const db=wx.cloud.database()
const fs = wx.getFileSystemManager()
const cloudarticle=db.collection('cloudarticle')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    photo:[],
    photo_url:[],
    index:-1,
    title:"",
    words:"",
    isShown: false,
    isShown1:false,
    randomstring: "",
    allowupload:false,
    allowsave:false,
    articleid:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.str!=null)
    {
      var string=options.str.split(',')
      var url=[]
      for(let i=0;i<parseInt(string[0]);i++)
      {
        url.push(string[i+1])
      }
      this.setData({
        photo:url,
        title:string[parseInt(string[0])+1],
        words:string[parseInt(string[0])+2],
        index:parseInt(string[parseInt(string[0])+3])
      })
    }
  },
  addimage(e){
    wx.removeStorageSync('tempFilePaths')
    wx.chooseImage({
      count: 9,
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
  addtitle(e){
    let value = e.detail.value;//获取textarea的内容，
    this.setData({
      title: value
    })
  },
  addwords(e){
    var value=e.detail.value
    this.setData({
      words: value
    })
  },
  savetolocal(e){
    if(this.data.words.length==0||this.data.title.length==0)
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

  uploadtocloud(e) {
    // 当标题和正文输入的内容有一个为空时 弹出错误提示的对话框
    if (this.data.words.length == 0 || this.data.title.length == 0) {
      wx.showToast({
        title: '请添加内容',
        icon: 'error'
      })
    }
    else
    {
      //跳出提示是否确认上传
      this.setData({
        isShown1:true
      })
    }
  },
  closedialog(e) {
    ////do something when sure is clicked
    this.setData({
        isShown: false,
        isShown1:false
    })
  },
  allowsave(e){
    this.setData({
      allowsave:true,
      isShown:false,
      words:this.data.words.replace('/n','&hc')
    })
    console.log(this.data.index)
    if(this.data.index==-1)
    {
      for(let i=1;i<6;i++)
      {
        let photopath=""
        for(let j=0;j<this.data.photo.length;j++)
        {photopath+=this.data.photo[j]+"&hc"}
        let x=true
        try {
          fs.accessSync(wx.env.USER_DATA_PATH+"/"+i+".txt")
        } catch(e) {
          x=false
        }
        if(x==false)
          {
          fs.writeFile({
            filePath: wx.env.USER_DATA_PATH+"/"+i+".txt",
            data:this.data.photo.length+"&hc"+photopath+this.data.title+"&hc"+this.data.words+"&hc"+i,
            encoding: 'utf8',
            success(res) {
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              })
              wx.navigateBack({})
            },
            fail(res) {
              wx.showToast({
                title: '保存失败',
                icon: 'fail'
              })
              wx.navigateBack({})
            }
          })
          break
        }
      }
    }
    else
    {
      let photopath=""
      for(let j=0;j<this.data.photo.length;j++)
      {photopath+=this.data.photo[j]+"&hc"}
      fs.writeFile({
        filePath: wx.env.USER_DATA_PATH+"/"+this.data.index+".txt",
        data:this.data.photo.length+"&hc"+photopath+this.data.title+"&hc"+this.data.words+"&hc"+this.data.index,
        encoding: 'utf8',
        success(res) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
          wx.navigateBack({})
        },
        fail(res) {
          wx.showToast({
            title: '保存失败',
            icon: 'fail'
          })
        }
      })
    }
  },
  allowupload(e){
    this.setData({
      allowupload:true,
      isShown1:false,
      words:this.data.words.replace('/n','&hc')
    })

    if(this.data.index!=-1){
      wx.getFileSystemManager().unlink({
        filePath: wx.env.USER_DATA_PATH+"/"+this.data.index+".txt",
        success:res=>{
        }
      })
    }

    // 先生成文章码
    let txt = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
    var randomstring1=""
    for(let i = 0; i < 8; i++) {
      let randomnum = Math.floor(Math.random() * 36);
      randomstring1 += txt[randomnum];
    }
    this.setData({
      randomstring:randomstring1
    })
    console.log(this.data.randomstring) //输出文章码
    //将标题中的内容 正文中的内容 和图片地址 openid 点赞数 和生成的随机文章码 上传到云数据库中
  
    for (var i = 0; i < this.data.photo.length; i++) {
      let randomstring ='at'+this.data.randomstring+'_'+i + '.png'
      // 为了防止上传至云端的文件路径重复
      wx.cloud.uploadFile({
        // console.log(randomstring)
          cloudPath: randomstring ,
          filePath: this.data.photo[i], // 文件路径
        success: res => {
          // get resource ID
         this.setData({photo_url:this.data.photo_url.concat(res.fileID)})
        },
        fail: err => {
          // handle error
          this.data.photo.splice(i,1)
        }
      })
    }
    // 添加相应数据到云数据库
    wx.showLoading({
      title: '上传中...',
      mask:true
    })
    this.add()
    },
    add(){
      setTimeout(() =>{
      cloudarticle.add({
        // data 字段表示需新增的 JSON 数据
        data: {
          title: this.data.title,
          words: this.data.words,
          dz_count: 0,
          photo_url:this.data.photo_url,
          article_id: this.data.randomstring
        },
      })
      .then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '上传成功',
          icon: 'success'
         })
        })
        wx.navigateBack({})
        wx.redirectTo({
          url: '../../pages/personal_article/personal_article'
        })
      },5000)
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