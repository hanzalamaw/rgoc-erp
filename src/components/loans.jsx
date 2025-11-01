import './loans.css';
import axios from 'axios';
import { useState } from 'react';

function Loans({ onLoanAdded }) {
  const apiURL = import.meta.env.VITE_API_URL;

  // State variables for form fields and status
  const [showModal, setShowModal] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  const [totalLoan, setTotalLoan] = useState('');
  const [loanStatus, setLoanStatus] = useState('Active');
  const [status, setStatus] = useState('idle'); // 'invalid' | 'loading' | 'success' | 'notfound' | 'error' | 'idle'

  // Open modal for adding a new loan
  const addNewLoan = () => setShowModal(true);

  // Close modal and reset states
  const close = () => {
    setShowModal(false);
    setBookingId('');
    setBooking(null);
    setStatus('idle');
    setTotalLoan('');
    setLoanStatus('Active');
    onLoanAdded();
  };

  // Fetch booking details by bookingId
  async function fetchBookingDetails(id) {
    try {
      setStatus('loading');
      const response = await axios.get(`${apiURL}/loans/fetchBookings`, {
        params: { booking_id: id },
      });
      console.log('✅ Booking details:', response.data);
      setBooking(response.data);
      setStatus('success');
    } catch (error) {
      console.error('❌ Error fetching booking details:', error.response?.data || error.message);
      setBooking(null);
      if (error.response?.status === 404) setStatus('notfound');
      else setStatus('error');
    }
  }

  // Handle input changes
  const handleInput = async (e) => {
    const { name, value } = e.target;
    if (name === 'booking_id') {
      setBookingId(value.trim());
      if (value.trim().length === 11) {
        await fetchBookingDetails(value.trim());
      } else {
        setBooking(null);
        setStatus(value.trim().length === 0 ? 'idle' : 'invalid');
      }
    } else if (name === 'total_loan') {
      setTotalLoan(value);
    } else if (name === 'loan_status') {
      setLoanStatus(value);
    }
  };

  // Submit loan form
  const submitLoan = async (e) => {
    e.preventDefault();

    if (status === 'loading') return;  
    setStatus('loading');

    try {
      const encodedBookingId = encodeURIComponent(bookingId);
      console.log('Checking booking with ID:', encodedBookingId);

      // Step 1: Check if booking exists
      const bookingResponse = await axios.get(`${apiURL}/check-booking/${encodedBookingId}`);
      console.log('Booking Response:', bookingResponse.data);

      if (bookingResponse.data.status === 'notfound') {
        setStatus('notfound');
        return;
      }

      if (bookingResponse.data.status === 'error') {
        setStatus('error');
        return;
      }

      // Step 2: Update the booking with loan details
      const updateBookingResponse = await axios.put(`${apiURL}/update-booking`, {
        booking_id: encodedBookingId,
        loan: 'Yes',
        total_loan: parseFloat(totalLoan),
      });

      console.log('Update Booking Response:', updateBookingResponse.data);

      // Always proceed with adding the loan, even if the booking is already up to date
      const loanResponse = await axios.post(`${apiURL}/add-loan`, {
        booking_id: encodedBookingId,
        customer_id: bookingResponse.data.data[0].customer_id,
        booking_date: bookingResponse.data.data[0].booking_date,
        name: bookingResponse.data.data[0].name,
        contact: bookingResponse.data.data[0].contact,
        type: bookingResponse.data.data[0].type,
        group: bookingResponse.data.data[0].group,
        persons: bookingResponse.data.data[0].persons,
        package_price: bookingResponse.data.data[0].package_price,
        infants: bookingResponse.data.data[0].infants,
        infant_price: bookingResponse.data.data[0].infant_price,
        total_price: bookingResponse.data.data[0].total_price,
        bank: bookingResponse.data.data[0].bank,
        cash: bookingResponse.data.data[0].cash,
        received: bookingResponse.data.data[0].received,
        pending: bookingResponse.data.data[0].pending,
        requirement: bookingResponse.data.data[0].requirement,
        refrence: bookingResponse.data.data[0].refrence,
        source: bookingResponse.data.data[0].source,
        status: bookingResponse.data.data[0].status,
        banned: bookingResponse.data.data[0].banned,
        loan_status: loanStatus,  
        total_loan: parseFloat(totalLoan),
        received_loan: 0,
        loan: 'Yes',
      });

      console.log('Loan Response:', loanResponse.data);

      // If the loan was successfully added
      if (loanResponse.data.status === 'success') {
        setStatus('success');
        console.log('Loan added successfully!');
        close();
      } else {
        setStatus('error');
        console.error('Loan addition failed:', loanResponse.data.message); 
      }

    } catch (error) {
      console.error('Error during loan submission:', error);
      setStatus('error');
    }
  };

  return (
    <>
      <div className='loanHeader'>
        <h1>LOAN MANAGEMENT</h1>
        <button className="addNewLoanBtn" onClick={addNewLoan}>Add New Loan</button>
      </div>

      <section className={`newLoanModal ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'flex' : 'none' }}>
        <div className='content'>
          <div className='loanModalHeader'>
            <h1 >Add New Loan</h1>
          </div>

          <form onSubmit={submitLoan}>
            <div className='loanInputSection'>
              <label htmlFor="booking_id">Booking ID</label>
              <input
                type="text"
                id="booking_id"
                name="booking_id"
                placeholder='Search by Booking ID'
                value={bookingId}
                onChange={handleInput}
                autoComplete='off'
                required
              />
            </div>

            {/* ERROR MESSAGES — forced visible via inline style */}
            <div className='errorSection'>
              {status === 'invalid' && (
                <p className='validIDError' style={{ display: 'block' }}>Invalid Booking ID</p>
              )}
              {status === 'notfound' && (
                <p className='validIDError' style={{ display: 'block' }}>No booking details found.</p>
              )}
              {status === 'error' && (
                <p className='validIDError' style={{ display: 'block' }}>Something went wrong. Please try again.</p>
              )}
            </div>

            <div id='displaySection'>
              {status === 'loading' && <p>Loading…</p>}

              {status === 'success' && booking && (
                <>
                  <div className='displaySectionContent'>
                    <p>Customer ID: {booking.customer_id ?? '-'}</p>
                    <p>Booking ID: {booking.booking_id ?? '-'}</p>
                    <p>Name: {booking.name ?? '-'}</p>
                    <p>Contact: {booking.contact ?? '-'}</p>
                    <p>Booking Date: {new Date(booking.booking_date).toISOString().split('T')[0] ?? '-'}</p>
                    <p>Trip Type: {booking.type ?? '-'}</p>
                    <p>No. of Persons: {booking.persons ?? '-'}</p>
                    <p>Price Per Person: Rs. {parseInt(booking.package_price).toLocaleString("en-PK") ?? '-'}</p>
                    <p>No. of Infants: {booking.infants ?? '-'}</p>
                    <p>Price Per Infant: Rs. {parseInt(booking.infant_price).toLocaleString("en-PK") ?? '-'}</p>
                    <p>Total Price: Rs. {parseInt(booking.total_price).toLocaleString("en-PK") ?? '-'}</p>
                    <p>Pending Amount: Rs. {parseInt(booking.pending).toLocaleString("en-PK") ?? '-'}</p>
                  </div>

                  <div className='loanDetailsSection'>
                    <div className='loanInputSection'>
                      <label htmlFor="total_loan">Loan Amount</label>
                      <input
                        type="number"
                        id="total_loan"
                        name="total_loan"
                        placeholder='Enter Loan Amount'
                        value={totalLoan}
                        onChange={handleInput}
                        autoComplete='off'
                        required
                      />
                    </div>

                    <div className='loanInputSection'>
                      <label htmlFor="loan_status">Status</label>
                      <select
                        name="loan_status"
                        id="loan_status"
                        value={loanStatus}
                        onChange={handleInput}
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className='loanBtns'>
              <button type="button" onClick={close}>Close</button>
              <button className='submitBtn' type="submit">Submit</button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default Loans;
