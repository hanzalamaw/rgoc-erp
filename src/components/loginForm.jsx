import './loginForm.css';
import webhouse from '../assets/webhouse-logo.png';
import gdtt from '../assets/gdtt-logo.png';
import twf from '../assets/twf-logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getUser } from '../utils/auth';
import { getToken} from '../utils/auth';

function LoginForm() {
  
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  const sendLoginEmail = async () => {
    const senderEmail = getUser()?.email;
    const name = getUser()?.name;
    const username = getUser()?.username;
    const token = getToken();

    if (!senderEmail) {
      alert("No user email found in local storage.");
      return;
    }

    const htmlTemplate = `
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px; border-radius: 10px;">
    
      <!-- Header -->
      <div style="background: #c51e2a; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h2 style="color: white; margin: 0;">RGOC ERP</h2>
        <p style="color: #ffeaea; margin: 5px 0 0 0; font-size: 14px;">Security Alert: New Login Detected</p>
      </div>

      <!-- Body -->
      <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px;">

        <h3 style="color: #333; margin-top: 0;">Hello ${name},</h3>

        <p style="color: #555; font-size: 15px; line-height: 1.6;">
          A new login was detected on your <strong>RGOC ERP</strong> account.
        </p>

        <div style="margin: 20px 0; padding: 15px; background: #f4f4f4; border-left: 5px solid #c51e2a;">
          <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">
            <strong>Login Details:</strong><br>
            • <strong>Time:</strong> ${new Date().toLocaleString()} <br>
            • <strong>Username:</strong> ${username} <br>
          </p>
        </div>

        <p style="color: #555; font-size: 15px; line-height: 1.6;">
          If this login was <strong>not</strong> done by you, please contact the system administrator immediately so your account can be secured.
        </p>

        <p style="color: #777; font-size: 13px; margin-top: 30px;">
          — This is an automated security email from RGOC ERP
        </p>
      </div>

    </div>

    `;

    try {
      const res = await fetch(`${apiURL}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({
          to: senderEmail,
          subject: "⚠️ New Login Detected",
          html: htmlTemplate, 
        }),
      });

      const data = await res.json();

      if (data.success) {
        //alert("Email sent successfully!");
      } else {
        //alert("Failed to send email.");
      }
    } catch (error) {
      console.error(error);
      //alert("Error sending email.");
    }
  };
  
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
        sendLoginEmail();
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