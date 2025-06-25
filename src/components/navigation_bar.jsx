import './navigation_bar.css'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getToken, getUser } from '../utils/auth'

function navigation_bar(props) {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/');
      return;
    }

    const dash = document.getElementById("dashboard");
    const expenses = document.getElementById("expenses");
    const transactions = document.getElementById("transactions");
    const newBooking = document.getElementById("gdtt-newBooking");
    const newQuerry = document.getElementById("gdtt-newQuerry");

    switch(getUser()?.gdtt){
      case "staff+":
        if (dash) dash.style.display = "none";
        navigate('/gdtt-newBooking');
        break;

      case "staff":
        if (dash) dash.style.display = "none";
        if (dash) expenses.style.display = "none";
        if (dash) transactions.style.display = "none";
        navigate('/gdtt-newBooking');
        break;

      case "guest":
        if (dash) dash.style.display = "none";
        if (dash) expenses.style.display = "none";
        if (dash) transactions.style.display = "none";
        if (dash) newBooking.style.display = "none";
        if (dash) newQuerry.style.display = "none";
        navigate('/gdtt-bookingManage');
        break;
    }

  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  }

  const navItems = [
    { id: 'dashboard', path: '/gdtt-home', label: 'Dashboard' },
    { id: 'gdtt-newBooking', path: '/gdtt-newBooking', label: 'Add New Booking' },
    { id: 'gdtt-bookingManage', path: '/gdtt-bookingManage', label: 'Bookings Management' },
    { id: 'gdtt-querryManage', path: '/gdtt-querryManage', label: 'Querry Management' },
    { id: 'transactions', path: '/gdtt-transactions', label: 'Transactions' },
    { id: 'expenses', path: '/gdtt-expenses', label: 'Expenses' },
  ];

  return (
    <>
    <div className='navBar'>
      <p>{props.companyName}</p>
      <div className='navContent'>
        {navItems.map(item => (
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
        <button className='logoutBtn' onClick={() => logout()}>Logout</button> 
      </div>
    </div>
    </>
  );
}

export default navigation_bar;
