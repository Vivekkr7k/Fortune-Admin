import React from 'react'
import './Navbar.css'
import { assets } from './../../assets/assets';
import logo from '../../assets/logo.jpeg'

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className="navbar-content">
        <div className="navbar-brand">
          <img className='navbar-logo' src={logo} alt="Fortune India" />
          <span className="navbar-title">Fortune India</span>
        </div>
        <div className="navbar-actions">
          {/* Add any navbar actions here if needed */}
        </div>
      </div>
    </div>
  )
}

export default Navbar