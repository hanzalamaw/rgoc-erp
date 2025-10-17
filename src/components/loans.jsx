import './loans.css';
import axios from 'axios';
import { useState } from 'react';

function Loans(){
  const apiURL = import.meta.env.VITE_API_URL;

  const [showModal, setShowModal] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  // 'invalid' | 'loading' | 'success' | 'notfound' | 'error' | 'idle'
  const [status, setStatus] = useState('idle');

  const addNewLoan = () => setShowModal(true);

  const close = () => {
    setShowModal(false);
    setBookingId('');
    setBooking(null);
    setStatus('idle');
  };

  const submitLoan = (e) => {
    e.preventDefault();
    close();
  };

  async function fetchBookingDetails(id) {
    try {
      setStatus('loading');
      const response = await axios.get(`${apiURL}/loans/fetchBookings`, {
        params: { booking_id: id }
      });
      console.log('✅ Booking details:', response.data);
      setBooking(response.data);
      setStatus('success');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching booking details:', error.response?.data || error.message);
      setBooking(null);
      if (error.response?.status === 404) setStatus('notfound');
      else setStatus('error');
      return null;
    }
  }

  const handleInput = async (e) => {
    const value = e.target.value.trim();
    setBookingId(value);

    if (value.length === 11) {
      await fetchBookingDetails(value);
    } else {
      setBooking(null);
      setStatus(value.length === 0 ? 'idle' : 'invalid');
    }
  };

  return (
    <>
      <div className='loanHeader'>
        <h1>LOAN MANAGEMENT</h1>
        <button className="addNewLoanBtn" onClick={addNewLoan}>Add New Loan</button>
      </div>

      <section
        className={`newLoanModal ${showModal ? 'show' : ''}`}
        style={{ display: showModal ? 'flex' : 'none' }}
      >
        <div className='content'>
          <div className='loanModalHeader'>
            <h1>Add New Loan</h1>
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
                <div className='displaySectionContent'>
                  <p>Customer ID: {booking.customer_id ?? '-'}</p>
                  <p>Booking ID: {booking.booking_id ?? '-'}</p>
                  <p>Name: {booking.name ?? '-'}</p>
                  <p>Contact: {booking.contact ?? '-'}</p>
                  <p>Booking Date: {booking.booking_date ?? '-'}</p>
                  <p>Trip Type: {booking.type ?? '-'}</p>
                  <p>No. of Persons: {booking.persons ?? '-'}</p>
                  <p>Price Per Person: {booking.package_price ?? '-'}</p>
                  <p>No. of Infants: {booking.infants ?? '-'}</p>
                  <p>Price Per Infant: {booking.infant_price ?? '-'}</p>
                  <p>Total Price: {booking.total_price ?? '-'}</p>
                  <p>Pending Amount: {booking.pending ?? '-'}</p>
                </div>
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
