import { getUser, getToken } from "../utils/auth";

function EmailTest() {
  const apiURL = import.meta.env.VITE_API_URL;   

const handleSendEmail = async () => {
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
        subject: "ERP Test Email",
        html: htmlTemplate, // <-- Use HTML
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Email sent successfully!");
    } else {
      alert("Failed to send email.");
    }
  } catch (error) {
    console.error(error);
    alert("Error sending email.");
  }
};


  return (
    <>
      <button id="hiderr" onClick={handleSendEmail}>
        Send Test Email
      </button>
    </>
  );
}

export default EmailTest;