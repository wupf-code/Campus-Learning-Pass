// pages/allarticle/allarticle.js
const db=wx.cloud.database()
const cloudarticle=db.collection('cloudarticle')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchwords:'',
    article:[],
    articlecontent:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    cloudarticle.get().then(res=>{
      this.setData({
        article:res.data
      })
      let articlecontent=this.data.articlecontent=[]
      for(let i=0;i<res.data.length;i++)
        articlecontent.push(res.data[i].words.split('&hc').join('\n').substring(0, 50) + '...')
      this.setData({
        articlecontent
      })
    })
  },
  input(e){
    let value = e.detail.value;//获取textarea的内容，
    this.setData({
      searchwords: value
    })
  },
  search(e){
    var that=this
    //如果文章码输入完整直接跳转到文章页面
    cloudarticle.where({
      article_id:this.data.searchwords.trim()
    })
    .count().then(res=>{
      if(res.total==1){
        wx.navigateTo({
          url: '../article/article?article_id=' + this.data.searchwords.trim()
        })
      }
    })
    let articlecontent=this.data.articlecontent
    let x=-1
    this.setData({
      article:[]
    })
    cloudarticle.get().then(res=>{
      for(let i=0;i<res.data.length;i++){
        if(res.data[i].title.indexOf(this.data.searchwords)>=0)
        {
          this.setData({
            article:that.data.article.concat(res.data[i])
          })
          x=0
        }
        articlecontent.push(res.data[i].words.split('&hc').join('\n').substring(0, 50) + '...')
      }
      this.setData({
        articlecontent
      })
      if(x==-1){
        this.setData({
          article:[]
        })
      }
    })
  },
  selectarticle(e) {
    wx.navigateTo({
      url: '../article/article?article_id=' + e.currentTarget.dataset.item.article_id
    })
  },
})