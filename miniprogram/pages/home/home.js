// pages/home/home.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const cloudarticle = db.collection('cloudarticle')
const timeTable = db.collection('timetable')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    articleshow: [],
    articlecontent: [],
    articlenum: 0,
    Height: "",
    wlist:[],
    list:[]
  },
  // 当图片完全显示出来时 触发该函数
  imgHeight(e) {
    // 获取当前屏幕宽度
    var a = wx.getSystemInfoSync().windowWidth
    //获取当前照片宽度
    var b = e.detail.width
    // 获取当前照片高度
    var c = e.detail.height
    //等比设置swiper的高度。 即 屏幕宽度 / swiper高度 = 图片宽度 / 图片高度  ==》swiper高度 = 屏幕宽度 * 图片高度 / 图片宽度
    // 确定当前swiper高度
    var d = a * c / b + "px"
    // 修改页面初始数据：Height
    this.setData({
      Height: d
    })
  },


  onShow: function (options) {
    var that=this
    // 获取云数据库中的文章数量
    cloudarticle.get()
      .then(res => {
        this.setData({
          articlenum: res.data.length
        })
        // 当文章数量为0的时候
        if (this.data.articlenum == 0) {}
        // 当文章数量在1到2的时候
        else if (this.data.articlenum < 3 && this.data.articlenum > 0) {
          // 返回了随机选中的文章数量的个用户对应的记录，结果如下：
          cloudarticle.aggregate().sample({
              size: this.data.articlenum
            }).end()
            .then(res => {
              var array = []
              // 将所有文章的正文部分取得前50个字符并将转义字符换成\n后赋值给定义好的数组
              for (let i = 0; i < this.data.articlenum; i++) {
                let x = res.list[i].words
                array.push(x.split('&hc').join('\n').substring(0, 50) + '...')
              }
              // 将正文部分
              this.setData({
                articleshow: res.list,
                articlecontent: array
              })
            })
        } else {
          cloudarticle.aggregate().sample({
              size: 3
            }).end()
            .then(res => {
              var array = []
              for (let i = 0; i < 3; i++) {
                let x = res.list[i].words
                array.push(x.split('&hc').join('\n').substring(0, 50) + '...')
              }
              this.setData({
                articleshow: res.list,
                articlecontent: array
              })
            })
        }
      })
      // 获取今日星期几，获取本日的课程；
      var today_zhouji=new Date().getDay(); 
      var today = new Date()
      var end = today.getTime()
      if(today_zhouji==0)today_zhouji=7
      let temp=[]
      wx.cloud.callFunction({
        name:'getUserInfo',
        complete:res1=>{
          timeTable.where({
            openid:res1.result.openid
          }).get().then(res=>{
            this.setData({
              wlist:res.data[0].wlist[0]            })
              let start_num = new Date(this.data.firstdate.replace(/-/g, "/"))
                   
              var now= parseInt(parseInt((end - start_num.getTime()) / (1000 * 60 * 60 * 24)) / 7) + 1
                  
            for(let i=0;i<this.data.wlist.length;i++)
            {
              if(this.data.wlist[i].startzhou<=now && this.data.wlist[i].endzhou>=now)
              if(this.data.wlist[i].xqj==today_zhouji)
              {
                temp.push(this.data.wlist[i])
                
              }
            }
            this.setData({
              list:temp
            })
            console.log(this.data.list)
          })
        }
      })
      

  },
  toclass(e) {
    wx.switchTab({
      url: '../classroom/classroom'
    })
  },
  topersonalarticle(e) {
    wx.navigateTo({
      url: '../personal_article/personal_article'
    })
  },
  toquestionandask(e) {
    wx.navigateTo({
      url: '../questionandask/questionandask'
    })
  },
  selectarticle(e) {
    wx.navigateTo({
      url: '../article/article?article_id=' + e.currentTarget.dataset.item.article_id
    })
  },
  toallarticle(e) {
    wx.navigateTo({
      url: '../allarticle/allarticle'
    })
  }
})