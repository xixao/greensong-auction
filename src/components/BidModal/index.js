import React, { Component } from 'react'
import styles from './BidModal.css' // eslint-disable-line
import analytics from '../../utils/analytics'
import api from '../../utils/api'
import InputMask from 'react-input-mask'
import CurrencyInput from 'react-currency-masked-input'

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
    const { products, selectedProduct } = this.props
    const minBid = products.filter(product => product.ref && product.ref['@ref'].id === selectedProduct)[0].data.minimum
    console.log(minBid)

    e.preventDefault()
    const confirmBid = window.confirm("Submit your bid on this item?")
    if (confirmBid) {
      console.log('bid')

      const bidderName = this.bidderName.value
      const bidderEmail = this.bidderEmail.value
      const bidderPhone = this.bidderPhone.value
      const bidderAmount = this.bidderAmount.value

      const unformattedPhone = bidderPhone.replace(/\D/g, '')

      const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

      if (!bidderName) {
        alert('Please enter your name')
        this.bidderName.focus()
        return false
      } else if (!bidderEmail || !emailRegex.test(String(bidderEmail).toLowerCase())) {
        alert('Please enter a valid email address')
        this.bidderEmail.focus()
        return false
      } else if (!bidderPhone || unformattedPhone.length < 10) {
        alert('Please enter your 10-digit phone number')
        this.bidderPhone.focus()
        return false
      } else if (!bidderAmount) {
        alert('Please enter your bid amount')
        return false
      } else if (bidderAmount < minBid) {
        alert('Bid must be greater than minimum bid amount')
        return false
      }

      const bidderInfo = {
        name: bidderName,
        email: bidderEmail,
        phone: bidderPhone,
        bid: bidderAmount,
        item: this.props.selectedProduct,
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
          item: this.props.selectedProduct,
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

    const currentItem = products.filter(product => product.ref && product.ref['@ref'].id === selectedProduct)[0]
    console.log(currentItem)

    if (showMenu === true && selectedProduct) {
      return (
        <div className='settings-wrapper' style={{display: showOrHide}}>
          <div className='settings-content'>
            <span className='settings-close' onClick={this.props.handleModalClose} role="img" aria-label='close'>
              ❌
            </span>
            <h2>{currentItem.data.title}</h2>
            <p>{currentItem.data.description}</p>
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
                <InputMask mask="(999) 999-9999" maskChar=" ">
                  {(inputProps) => (
                    <input
                      {...inputProps}
                      className='product-create-input'
                      placeholder='Phone Number'
                      name='bidder-phone'
                      ref={el => this.bidderPhone = el}
                      autoComplete='off'
                      style={{marginRight: 20}}
                    />
                  )}
                </InputMask>
                <CurrencyInput
                  className='product-create-input'
                  ref={el => this.bidderAmount = el}
                  style={{marginRight: 20}}
                  name='bidder-amount'
                  placeholder='Bid Amount'
                />
                <p>(Minimum bid: ${currentItem.data.minimum})</p>
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
