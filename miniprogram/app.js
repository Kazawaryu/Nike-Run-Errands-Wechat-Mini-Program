//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('当前云环境版本过低，请使用 2.2.3 以上版本')
    } else {
      wx.cloud.init({
        env: 'cloud1-4g8w9exxb2477c3f',
        traceUser: true,
      })
    }

    this.globalData = {
      openid:'',
      address:'',
      pick_address:'',
      userInfo:'',
    }
    
  }
})
