// pages/personal_favourite/personal_favourite.js
const db=wx.cloud.database()
const userInfo=db.collection('userInfo')
const likeandcollect=db.collection('likeandcollect')
const cloudarticle=db.collection('cloudarticle')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    articlecontent:[],
    article:[],
    hasUserInfo:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    
    setTimeout(function () {
      wx.hideLoading()
    }, 2000)
    
    var that=this
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
               hasUserInfo:true
             })
              likeandcollect.where({
                _openid:res1.result.openid
              }).get().then(res4=>{
                var hassc=res4.data[0].hassc

                for(let i=0;i<hassc.length;i++)
                {
                  
                  cloudarticle.where({
                    article_id:hassc[i]
                  })
                  .get().then(res5=>{
                    let x=res5.data[0].words
                    x=x.split('&hc').join('\n').substring(0,50)+'...'
                    this.setData({
                      article:that.data.article.concat(res5.data[0]),
                      articlecontent:that.data.articlecontent.concat(x)
                    })
                  })
                }
              })
            })
          }
        })
      }
    })
    console.log(this.data.article)
  },
  toregister(e){
    wx.switchTab({
      url: '../personal/personal'
    })
  },
  selectarticle:function(e){
    wx.navigateTo({
      url: '../article/article?article_id='+e.currentTarget.dataset.item.article_id
    })
  },
})