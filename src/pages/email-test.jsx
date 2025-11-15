import { getUser, getToken } from "../utils/auth";

function EmailTest() {
  const handleSendEmail = async () => {
    const senderEmail = getUser()?.email;       // from local storage
    const token = getToken();                   // your JWT if required

    if (!senderEmail) {
      alert("No user email found in local storage.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({
          to: senderEmail,
          subject: "ERP Test Email",
          message: "This is a test email sent from your ERP frontend.",
        }),
      });

      const data = await res.json();
      console.log(data);

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