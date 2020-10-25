import React from 'react'
import logo from '../../assets/logo.svg'
import styles from './AppHeader.css' // eslint-disable-line

const AppHeader = (props) => {
  return (
    <header className='app-header'>
      <div className='app-title-wrapper'>
        <div className='app-title-wrapper'>
          <div className='app-left-nav'>
            <img src={logo} className='app-logo' alt='logo' />
            <div className='app-title-text'>
              <h1 className='app-title'>Greensong Festival</h1>
              <p className='app-intro'>
                Silent Auction
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
