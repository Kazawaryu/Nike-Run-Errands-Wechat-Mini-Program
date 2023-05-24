// pages/reflect/reflect.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
       
       phone:'',
       balance:0,
       user_id:'',

       fileList_img:[],
       linshi_img:[],
       button_disabled:false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      that.get_balance();
  },
  check:function(){
      let that = this;
      //加一个禁用显示按钮
      //设置按钮禁用
     that.setData({
      button_disabled:true,
     })
      if(that.data.balance==0){
        wx.showToast({
          title: '余额为0，无法提现',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          button_disabled:false,
        })
        return false
      }
      if(!that.data.fileList_img[0]||that.data.fileList_img.length==0){
        wx.showToast({
          title: '请上传收款码',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          button_disabled:false,
        })
        return false
      }

      //开始提现,第一要把钱包余额归零，第二是写入history数据库表，第三是添加提现记录到tixian表里
      that.tixian();
  },
  tixian:function(){
    let that = this;
    wx.showLoading({
      title: '正在提现',
    })
    let nian = new Date().getFullYear();
    let yue = new Date().getMonth()+1;
    let ri = new Date().getDate();
    let shi = new Date().getHours();
    let fen = new Date().getMinutes();
    wx.cloud.callFunction({
          name:'tixian',
          data:{
            user_id:that.data.user_id,
            code:that.data.fileList_img[0],
            tixian_time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
            name:'提现',
            stamp:new Date().getTime(),
          },
          success:function(res){

            wx.hideLoading()
            setTimeout(function(){
              wx.navigateBack({
                delta: 0,
              })
            },1000)
          },
          fail(er){
            that.setData({
              button_disabled:false,
            })
            wx.hideLoading()
            wx.showToast({
              title: '提现失败，请稍后重试',
              icon: 'none',
              duration: 2000
            })
          }
    })
  },
   // 上传图片
   uploadToCloud_img(event) {
    let that = this;
     wx.chooseImage({
       count: 1,
       sizeType: ['original', 'compressed'],
       sourceType: ['album', 'camera'],
       success (res) {
         wx.showLoading({
           title: '正在上传',
         })    
         console.log(res)
         that.setData({
           linshi_img:that.data.linshi_img.concat(res.tempFilePaths)
         })
         console.log(that.data.linshi_img)
         
         //临时数组
         let lujin2 = "code_img/" + new Date().getTime() +"-"+ Math.floor(Math.random() * 1000)+'.png';
         const uploadTasks = that.data.linshi_img.map((item, index)  => {
           return  that.uploadFilePromise_img(index+lujin2, item)
           
         }); //传给wx.cloud.uploadFile的cloudPath属性的值不能重复！！！巨坑，加个index就可以避免重复了
           Promise.all(uploadTasks)
           .then(data => {
             console.log(data)
             wx.hideLoading()
             wx.showToast({ 
               title: '上传成功', 
               icon: 'none' 
             });
             const newFileList = data.map(item => (item.fileID));
             console.log(newFileList)
             //每次上传成功后，都要清空一次临时数组，避免第二次重复上传，浪费存储资源，
             that.setData({ 
               fileList_img: that.data.fileList_img.concat(newFileList),
               linshi_img:[],
             });
             
           })
           .catch(e => {
             wx.showToast({ title: '上传失败', icon: 'none' });
             console.log(e);
           });
     
       }
     })
     



},
//上传到云存储，并且获得图片新路径
uploadFilePromise_img(fileName, chooseResult) {
return wx.cloud.uploadFile({
 cloudPath: fileName,
 filePath: chooseResult
});
},
//预览图片
previewImage_img:function(event){

console.log(event)
wx.previewImage({
urls: [event.currentTarget.dataset.url] // 需要预览的图片http链接列表
})    
},



  //获取用户余额
  get_balance:function(){
    let that = this;
    wx.showLoading({
      title: '正在获取',
    })
    db.collection('user').where({
        _openid:app.globalData.openid,
    }).get({
      success:function(res){
           console.log(res)
           wx.hideLoading()
           that.setData({
              balance:res.data[0].money,
              user_id:res.data[0]._id,
           })
      },
      fail(er){
          console.log(res)
          wx.hideLoading()
          wx.showToast({
            title: '获取失败，请重新获取',
            icon: 'none',
            duration: 2000
          })
          setTimeout(function(){
            wx.navigateBack({
              delta: 0,
            })
          },1000)
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