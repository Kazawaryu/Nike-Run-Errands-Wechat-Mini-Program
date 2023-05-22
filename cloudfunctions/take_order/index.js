// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'cloud1-4g8w9exxb2477c3f'
})
const db = cloud.database({
  throwOnNotFound: false,
});
// 云函数入口函数
exports.main = async (event, context) => {

  try {
    const result = await db.runTransaction(async transaction => {
      const pubRes = await transaction.collection('publish').doc(event.publish_id).get()

      if (pubRes.data) {
         const updateRes = await transaction.collection('publish').doc(event.publish_id).update({
            data:{
               status:1, //配送中
            }
          })
          const addRes = await transaction.collection('order').add({
            data: {
                 _openid:cloud.getWXContext().OPENID,
                 publish_data:pubRes.data,
                 publish_id:event.publish_id,
                 status:0,
                 phone:event.phone,
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