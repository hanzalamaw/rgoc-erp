import './dataTable.css';
import './loans.css';
import { useEffect, useState } from 'react';
import edit from '../assets/edit.png';
import deleteImg from '../assets/delete.png';
import invoice from '../assets/invoice.png';

function LoansTable(props) {
  const { status: listStatus, refreshKey } = props;
  const apiURL = import.meta.env.VITE_API_URL;

  const [allData, setAllData] = useState([]);

  // ---- Payment modal state ----
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [payCash, setPayCash] = useState('');
  const [payBank, setPayBank] = useState('');

  // Derived preview numbers
  const enteredCash = Number(payCash || 0);
  const enteredBank = Number(payBank || 0);
  const addNow = enteredCash + enteredBank;

  const bk_total_price = Number(selectedLoan?.total_price || 0);
  const bk_received_now = Number(selectedLoan?.received || 0) + addNow;
  const bk_pending_now = Math.max(0, bk_total_price - bk_received_now);

  const ln_total_loan = Number(selectedLoan?.total_loan || 0);
  const ln_received_loan_now = Number(selectedLoan?.received_loan || 0) + addNow;
  const ln_pending_now = Math.max(0, ln_total_loan - ln_received_loan_now);

  // -----------------------------
  async function fetchData() {
    const res = await fetch(`${apiURL}/loans/active`);
    const data = await res.json();
    setAllData(data);
    renderData([...data].reverse());
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listStatus, refreshKey]);

  function openPayModal(order) {
    setSelectedLoan(order);
    setPayCash('');
    setPayBank('');
    setShowPayModal(true);
  }

  function closePayModal() {
    setShowPayModal(false);
    setSelectedLoan(null);
    setPayCash('');
    setPayBank('');
  }

  async function submitPayment(e) {
    e.preventDefault();
    if (!selectedLoan) return;

    try {
      const res = await fetch(
        `${apiURL}/loans/${encodeURIComponent(selectedLoan.booking_id)}/pay`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cash: enteredCash, bank: enteredBank }),
        }
      );

      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : { error: await res.text() };

      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);

      alert(data.message || 'Payment recorded ✅');
      closePayModal();
      fetchData();
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message || 'Failed to record payment');
    }
  }

  function renderData(data) {
    const container = document.getElementById('ordersContainer');
    if (!container) return;
    container.innerHTML = '';

    data.forEach((order) => {
      const isPending = Number(order.pending) > 0;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><p onclick="showProfile('${order.customer_id}')" class="packageBtn">+</p></td>
        <td>${order.loan_status}</td>
        <td>${order.customer_id}</td>
        <td>${order.booking_id}</td>
        <td>${order.name}</td>
        <td>${order.contact}</td>
        <td>${order.type}</td>
        <td>${order.group}</td>
        <td>Rs. ${parseInt(order.total_price).toLocaleString('en-PK')}</td>
        <td class="querryHider">${order.total_loan==0 ? 'none' : "Rs. " + parseInt(order.total_loan).toLocaleString("en-PK")}</td>
        <td class="querryHider">Rs. ${parseInt(order.bank || 0).toLocaleString('en-PK')}</td>
        <td class="querryHider">Rs. ${parseInt(order.cash || 0).toLocaleString('en-PK')}</td>
        <td class="querryHider">Rs. ${parseInt(order.received || 0).toLocaleString('en-PK')}</td>
        <td class="querryHider">Rs. ${parseInt(order.pending || 0).toLocaleString('en-PK')}</td>
        <td class="status-cell querryHider">
          <span class="badge ${isPending ? 'pending' : 'received'}">
            ${isPending ? 'Pending' : 'Received'}
          </span>
        </td>
        <td><button class="arrow-btn"><img src=${edit} style="cursor:pointer;" /></button></td>
        <td class="querryHider"><button class="invoice-btn"><img src=${invoice} style="cursor:pointer;" /></button></td>
        <td><button class="delete-btn"><img src=${deleteImg} style="cursor:pointer;" /></button></td>
      `;

      // Only hide cells for this row when status is "leads"
      if (props.status === 'leads') {
        row.querySelectorAll('.querryHider').forEach((el) => (el.style.display = 'none'));
      }

      // Dropdown row (edit inline fields)
      const dropdownRow = document.createElement('tr');
      dropdownRow.classList.add('dropdown-row');
      dropdownRow.style.display = 'none';
      dropdownRow.innerHTML = `
        <td colspan="25">
          <div class="next">
            ${generateInputField('Customer ID', 'customer_id', order)}
            ${generateInputField('Booking ID', 'booking_id', order)}
            ${generateInputField('Name', 'name', order)}
            ${generateInputField('Contact No', 'contact', order)}
            ${generateInputField('Type', 'type', order)}
            ${generateInputField('Address', 'group', order)}
            ${generateInputField('Booking Date', 'booking_date', order)}
            ${generateInputField('No. of Persons', 'persons', order)}
            ${generateInputField('Package Price', 'package_price', order)}
            ${generateInputField('No. of Infants', 'infants', order)}
            ${generateInputField('Infant Price', 'infant_price', order)}
            ${generateInputField('Total Amount', 'total_price', order)}
            ${generateInputField('Bank', 'bank', order)}
            ${generateInputField('Cash', 'cash', order)}
            ${generateInputField('Received Amount', 'received', order)}
            ${generateInputField('Pending Amount', 'pending', order)}
            ${generateInputField('Refrence', 'refrence', order)}
            ${generateInputField('Source', 'source', order)}
            ${generateInputField('Requirement', 'requirement', order)}
            <div class="align">
              <p>‎</p>
              <button class="submit-btn">Submit</button>
            </div>
          </div>
        </td>
      `;

      // Toggle edit dropdown
      row.querySelector('.arrow-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // prevent opening payment modal
        dropdownRow.style.display = dropdownRow.style.display === 'none' ? 'table-row' : 'none';
      });

      // Invoice click (placeholder)
      row.querySelector('.invoice-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        // TODO: implement invoice logic
      });

      // Delete logic
      row.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this loan?')) return;

        fetch(`${apiURL}/loans/${encodeURIComponent(order.booking_id)}`, {
          method: 'DELETE',
        })
          .then(async (res) => {
            const ct = res.headers.get('content-type') || '';
            const isJSON = ct.includes('application/json');
            const data = isJSON ? await res.json() : { error: await res.text() };

            if (!res.ok) {
              throw new Error(data.error || data.message || `HTTP ${res.status}`);
            }

            alert(data.message || 'Deleted ✅');
            fetchData();
          })
          .catch((err) => {
            console.error('Error:', err);
            alert(err.message || 'Failed to delete loan 😓');
          });
      });

      // Open payment modal when clicking the row (ignore control areas)
      row.addEventListener('click', (e) => {
        if (
          e.target.closest('.delete-btn') ||
          e.target.closest('.arrow-btn') ||
          e.target.closest('.invoice-btn') ||
          e.target.closest('.packageBtn')
        )
          return;
        openPayModal(order);
      });

      // Inline update submit
      dropdownRow.querySelector('.submit-btn').addEventListener('click', () => {
        let fields = [];
        if (props.status === 'leads') {
          fields = [
            'customer_id',
            'name',
            'contact',
            'type',
            'group',
            'booking_date',
            'persons',
            'package_price',
            'infants',
            'infant_price',
            'total_price',
            'refrence',
            'source',
            'requirement',
          ];
        } else {
          fields = [
            'customer_id',
            'name',
            'contact',
            'type',
            'group',
            'booking_date',
            'persons',
            'package_price',
            'infants',
            'infant_price',
            'total_price',
            'cash',
            'bank',
            'received',
            'pending',
            'refrence',
            'source',
            'requirement',
          ];
        }

        const payload = { booking_id: order.booking_id };
        const safeBookingId = sanitizeId(order.booking_id);
        fields.forEach((field) => {
          const el = dropdownRow.querySelector(`#${field}-${safeBookingId}`);
          if (el) payload[field] = el.value;
        });

        fetch(`${apiURL}/bookings/edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(payload).toString(),
        })
          .then((res) => res.text())
          .then((msg) => {
            alert(msg);
            fetchData();
          });
      });

      container.appendChild(row);
      container.appendChild(dropdownRow);
    });

    function sanitizeId(id) {
      return String(id).replace(/[^a-zA-Z0-9_-]/g, '');
    }

    function generateInputField(label, idKey, order) {
      const safeBookingId = sanitizeId(order.booking_id);
      let value = order[idKey];

      if (idKey === 'booking_date' && value) {
        value = new Date(value).toISOString().split('T')[0];
      }

      return `
        <div class="align"><label>${label}: </label>
          <input type="text" id="${idKey}-${safeBookingId}" value="${value ?? ''}" />
        </div>
      `;
    }
  }

  // --------- Profile popup ----------
  window.showProfile = function (id) {
    const popup = document.querySelector('.customer-history-modal');
    popup.classList.add('show');
    popup.style.display = 'flex';

    // Reset card contents (keep headers intact)
    const querryContent = document.querySelector("#querrySide .history-card-content");
    const travelContent = document.querySelector("#travelSide .history-card-content");
    const loanContent = document.querySelector("#loanSide .history-card-content");
    
    querryContent.innerHTML = '<p class="history-loading">Loading...</p>';
    travelContent.innerHTML = '<p class="history-loading">Loading...</p>';
    loanContent.innerHTML = '<p class="history-loading">Loading...</p>';

    fetch(`${apiURL}/profile?customer_id=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => {
        // Queries
        querryContent.innerHTML = '';
        if (data.Query && data.Query.length > 0) {
          data.Query.forEach((item) => {
            const p = document.createElement('p');
            p.className = 'history-item';
            p.textContent = `${item.group} - ${item.type} (${item.date})`;
            querryContent.appendChild(p);
          });
        } else {
          const p = document.createElement('p');
          p.className = 'history-empty';
          p.textContent = 'No query history';
          querryContent.appendChild(p);
        }

        // Bookings
        travelContent.innerHTML = '';
        if (data.Booking && data.Booking.length > 0) {
          data.Booking.forEach((item) => {
            const p = document.createElement('p');
            p.className = 'history-item';
            p.textContent = `${item.group} - ${item.type} (${item.date})`;
            travelContent.appendChild(p);
          });
        } else {
          const p = document.createElement('p');
          p.className = 'history-empty';
          p.textContent = 'No travel history';
          travelContent.appendChild(p);
        }

        // Loans
        loanContent.innerHTML = '';
        if (data.Loan && data.Loan.length > 0) {
          data.Loan.forEach((item) => {
            const p = document.createElement('p');
            p.className = 'history-item';
            p.textContent = `${item.group} - ${item.type} | Total Loan: Rs. ${parseInt(
              item.total_loan
            ).toLocaleString('en-PK')}`;
            loanContent.appendChild(p);
          });
        } else {
          const p = document.createElement('p');
          p.className = 'history-empty';
          p.textContent = 'No loan history';
          loanContent.appendChild(p);
        }
      })
      .catch((err) => {
        console.error('Error fetching customer history:', err);
        querryContent.innerHTML = '<p class="history-error">Error loading data</p>';
        travelContent.innerHTML = '<p class="history-error">Error loading data</p>';
        loanContent.innerHTML = '<p class="history-error">Error loading data</p>';
      });
  };

  const close = () => {
    document.querySelector('.customer-history-modal').style.display = 'none';
    document.querySelector('.customer-history-modal').classList.remove('show');
  };

  // Basic filtering (kept hook for future UI)
  function applyFilters() {
    let filtered = [...allData];
    const group = document.getElementById('groups')?.value;
    const search = document.getElementById('search')?.value;

    if (group && group !== 'all') {
      filtered = filtered.filter((row) => row.group === group);
    }
    // (search not applied here since original code didn't either)
    renderData(filtered);
  }

  if (props.status === 'leads') {
    // Hide columns at initial mount (table header cells)
    setTimeout(() => {
      document.querySelectorAll('.querryHider').forEach((el) => {
        el.style.display = 'none';
      });
    }, 0);
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Loan Status</th>
              <th>Customer ID</th>
              <th>Booking ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Group</th>
              <th>Total Price</th>
              <th>Total Loan</th>
              <th className="querryHider">Bank</th>
              <th className="querryHider">Cash</th>
              <th className="querryHider">Received</th>
              <th className="querryHider">Pending</th>
                <th className="querryHider">Payment Status</th>
                <th></th>
                <th className="querryHider"></th>
              <th></th>
            </tr>
          </thead>
          <tbody id="ordersContainer">
            <tr style={{ cursor: 'pointer' }}>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
              <td>Loading..</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* EXISTING PROFILE MODAL */}
      <section className="blockedUser customer-history-modal">
        <div className="content">
          <h2>Customer History</h2>

          <div className="history-grid">
            <div className="history-card" id="querrySide">
              <div className="history-card-header">
                <span className="history-icon">📋</span>
                <b>Query History</b>
              </div>
              <div className="history-card-content"></div>
            </div>

            <div className="history-card" id="travelSide">
              <div className="history-card-header">
                <span className="history-icon">✈️</span>
                <b>Travel History</b>
              </div>
              <div className="history-card-content"></div>
            </div>

            <div className="history-card" id="loanSide">
              <div className="history-card-header">
                <span className="history-icon">💰</span>
                <b>Loan History</b>
              </div>
              <div className="history-card-content"></div>
            </div>
          </div>

          <button className="history-close-btn" onClick={(e) => close(e)}>Close</button>
        </div>
      </section>

      {/* PAYMENT MODAL — same structure/classes as your Loans modal */}
      <section
        className={`newLoanModal ${showPayModal ? 'show' : ''}`}
        style={{ display: showPayModal ? 'flex' : 'none' }}
      >
        <div className="content">
          <div className="loanModalHeader">
            <h1>Update Payment</h1>
          </div>

          {selectedLoan && (
            <form onSubmit={submitPayment}>
              <div id="displaySection">
                <div className="displaySectionContent">
                  <p>Customer ID: {selectedLoan.customer_id ?? '-'}</p>
                  <p>Booking ID: {selectedLoan.booking_id ?? '-'}</p>
                  <p>Name: {selectedLoan.name ?? '-'}</p>
                  <p>Contact: {selectedLoan.contact ?? '-'}</p>
                  <p>
                    Booking Date:{' '}
                    {new Date(selectedLoan.booking_date).toISOString().split('T')[0] ?? '-'}
                  </p>
                  <p>Trip Type: {selectedLoan.type ?? '-'}</p>
                  <p>Total Price: Rs. {parseInt(selectedLoan.total_price).toLocaleString('en-PK')}</p>
                  <p>Total Loan: Rs. {parseInt(selectedLoan.total_loan || 0).toLocaleString('en-PK')}</p>
                  <p>
                    Received (Total): Rs.{' '}
                    {parseInt(selectedLoan.received || 0).toLocaleString('en-PK')}
                  </p>
                  <p>
                    Received (Loan): Rs.{' '}
                    {parseInt(selectedLoan.received_loan || 0).toLocaleString('en-PK')}
                  </p>
                  <p>
                    Pending (Loan): Rs. {parseInt(selectedLoan.pending || 0).toLocaleString('en-PK')}
                  </p>
                </div>

                <div className="loanDetailsSection">
                  <div className="loanInputSection">
                    <label htmlFor="pay_cash">Cash:</label>
                    <input
                      type="number"
                      id="pay_cash"
                      name="pay_cash"
                      value={payCash}
                      onChange={(e) => setPayCash(e.target.value)}
                      min="0"
                      step="1"
                      placeholder="0"
                      autoComplete="off"
                    />
                  </div>

                  <div className="loanInputSection">
                    <label htmlFor="pay_bank">Bank:</label>
                    <input
                      type="number"
                      id="pay_bank"
                      name="pay_bank"
                      value={payBank}
                      onChange={(e) => setPayBank(e.target.value)}
                      min="0"
                      step="1"
                      placeholder="0"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Live preview */}
                <div className="displaySectionContent">
                  <p>
                    Received (Total): Rs. {bk_received_now.toLocaleString('en-PK')} <br /> Pending  (Total): Rs.{' '}
                    {bk_pending_now.toLocaleString('en-PK')}
                  </p>
                  <p>
                    Received (Loan): Rs. {ln_received_loan_now.toLocaleString('en-PK')} <br /> Pending  (Loan): Rs.{' '}
                    {ln_pending_now.toLocaleString('en-PK')}
                  </p>
                </div>
              </div>

              <div className="loanBtns">
                <button type="button" onClick={closePayModal}>
                  Close
                </button>
                <button className="submitBtn" type="submit" disabled={addNow <= 0}>
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

export default LoansTable;
