const cloud = require('wx-server-sdk')
cloud.init({
  env: 'cloud1-4g8w9exxb2477c3f'
})
const db = cloud.database({
  throwOnNotFound: false,
});
exports.main = async (event) => {
  try {
    const result = await db.runTransaction(async transaction => {
      const default_Res = await transaction.collection('dizhi').doc(event.default_id).get()
      const no_Res = await transaction.collection('dizhi').doc(event.no_id).get()
      if (default_Res.data&&no_Res.data) {
        //默认地址改为true，同时加时间戳，让默认地址排在前面
        const update1_Res = await transaction.collection('dizhi').doc(event.default_id).update({
          data: {
               creat:event.creat,
               default:true
          }
        })
        //把原来的默认地址改为false,也更新一下时间戳，让常用地址排在前面
        const update2_Res = await transaction.collection('dizhi').doc(event.no_id).update({
          data: {
               default:false,
               creat:event.creat,
          }
        })

        return {
          success:true,
        }
      } else {
        await transaction.rollback('失败了')
      }
    })
    return result;
  } catch (e) {
    console.error(`事务报错`, e)
    return {
      success: false,
      error: e
    }
  }
}