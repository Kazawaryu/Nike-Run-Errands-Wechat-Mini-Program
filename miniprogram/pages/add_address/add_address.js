// pages/add_address/add_address.js
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

  //获取用户输入的姓名
  onChange_name:function(event){
    this.setData({
       name:event.detail,
    })
    console.log(this.data.name)
  },

  //获取用户输入的详细地址
  onChange_address:function(event){
    this.setData({
        address:event.detail,
    })
    console.log(this.data.address)
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
  //获取用户输入的收件人号码
  onChange_shoujianphone:function(event){
    let that = this;
    that.setData({
      phone:event.detail,
   })
   console.log(that.data.phone)
  },
    //检查必填项是否都已经填写
    check(){
      var name = this.data.name
      var campus = this.data.choose_campus
      var address = this.data.address
      var phone = this.data.phone
      if(!name){
        wx.showToast({
          title: '请输入姓名',
          icon: 'none',
          duration: 2000
        })
        //需要return,停止往下执行，不然当满足多个条件时，会弹出絮乱
        return false;
      }

      if(campus=="请选择地区"||!campus){
        wx.showToast({
          title: '请选择您的地区',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
      if(!address){
        wx.showToast({
          title: '请先输入您的详细地址',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
      if(!(/978[0-9]{10}/.test(phone))){

      }
      if(!phone||!(/^1\d{10}$/.test(phone))){
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
    //存储新地址
    add_data(){
      let that = this
      db.collection('dizhi').where({
          _openid:app.globalData.openid,
      }).get({
        success:function(re){
             //如果还没地址，则设置第一个地址为默认地址
             if(re.data.length==0){
              db.collection('dizhi').add({
                data:{
                    creat:new Date().getTime(),
                    name:that.data.name,
                    campus:that.data.choose_campus,
                    address:that.data.address,
                    phone:that.data.phone,
                    default:true,
                },
                success:function(res){
                  wx.showToast({
                    title: '添加成功',
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
             }else{
               //有默认地址了，则新增的地址不为默认地址
              db.collection('dizhi').add({
                data:{
                    creat:new Date().getTime(),
                    name:that.data.name,
                    campus:that.data.choose_campus,
                    address:that.data.address,
                    phone:that.data.phone,
                    default:false,
                },
                success:function(res){
                  wx.showToast({
                    title: '添加成功',
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
             }
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