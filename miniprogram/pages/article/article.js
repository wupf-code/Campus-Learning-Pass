// pages/article/article.js
const db=wx.cloud.database()
const cloudarticle=db.collection('cloudarticle')
const userInfo=db.collection('userInfo')
const _= db.command
const likeandcollect=db.collection('likeandcollect')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    profile_url:"",//用户头像
    photo_url:"",//文章对应的照片
    title:"",
    name:"",
    words:"",
    articleid:"",
    dz_count:0,
    hasdz:false,
    hassc:false,
    hasUserInfo:false,
    openid:"",
    isShown:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var articleid=options.article_id
    this.setData({
      articleid:articleid
    })
},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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
              // 先在onshow函数中 或群当前用户是否点赞或者收藏过该篇文章 这通过hasdz和hassc反映 这俩个值分别不同的情况下 所做的处理不同 拿hasdz举例 当它的值为true时 要执行点赞加一的操作 也就是下面的dz函数 否则不执行下面的函数 反映在wxml页面就是 是否绑定这两个函数 绑定则执行 否则不执行
              // 获取当前用户的收藏点赞信息
              likeandcollect.where({
                _openid:this.data.openid,
              }).get().then(res=>{
              console.log(this.data.openid)
              // 根据获取到的当前用户的信息
              // 获取当前用户的点赞的文章的所有有文章码
              var i=res.data[0].hasdz
              // 获取当前文章码在该用户点赞的文章的中的文章码的索引 这个是用来确定该用户是否点赞过当前文章的 如果点赞过 返回的索引值大于等于0 否则小于0
              // 由onload 函数中前几行可知 this.data.articleid就是当前点击的文章的进来的文章的文章码！
              var j=i.indexOf(this.data.articleid)
              // 收藏同上 思路同上
              var x=res.data[0].hassc
              // 同上
              var y=x.indexOf(this.data.articleid)
              // 如果点赞对应的索引存在 则点赞点过了 不需要重复点赞
              if(j>=0){
                this.setData({
                  hasdz:true
                  })
                }
              //四路同上
              if(y>=0){
                this.setData({
                  hassc:true
                  })
                }
              })
            })
          }
        })
      }
    })
        // 根据文章码获得cloudarticle数据库中的_openid和文章标题 文章正文
        cloudarticle.where({
          article_id:this.data.articleid
        })
        .get().then(res=>{
        this.setData({
          photo_url:res.data[0].photo_url,
          title:res.data[0].title,
          words:'　　'+res.data[0].words.split('&hc').join('\n　　'),
          dz_count:res.data[0].dz_count,
        })
        // 根据刚才获得的_openid在数据库：userInfo中找到对应的用户头像和昵称
        userInfo.where({
          _openid:res.data[0]._openid
        })
        .get().then(res=>{
          this.setData({
            name:res.data[0].nickName,
            profile_url:res.data[0].avatarUrl
          })
        })
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
  dz(e){
    // 增加点赞数的前提是 当前用户是授权过的 即当前用户的_openid 是不为空的
  if(this.data.openid!=""){
    //增加点赞数 将文章数据库中的当前文章的点赞数加一 是否加一取决于hasdz 和hassc 这个判断在wxml文件中做
    cloudarticle.where({
      article_id:this.data.articleid
    })
    .update({
      data:{
        dz_count:this.data.dz_count+1
      }, 
      success: function(res) {
      }
    })
    // 再将该页面的点赞数的初始数据加一保存
    this.setData({
      dz_count:this.data.dz_count+1
    })

    //先获取当前用户在相应数据库中的数据是否存在
    likeandcollect.where({
      _openid:this.data.openid,
    }).count().then(res=>{
      // 不存在该用户记录 则增加该用户的相应点赞记录
      if(res.total==0){
        likeandcollect.add({
          data:{
            hasdz:[this.data.articleid]
          },
          success: function(res) {
          }
        })
      }
      // 存在的话 则将云数据库中该用户的数据的收藏文章的文章码增加一个当前点赞的文章的文章码
      else{
        likeandcollect.where({
          _openid:this.data.openid,
        })
        .update({
          data:{
            hasdz:_.push(this.data.articleid)
        },
        })
      }
      // 最后再将当前页面的初始数据用于判断是否点赞当前文章的布尔变量设置为true 防止下次再次进入该页面时又做重复的操作
      this.setData({
        hasdz:true
      })
    })
  }
  // 当前用户为空 则显示去授权的对话框
    else{
      this.setData({
        isShown:true
      })
    }
  },
  // 收藏的思路同上
  sc(e){
    if(this.data.openid!=""){
      //在数据库添加数据
      likeandcollect.where({
        _openid:this.data.openid,
      }).count().then(res=>{
        if(res.total==0){
          likeandcollect.add({
            data:{
              hassc:[this.data.articleid]
            },
            success: function(res) {
            }
          })
        }
        else{
          likeandcollect.where({
            _openid:this.data.openid,
          })
          .update({
            data:{
              hassc:_.push(this.data.articleid)
          },
          })
        }
        this.setData({
          hassc:true
        })
      })
    }
      else{
        this.setData({
          isShown:true
        })
      }
  },
  lookimage(e)
  {
    console.log(e.currentTarget.dataset)
    wx.previewImage({
      current:e.currentTarget.dataset.item, //当前显示图片的http链接
      urls: this.data.photo_url // 需要预览的图片http链接列表
    })
  },
  qxdz(e){
    if(this.data.openid!="")
    {
      //定位取消点赞的文章并获取文章码
      cloudarticle.where({
        article_id:this.data.articleid
      }).get().then(res=>{
  
        var tempdelete =res.data[0].article_id
        //获取用户点赞的数据并查找比对文章码，从数据库删除
        likeandcollect.where({_openid:this.data.openid}).get().then(res=>
          {
              var jilu=res.data[0].hasdz
              for(let j=0;j<jilu.length;j++)
              {
                if(jilu[j]==tempdelete)
                {jilu.splice(j,1)
                likeandcollect.where({_openid:this.data.openid}).update({
                  data:{hasdz:jilu},
                })
              }
              }
          }
        )
        this.setData({dz_count:this.data.dz_count-1,hasdz:false})
        //更新cloudarticle数据库
        cloudarticle.where({article_id:this.data.articleid}).update({
          data:{dz_count:this.data.dz_count}
        })
      })

    }
  },
  qxsc(){
    if(this.data.openid!="")
    {
      cloudarticle.where({
        article_id:this.data.articleid
      }).get().then(res=>{
        var tempdelete =res.data[0].article_id
        likeandcollect.where({_openid:this.data.openid}).get().then(res=>
          {
              var jilu=res.data[0].hassc
              for(let j=0;j<jilu.length;j++)
              {
                if(jilu[j]==tempdelete)
                {jilu.splice(j,1)
                likeandcollect.where({_openid:this.data.openid}).update({
                  data:{hassc:jilu},
                })
              }
              }
          }
        )
        this.setData({hassc:false})
      })

    }
  }
})