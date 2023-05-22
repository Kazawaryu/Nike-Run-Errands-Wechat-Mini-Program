
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    name:'',

    campus:['请选择地区'],
    campus_show:false,
    choose_campus:'请选择地区',
    address:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       this.get_campus()
  },
  onChange_shoujianphone:function(event){
    let that = this;
    that.setData({
      phone:event.detail,
   })
   console.log(that.data.phone)
  },
    //获取各个学校或者地区,最多添加20个学校，不建议太多
    get_campus:function(){
      let that = this;
      db.collection('campus').get({
         success:function(res){
           console.log(res)
           for(let i=0;i<res.data.length;i++){
                that.setData({
                  campus:that.data.campus.concat(res.data[i].campus_name),
                })
           }
         }
      })
    },

 
  //打开选择地区窗口
  popup_campus:function(){
    let that = this;
    that.setData({
      campus_show:true,
    })
  },
  //监听选择地区变化
  campus_change:function(event){
       let that = this;
       console.log(event)
       that.setData({
         choose_campus:event.detail.value
       })
  },
  //取消选择地区
  campus_cancel:function(){
    let that = this;
    //关闭选择地区窗口
    that.setData({
       campus_show:false,
    })
  },
  //确定地区选择
  campus_confirm:function(){
    let that = this;
    //关闭选择地区窗口
    that.setData({
      campus_show:false,
    })
  },
      //获取用户手机号
      get_phone: function(e) {
        let that = this;
        //判断用户是否授权确认
        if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
              wx.showToast({
                    title: '获取手机号失败',
                    icon: 'none'
              })
              return;
        }
        wx.showLoading({
              title: '获取手机号中...',
        })
        //调用云函数获取号码,用云函数来云调用获取免鉴权的用户手机号码信息
        wx.cloud.callFunction({
          name:'login',
          data:{
              phone:wx.cloud.CloudID(e.detail.cloudID),
          },
          success:function(res){
              console.log(res)
              //成功获取手机号码后，赋值
              that.setData({
                phone:res.result.event.phone.data.phoneNumber,
              })
              //关闭正在获取的转圈
              wx.hideLoading()
          },
          fail(){
            wx.showToast({
              title: '获取失败,请重新获取',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
    //检查必填项是否都已经填写
    check(){
      var campus = this.data.choose_campus
      var phone = this.data.phone


      if(campus=="请选择地区"||!campus){
        wx.showToast({
          title: '请选择配送区域',
          icon: 'none',
          duration: 2000
        })
        return false;
      }

      if(!phone){
        wx.showToast({
          title: '请先获取手机号码',
          icon: 'none',
          duration: 2000
        })
        return false;
      }

      //如果都已经填写，会执行到这，也就是 去存储了
      this.add_data()
   
    },
    //存储
    add_data(){
      let that = this
      db.collection('runner').add({
        data:{
            nickName:app.globalData.userInfo.nickName,
            avatarUrl:app.globalData.userInfo.avatarUrl,
            creat:new Date().getTime(),
            campus:that.data.choose_campus,
            phone:that.data.phone,
            pass:false,
        },
        success:function(res){
          wx.showToast({
            title: '申请成功，等待审核',
            icon: 'success',
            duration: 2000
          })
          //1秒后自动返回上一页，写个定时执行的函数
          setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              })
          }, 1000);
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})