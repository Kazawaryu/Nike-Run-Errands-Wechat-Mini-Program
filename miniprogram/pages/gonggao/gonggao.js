// pages/gonggao/gonggao.js
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.get_list();
  },
  //获取数据
  get_list(){
    let that = this;
    db.collection('wenzhang').orderBy('_updateTime','desc').limit(20).get({
      success:function(res){
        that.setData({
          list:res.data,
        })
          wx.hideLoading()
      },
      fail(er){
        wx.hideLoading()
        console.log(er)
      }
    })
  },
  //跳转到公告详情页
  go_detail:function(e){
    let that = this;
    console.log(e.currentTarget.dataset.id)
    let content = encodeURIComponent(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/detail/detail?id='+content,
    })
  },
  more() {
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      wx.showToast({
        title: '没有更多了',
      })
      return false
    }
      let page = that.data.page + 1;
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20
      db.collection('wenzhang').orderBy('_updateTime', 'desc').skip(page * 20).limit(20).get({
            success: function(res) {
                  if (res.data.length == 0) {
                        that.setData({
                              nomore: true
                        })
                        return false;
                  }
                  if (res.data.length < 20) {
                        that.setData({
                              nomore: true
                        })
                  }
                  //取到成功后，都连接到旧数组，然后组成新数组
                  that.setData({
                        //这里的page为1，即新页面
                        page: page,
                        list: that.data.list.concat(res.data)
                  })
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
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
        this.more()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})