
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    nomore:false,
    page:0,

    come_id:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
         console.log(options.come_id)
          this.setData({
             come_id:options.come_id
          })
  },
  select_address(e){
    if(this.data.come_id==1){
      app.globalData.address = e.currentTarget.dataset.address
      console.log(app.globalData.address)
      wx.navigateBack({
        delta: 1,
      })
    }else{
      app.globalData.pick_address = e.currentTarget.dataset.address
      console.log(app.globalData.pick_address)
      wx.navigateBack({
        delta: 1,
      })
    }

  },
  //设置默认地址
  default(e){
      let that = this
      var id = e.currentTarget.dataset.id
      wx.showLoading({
        title: '切换默认地址',
      })
      db.collection('dizhi').where({
          _openid:app.globalData.openid,
          default:true,
      }).get({
         success:function(res){
             if(res.data.length==0){
                  //如果之前没有设置过默认地址，则一个操作即可
                  db.collection('dizhi').doc(id).update({
                    data:{
                       default:true,
                       creat:new Date().getTime()
                    },
                    success:function(re){
                        // 重新获取新数据
                        that.get_data()
                        wx.hideLoading()
                    }
                  })
             }else{
                 //如果之前有设置过默认地址，则需要两个操作
                 //而且两个操作要么同时成功，或者同时失败，才能保持数据一致性
                 //调用云函数来实现事务
                 wx.cloud.callFunction({
                     name:'default',
                     data:{
                       default_id:id,
                       no_id:res.data[0]._id,
                       creat:new Date().getTime(),
                     },
                     success:function(r){
                          //获取最新数据
                          that.get_data()
                          wx.hideLoading()

                     }
                 })


             }
         }
      })
  },
  go(){
    wx.navigateTo({
      url: '/pages/add_address/add_address',
    })
  },
    //获取数据
    get_data:function(){
      let that = this;
      db.collection('dizhi').where({
         _openid:app.globalData.openid
      }).orderBy('creat','desc').limit(20).get({
        success:function(res){
            that.setData({
              list:res.data,
            })
            wx.hideLoading()
            console.log(res)
        },
        fail(er){
          wx.hideLoading()
          console.log(er)
        }
      })
    },
   //获取更多数据
   get_more:function(){
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      wx.showToast({
        title: '没有更多了',
      })
      return false
    }
    let page = that.data.page + 1;
     
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20，下标20就是第21条记录
      db.collection('dizhi').where({
        _openid:app.globalData.openid
     }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
            success: function(res) {
                  console.log(res)
                  if (res.data.length == 0) {
                        that.setData({
                              nomore: true
                        })
                  }
                  if (res.data.length < 20) {
                        that.setData({
                              nomore: true
                        })
                        //取到成功后，都连接到旧数组，然后组成新数组
                        that.setData({
                              //这里的page为1
                              page: page,
                              list: that.data.list.concat(res.data)
                        })
                  }
            },
            fail() {
                  wx.showToast({
                        title: '获取失败',
                        icon: 'none'
                  })
            }
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
     this.get_data()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
         this.get_more()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})