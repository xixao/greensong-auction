/* Api methods to call /functions */

const create = (data) => {
  return fetch('/.netlify/functions/products-create', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const readAll = () => {
  return fetch('/.netlify/functions/products-read-all').then((response) => {
    return response.json()
  })
}

const update = (productId, data) => {
  return fetch(`/.netlify/functions/products-update/${productId}`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const deleteProduct = (productId) => {
  return fetch(`/.netlify/functions/products-delete/${productId}`, {
    method: 'POST',
  }).then(response => {
    return response.json()
  })
}

const batchDeleteProduct = (productIds) => {
  return fetch(`/.netlify/functions/products-delete-batch`, {
    body: JSON.stringify({
      ids: productIds
    }),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

export default {
  create: create,
  readAll: readAll,
  update: update,
  delete: deleteProduct,
  batchDelete: batchDeleteProduct
}
