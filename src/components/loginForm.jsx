import './loginForm.css';
import webhouse from '../assets/webhouse-logo.png';
import gdtt from '../assets/gdtt-logo.png';
import twf from '../assets/twf-logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getUser } from '../utils/auth';
import { getToken} from '../utils/auth'

function LoginForm() {
  
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  
  useEffect(() => {

      const token = getToken();
      if (token) {
        document.getElementById("userLogin").style.display = 'none';
        if(getUser()?.access_level == 'none'){
          document.getElementById("Guidelines").style.display = 'flex';
        } else {
          document.getElementById("Guidelines").style.display = 'none';
          document.getElementById("companySelect").style.display = 'flex';
        }
      }
    // Fade-in logic
    const sections = document.querySelectorAll(".fade-in-section");

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => { 
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    sections.forEach(section => {
      observer.observe(section);
    });

    // cleanup
    return () => observer.disconnect();
  }, []);

  function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    updateGuestPassword(password);

    fetch(`${apiURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid credentials');
        return res.json();
      })
      .then(data => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); 
        document.getElementById("userLogin").style.display = 'none';
        if(getUser()?.access_level == 'none'){
          document.getElementById("Guidelines").style.display = 'flex';
        } else {
          document.getElementById("Guidelines").style.display = 'none';
          document.getElementById("companySelect").style.display = 'flex';
        }
      })
      .catch(err => {
        console.error(err);
        
        document.querySelector(".statusMsg").style.display = "flex";
        document.getElementById("message").style.color = "#e20636";
        document.getElementById("message").textContent=`Invalid Credentials!`;
      });
  }

  function proceed() {
    document.getElementById("Guidelines").style.display = 'none';
    document.getElementById("companySelect").style.display = 'flex';
    let access = "Yes";

    updateAccess(access, getUser()?.username);
  }

  const guestLogin = () => {
    document.getElementById("username").value = `guest`;
    const password = Math.floor(1000 + Math.random() * 9000);  

    document.getElementById("message").textContent=`A One-Time Guest Access Code was sent to Hanzala`;
    document.querySelector(".statusMsg").style.display = "flex";
    document.getElementById("message").style.color = "#a7c912";
    
    updateGuestPassword(password);

    const cleanedContact = '923402097079';
    const chatId = `${cleanedContact}@c.us`;

    const headers = {
      "accept": "application/json",
      "content-type": "application/json",
      "authorization": "Bearer hKeOXQ90RIhDhFhoOz8KehFFlkUlfum8VYMni8Od049cacba"
    };

    const messagePayload = {
      chatId: chatId,
      message: `Your one-time guest access code is: ${password}`
    };

    return fetch("https://waapi.app/api/v1/instances/58872/client/action/send-message", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(messagePayload)
    })
    .catch(error => {
    console.error("Send Error:", error);
    alert("Failed to send OTP via WhatsApp.");
    });
  }
  
  async function updateGuestPassword(password) {
    const res = await fetch(`${apiURL}/guest-password`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}` // 🔐 Include JWT
      },
      body: JSON.stringify({ newPassword: password })
    });

    const data = await res.json();
    console.log(data.message || data.error);
  }

  async function updateAccess(password, newUsername) {
    const res = await fetch(`${apiURL}/update-terms`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}` // 🔐 Include JWT
      },
      body: JSON.stringify({ newPassword: password, username: newUsername })
    });

    const data = await res.json();
    console.log(data.message || data.error);
  }

  const checkAccess = (companyName) => {
    if(companyName == 'webhouse' || companyName == 'twf'){
      window.alert(`This Company's CRM is Under Development!`);
      return;
    }
    if(!(getUser()?.companyName == "none")){
      navigate(`/${companyName}-home`);  
    } 
    else {
      window.alert("You Don't Have Access to GDTT's CRM!");
    }
  }

  return (
    <>
      <form id='userLogin' onSubmit={handleLogin} className='fade-in-section'>
        <div className='inputSection'>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            autoComplete="off"
            placeholder="Enter your username"
            required
          />
        </div>

        <div className='inputSection'>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            autoComplete="off"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className='statusMsg'>
          <p id='message'>Done</p>
        </div>

        <div className='inputButtonSection'>
          <button type="button" className="guestBtn" onClick={() => guestLogin()} disabled>GUEST</button>
          <button type="submit" className="loginBtn">LOGIN</button>
        </div>
      </form>

      <div id='companySelect' style={{ display: 'none' }} className='fade-in-section'>
        <div className='upperLogo'>
          <img onClick={() => {checkAccess("webhouse");}} src={webhouse} alt="Webhouse Logo" id='webhouse' />
          <img onClick={() => {checkAccess("gdtt");}} src={gdtt} alt="GDTT Logo" id='gdtt' />
        </div>

        <div className='lowerLogo'>
          <img onClick={() => {checkAccess("twf");}} src={twf} alt="TWF Logo" id='twf' />
        </div>
      </div>

      <div id='Guidelines' className='fade-in-section'>
        <h2>ERP Access & Usage Policy Overview</h2>
        <ul>
          <li>This ERP system supports multiple companies under RGOC; please ensure you're operating under the correct company context.</li>
          <li>Your access is role-based and limited to only the modules and data you are authorized to view or manage.</li>
          <li>All changes are saved in real-time and may impact workflows, reports, and other users.</li>
          <li>You are responsible for any action taken under your account.</li>
          <li>Unauthorized access, misuse of data, or intentional data manipulation will result in disciplinary action.</li>
          <li>By proceeding, you acknowledge and agree to follow RGOC's ERP usage policies and data confidentiality standards.</li>
        </ul>
        <button onClick={proceed}>I Accept!</button>
      </div>
    </>
  );
}

export default LoginForm;