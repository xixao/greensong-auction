import React, { Component } from 'react'
import styles from './BidModal.css' // eslint-disable-line
import analytics from '../../utils/analytics'
import api from '../../utils/api'

export default class Menu extends Component {
  componentDidMount() {
    // attach event listeners
    document.body.addEventListener('keydown', this.handleEscKey)
  }
  componentWillUnmount() {
    // remove event listeners
    document.body.removeEventListener('keydown', this.handleEscKey)
  }
  handleEscKey = (e) => {
    if (this.props.showMenu && e.which === 27) {
      this.props.handleModalClose()
    }
  }
  handleDelete = (e) => {
    e.preventDefault()
    const deleteConfirm = window.confirm("Are you sure you want to clear all completed todos?");
    if (deleteConfirm) {
      console.log('delete')
      this.props.handleClearCompleted()
    }
  }
  handleBid = (e) => {
    e.preventDefault()
    const confirmBid = window.confirm("Submit your bid on this item?")
    if (confirmBid) {
      console.log('bid')

      const bidderName = this.bidderName.value
      const bidderEmail = this.bidderEmail.value
      const bidderPhone = this.bidderPhone.value
      const bidderAmount = this.bidderAmount.value

      if (!bidderName) {
        alert('Please enter your name')
        this.bidderName.focus()
        return false
      } else if (!bidderEmail) {
        alert('Please enter your email address')
        this.bidderEmail.focus()
        return false
      } else if (!bidderPhone) {
        alert('Please enter your phone number')
        this.bidderPhone.focus()
        return false
      } else if (!bidderAmount) {
        alert('Please enter your bid amount')
        this.bidderAmount.focus()
        return false
      }

      const bidderInfo = {
        name: bidderName,
        email: bidderEmail,
        phone: bidderPhone,
        bid: bidderAmount,
      }

      // Make API request to create new product
      api.bid(bidderInfo).then((response) => {
        console.log(response)
        /* Track a custom event */
        analytics.track('bidCreated', {
          category: 'bids',
          name: bidderName,
          email: bidderEmail,
          phone: bidderPhone,
          bid: bidderAmount,
        })
        this.props.handleModalClose()
      }).catch((e) => {
        console.log('An API error occurred', e)
      })
    }
  }

  render() {
    const { showMenu, products, selectedProduct } = this.props
    const showOrHide = (showMenu) ? 'flex' : 'none'

    console.log(products, selectedProduct)

    const currentItem = products.filter(product => product.ref['@ref'].id === selectedProduct)[0]
    console.log(currentItem)

    if (showMenu === true && selectedProduct) {
      return (
        <div className='settings-wrapper' style={{display: showOrHide}}>
          <div className='settings-content'>
            <span className='settings-close' onClick={this.props.handleModalClose} role="img" aria-label='close'>
              ❌
            </span>
            <h2>{currentItem.data.title}</h2>
            <div className="modal-flex">
              <div className="modal-image">
                <img src={currentItem.data.image} alt={currentItem.data.title} />
              </div>
              <div className="modal-form">
                <input
                  className='product-create-input'
                  placeholder='Your Name'
                  name='bidder-name'
                  ref={el => this.bidderName = el}
                  autoComplete='off'
                  style={{marginRight: 20}}
                />
                <input
                  className='product-create-input'
                  placeholder='Email Address'
                  name='bidder-email'
                  ref={el => this.bidderEmail = el}
                  autoComplete='off'
                  style={{marginRight: 20}}
                />
                <input
                  className='product-create-input'
                  placeholder='Phone Number'
                  name='bidder-phone'
                  ref={el => this.bidderPhone = el}
                  autoComplete='off'
                  style={{marginRight: 20}}
                />
                <input
                  className='product-create-input'
                  placeholder='Bid Amount'
                  name='bidder-amount'
                  ref={el => this.bidderAmount = el}
                  autoComplete='off'
                  style={{marginRight: 20}}
                />
                <div className='settings-section' onClick={this.handleBid}>
                  <button className='btn-primary'>
                    Submit Bid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else return false
  }
}
