/* Import faunaDB sdk */
const faunadb = require('faunadb')
const q = faunadb.query

exports.handler = async (event, context) => {
  /* configure faunaDB Client with our secret */
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
  }) 
  const data = JSON.parse(event.body)
  console.log('data', data)
  console.log('Function `product-delete-batch` invoked', data.ids)
  // construct batch query from IDs
  const deleteAllCompletedProductQuery = data.ids.map((id) => {
    return q.Delete(q.Ref(`classes/products/${id}`))
  })
  // Hit fauna with the query to delete the completed items
  return client.query(deleteAllCompletedProductQuery)
    .then((response) => {
      console.log('success', response)
      return {
        statusCode: 200,
        body: JSON.stringify(response)
      }
    }).catch((error) => {
      console.log('error', error)
      return {
        statusCode: 400,
        body: JSON.stringify(error)
      }
    })
}
