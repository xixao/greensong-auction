import React, { Component } from 'react'
import ContentEditable from './components/ContentEditable'
import AppHeader from './components/AppHeader'
import SettingsMenu from './components/SettingsMenu'
import analytics from './utils/analytics'
import api from './utils/api'
import sortByDate from './utils/sortByDate'
import isLocalHost from './utils/isLocalHost'
import './App.css'

export default class App extends Component {
  state = {
    products: [],
    showMenu: false,
    isAdmin: false
  }
  componentDidMount() {

    /* Track a page view */
    analytics.page()

    // Fetch all products
    api.readAll().then((products) => {
      if (products.message === 'unauthorized') {
        if (isLocalHost()) {
          alert('FaunaDB key is not unauthorized. Make sure you set it in terminal session where you ran `npm start`. Visit http://bit.ly/set-fauna-key for more info')
        } else {
          alert('FaunaDB key is not unauthorized. Verify the key `FAUNADB_SERVER_SECRET` set in Netlify enviroment variables is correct')
        }
        return false
      }

      console.log('all products', products)
      this.setState({
        products: products
      })
    })

    const urlParam = window.location.search
    if (urlParam.substring(1) === "doAdmin") this.setState({ isAdmin: true })
  }
  saveProduct = (e) => {
    e.preventDefault()
    const { products } = this.state
    const productValue = this.productName.value
    const productImage = this.productImage.value

    if (!productValue) {
      alert('Please add Product title')
      this.productName.focus()
      return false
    } else if (!productImage) {
      alert('Please add Product image')
      this.productImage.focus()
      return false
    }

    // reset input to empty
    this.productName.value = ''
    this.productImage.value = ''

    const productInfo = {
      title: productValue,
      image: productImage,
    }
    // Optimistically add product to UI
    const newProductArray = [{
      data: productInfo,
      ts: new Date().getTime() * 10000
    }]

    const optimisticProductState = newProductArray.concat(products)

    this.setState({
      products: optimisticProductState
    })
    // Make API request to create new product
    api.create(productInfo).then((response) => {
      console.log(response)
      /* Track a custom event */
      analytics.track('productCreated', {
        category: 'products',
        label: productValue,
        image: productImage,
      })
      // remove temporaryValue from state and persist API response
      const persistedState = removeOptimisticProduct(products).concat(response)
      // Set persisted value to state
      this.setState({
        products: persistedState
      })
    }).catch((e) => {
      console.log('An API error occurred', e)
      const revertedState = removeOptimisticProduct(products)
      // Reset to original state
      this.setState({
        products: revertedState
      })
    })
  }
  deleteProduct = (e) => {
    const { products } = this.state
    const productId = e.target.dataset.id

    // Optimistically remove product from UI
    const filteredProducts = products.reduce((acc, current) => {
      const currentId = getProductId(current)
      if (currentId === productId) {
        // save item being removed for rollback
        acc.rollbackProduct = current
        return acc
      }
      // filter deleted product out of the products list
      acc.optimisticState = acc.optimisticState.concat(current)
      return acc
    }, {
      rollbackProduct: {},
      optimisticState: []
    })

    this.setState({
      products: filteredProducts.optimisticState
    })

    // Make API request to delete product
    api.delete(productId).then(() => {
      console.log(`deleted product id ${productId}`)
      analytics.track('productDeleted', {
        category: 'products',
      })
    }).catch((e) => {
      console.log(`There was an error removing ${productId}`, e)
      // Add item removed back to list
      this.setState({
        products: filteredProducts.optimisticState.concat(filteredProducts.rollbackProduct)
      })
    })
  }
  updateProductTitle = (event, currentValue) => {
    let isDifferent = false
    const productId = event.target.dataset.key

    const updatedProducts = this.state.products.map((product, i) => {
      const id = getProductId(product)
      if (id === productId && product.data.title !== currentValue) {
        product.data.title = currentValue
        isDifferent = true
      }
      return product
    })

    // only set state if input different
    if (isDifferent) {
      this.setState({
        products: updatedProducts
      }, () => {
        api.update(productId, {
          title: currentValue
        }).then(() => {
          console.log(`update product ${productId}`, currentValue)
          analytics.track('productUpdated', {
            category: 'products',
            label: currentValue
          })
        }).catch((e) => {
          console.log('An API error occurred', e)
        })
      })
    }
  }
  closeModal = (e) => {
    this.setState({
      showMenu: false
    })
    analytics.track('modalClosed', {
      category: 'modal'
    })
  }
  openModal = () => {
    this.setState({
      showMenu: true
    })
    analytics.track('modalOpened', {
      category: 'modal'
    })
  }
  renderProducts() {
    const { products } = this.state

    if (!products || !products.length) {
      // Loading State here
      return null
    }

    const timeStampKey = 'ts'
    const orderBy = 'desc' // or `asc`
    const sortOrder = sortByDate(timeStampKey, orderBy)
    const productsByDate = products.sort(sortOrder)

    return productsByDate.map((product, i) => {
      const { data, ref } = product
      const id = getProductId(product)
      // only show delete button after create API response returns
      let deleteButton
      if (ref) {
        deleteButton = (
          <button data-id={id} onClick={this.deleteProduct}>
            delete
          </button>
        )
      }

      let productTitle
      if (this.state.isAdmin) {
        productTitle = (<ContentEditable
                tagName='span'
                editKey={id}
                onBlur={this.updateProductTitle} // save on enter/blur
                html={data.title}
                // onChange={this.handleDataChange} // save on change
              />)
      } else {
        productTitle = data.title
      }

      return (
        <div key={i} className='product-item'>
          <label className="product">
            <img className="product-image" src={data.image} alt={data.title} />
            <div className='product-list-title'>
              {productTitle}
            </div>
          </label>
          {this.state.isAdmin && deleteButton}
        </div>
      )
    })
  }
  render() {
    return (
      <div className='app'>

        <AppHeader />

        <div className='intro'>
          <p>
            Greetings from Grandmother Elspeth & Nybor Odbert! We are doing this fundraiser to raise money for our inspirational
            education festival called GreenSong 2020!
          </p>

          <p>
            It has been through the inspiration of a beloved friendship with Pete Seeger, an American folk singer & social
            activist, that the vision of GreenSong was born. GreenSong 2020 will focus on the ongoing challenges to our home,
            the planet Earth, and to our ability to survive, even thrive, as we face them. We will have meaningful music,
            active workshops, and experienced speakers to bring these matters to the fore. These will serve to develop your
            sense of personal responsibility for the ethical use of resources and for compassion for all beings. You will meet
            like minded people and build new connections for shared experiences. Here you will find inspiration to become a
            Change Maker and move toward a more sustainable future.
          </p>

          <p>
            As some of you may know, my husband Nybor's work is well-known across the country. It has been seen at Renaissance
            fairs, science fiction conventions and art shows; as well as on the covers of books and magazines. He was named
            &quot;Artist of the Year&quot; by the WPPA for four years in the early 1990s. One of his paintings, titled
            &quot;Kiss of Ages,&quot; was awarded &quot;Best in Show/Judges' Choice&quot; at the World Science Fiction
            Convention in 2002. His fantasy portraits hang in many homes overseas as well as in the United States.
          </p>

          <p>
            With that said, Nybor is putting up some very special pieces of his work, some prints, some actual original pieces,
            to raffle off in an effort to raise the funds needed for the operating expenses of GreenSong. Please help us by
            purchasing tickets and potentially obtaining a collector's piece, signed by the artist to display in your home. 
          </p>
        </div>

        <div className='product-list'>
          <form className='product-create-wrapper' onSubmit={this.saveProduct}>
          { this.state.isAdmin &&
            <>
              <input
                className='product-create-input'
                placeholder='Add a product item'
                name='name'
                ref={el => this.productName = el}
                autoComplete='off'
                style={{marginRight: 20}}
              />
              <input
                className='product-create-input'
                placeholder='Add image URL'
                name='image'
                ref={el => this.productImage = el}
                autoComplete='off'
                style={{marginRight: 20}}
              />
              <div className='product-actions'>
                <button className='product-create-button'>
                  Create product
                </button>
              </div>
            </>
          }
          </form>

          {this.renderProducts()}
        </div>
        <SettingsMenu
          showMenu={this.state.showMenu}
          handleModalClose={this.closeModal}
          handleClearCompleted={this.clearCompleted}
        />
      </div>
    )
  }
}

function removeOptimisticProduct(products) {
  // return all 'real' products
  return products.filter((product) => {
    return product.ref
  })
}

function getProductId(product) {
  if (!product.ref) {
    return null
  }
  return product.ref['@ref'].id
}
