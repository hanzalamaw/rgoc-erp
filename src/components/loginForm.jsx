import './loginForm.css';
import webhouse from '../assets/webhouse-logo.png';
import gdtt from '../assets/gdtt-logo.png';
import twf from '../assets/twf-logo.png';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

function LoginForm() {
  useEffect(() => {
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

    fetch('http://localhost:5000/api/login', {
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
        localStorage.setItem('user', JSON.stringify(data.user)); // store user
        document.getElementById("userLogin").style.display = 'none';
        document.getElementById("companySelect").style.display = 'flex';
      })
      .catch(err => {
        console.error(err);
        
        document.querySelector(".statusMsg").style.display = "flex";
        document.getElementById("message").style.color = "#e20636";
        document.getElementById("message").textContent=`Invalid Credentials!`;
      });
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
    const res = await fetch('http://localhost:5000/api/guest-password', {
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
          <button type="button" className="guestBtn" onClick={() => guestLogin()}>GUEST</button>
          <button type="submit" className="loginBtn">LOGIN</button>
        </div>
      </form>

      <div id='companySelect' style={{ display: 'none' }} className='fade-in-section'>
        <div className='upperLogo'>
          <img src={webhouse} alt="Webhouse Logo" id='webhouse' />
          <Link to="/gdtt-home"><img src={gdtt} alt="GDTT Logo" id='gdtt' /></Link>
        </div>

        <div className='lowerLogo'>
          <img src={twf} alt="TWF Logo" id='twf' />
        </div>
      </div>
    </>
  );
}

export default LoginForm;
