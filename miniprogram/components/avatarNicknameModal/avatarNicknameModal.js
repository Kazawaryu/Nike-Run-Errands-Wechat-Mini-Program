// components/avatarNicknameModal/avatarNicknameModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showAvaModal: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showAvaModal: false,
    avatarUrl: null,
    nickName: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 阻止页面滑动
     */
    catchtouchmove() {},

    /**
     * 选择头像返回信息监听
     */
    chooseavatar(res) {
      const avatarUrl = res.detail.avatarUrl
      this.setData({
        avatarUrl: avatarUrl
      })
    },

    /** 获取昵称信息 */
    bindblur(res) {
      const value = res.detail.value
      this.data.nickName = value
    },

    /**
     * 设置信息按钮点击监听
     */
    setBtnTap() {
      const {
        avatarUrl,
        nickName
      } = this.data
      this.triggerEvent("getAvaNickData", {
        avatarUrl,
        nickName
      })
    },

    /**
     * 关闭弹窗
     */
    closeModalTap() {
      this.setData({
        showAvaModal: false,
        nickName: null,
        avatarUrl: null
      })
    },
  }
})