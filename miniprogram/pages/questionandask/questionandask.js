// pages/questionandask/questionandask.js
const db=wx.cloud.database()
const question=db.collection('question')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    question:[],
    questioncontent:[],
    searchwords:''
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    question.get().then(res=>{
      this.setData({
        question:res.data
      })
      let questioncontent=this.data.questioncontent=[]
      for(let i=0;i<res.data.length;i++)
      questioncontent.push(res.data[i].question.split('&hc').join('\n').substring(0, 60) + '...')
      this.setData({
        questioncontent
      })
    })
  },
  input(e){
    let value = e.detail.value;//获取搜索框的内容，
    this.setData({
      searchwords: value
    })
  },
  search(e){
    var that=this
    let questioncontent=this.data.questioncontent=[]
    let x=-1
    this.setData({
      question:[]
    })
    question.get().then(res=>{
      for(let i=0;i<res.data.length;i++){
        if(res.data[i].question.indexOf(this.data.searchwords)>=0)
        {
          this.setData({
            question:that.data.question.concat(res.data[i])
          })
          x=0
          questioncontent.push(res.data[i].question.split('&hc').join('\n').substring(0, 60) + '...')
        }
      }
      this.setData({
        questioncontent
      })
      if(x==-1){
        this.setData({
          question:[]
        })
      }
    })
  },

  selectquestion(e){
    wx.navigateTo({
      url: '../question/question?question_id=' + e.currentTarget.dataset.item.question_id
    })
  },

  toaskquestion(e){
    wx.navigateTo({
      url: '../askquestion/askquestion'
    })
  }
})