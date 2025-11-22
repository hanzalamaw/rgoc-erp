import './navigation_bar.css'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from "react";
import { getToken, getUser } from '../utils/auth'
import { useLocation } from "react-router-dom";

function NavigationBar(props) {
  const navigate = useNavigate();
  const location = useLocation();

  const token = getToken();
  if (!token) {
    navigate('/');
    return null;
  }

  const role = getUser()?.gdtt;

  const navItems = [
    { id: 'dashboard', path: '/gdtt-home', label: 'Dashboard' },
    { id: 'gdtt-newBooking', path: '/gdtt-newBooking', label: 'Add New Booking' },
    { id: 'gdtt-bookingManage', path: '/gdtt-bookingManage', label: 'Bookings Management' },
    { id: 'gdtt-querryManage', path: '/gdtt-querryManage', label: 'Query Management' },
    { id: 'gdtt-loanManage', path: '/gdtt-loanManage', label: 'Loan Management' },
    { id: 'gdtt-transactions', path: '/gdtt-transactions', label: 'Transactions' },
    { id: 'gdtt-expenses', path: '/gdtt-expenses', label: 'Expenses' },
    { id: 'gdtt-quote', path: '/gdtt-quote', label: 'Generate Quote' }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (role === "sales") {
      return item.id === "gdtt-newBooking" || item.id === "gdtt-querryManage";
    }
    return true;
  });

  useEffect(() => {
    if (role === "sales") {
      const allowedPages = ["/gdtt-newBooking", "/gdtt-querryManage"];

      // Redirect ONLY if the current page is NOT allowed
      if (!allowedPages.includes(location.pathname)) {
        navigate("/gdtt-newBooking");
      }
    }
  }, [role, location.pathname, navigate]);

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  }

  const changeCompany = () => {
    navigate('/');
  }

  return (
    <div className='navBar'>
      <div className='navContent'>
        {filteredNavItems.map(item => (
          <div
            className={`navSection ${props.active === item.id ? 'active' : ''}`}
            id={item.id}
            key={item.id}
          >
            <Link to={item.path}>{item.label}</Link>
            <p>›</p>
          </div>
        ))}
      </div>

      <div className='profile'>
        <div className='profile-content'>
          <p>Logged in as</p>
          <h3>{getUser()?.name}</h3>
        </div>
        <div className='buttonsSection'>
          <button className='changeBtn' onClick={changeCompany}>Change Company</button>
          <button className='logoutBtn' onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default NavigationBar;