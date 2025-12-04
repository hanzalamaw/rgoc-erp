import './dataTable.css';
import { useEffect, useState } from 'react';
import edit from '../assets/edit.png';

function transactionsTable(props) {
  const [allData, setAllData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const apiURL = import.meta.env.VITE_API_URL;

  // ---- EDIT TRANSACTION MODAL STATE (Bank + Cash only) ----
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [payCash, setPayCash] = useState('');
  const [payBank, setPayBank] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  // -------- DERIVED NUMBERS (SAFE) --------
  const enteredCashRaw = payCash === '' ? 0 : Number(payCash);
  const enteredBankRaw = payBank === '' ? 0 : Number(payBank);

  const enteredCash = Number.isNaN(enteredCashRaw) ? 0 : enteredCashRaw;
  const enteredBank = Number.isNaN(enteredBankRaw) ? 0 : enteredBankRaw;
  const addNow = enteredCash + enteredBank;

  const totalPrice = Number(selectedTxn?.total_price || 0);
  const currentBank = Number(selectedTxn?.bank || 0);
  const currentCash = Number(selectedTxn?.cash || 0);
  const currentReceived = Number(selectedTxn?.received || 0);
  const currentPending = Number(selectedTxn?.pending || 0);

  const newBankTotal = currentBank + enteredBank;
  const newCashTotal = currentCash + enteredCash;
  const newReceivedTotal = currentReceived + addNow;
  const newPendingTotal = Math.max(0, currentPending - addNow);

  const pendingZero = currentPending <= 0;
  const invalidNumbers =
    enteredCash < 0 ||
    enteredBank < 0 ||
    Number.isNaN(enteredCashRaw) ||
    Number.isNaN(enteredBankRaw);
  const exceedsPending = addNow > currentPending;

  // disable submit if *anything* is wrong
  const disableSubmit =
    pendingZero || invalidNumbers || exceedsPending || addNow <= 0 || validationMessage !== '';

  // ---------------- FETCH & RENDER ----------------
  async function fetchData() {
    const res = await fetch(`${apiURL}/bookings/confirmed`);
    const data = await res.json();
    setAllData(data);
    renderData(data);
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.status, props.name, props.contact]);

  function renderData(data) {
    const groupFilter = document.getElementById('groups');
    if (groupFilter) {
      const groups = [...new Set(data.map((row) => row.group))];

      groups.forEach((group) => {
        if (![...groupFilter.options].some((opt) => opt.value === group)) {
          const option = document.createElement('option');
          option.value = group;
          option.textContent = group;
          groupFilter.appendChild(option);
        }
      });
    }

    // Filtering logic (name / contact from props)
    if (props.name) {
      data = data.filter((order) =>
        order.name?.toLowerCase().includes(props.name.toLowerCase())
      );
    }
    if (props.contact) {
      data = data.filter((order) =>
        order.contact?.toLowerCase().includes(props.contact.toLowerCase())
      );
    }

    const container = document.getElementById('ordersContainer');
    if (!container) return;
    container.innerHTML = '';

    data.forEach((order) => {
      const isPending = Number(order.pending) > 0;

      const row = document.createElement('tr');
      row.style.cursor = 'pointer';
      row.innerHTML = `
        <td>${order.customer_id}</td>
        <td>${order.booking_id}</td>
        <td>${order.name}</td>
        <td>${order.contact}</td>
        <td>Rs. ${parseInt(order.total_price).toLocaleString('en-PK')}</td>
        <td>Rs. ${parseInt(order.bank || 0).toLocaleString('en-PK')}</td>
        <td>Rs. ${parseInt(order.cash || 0).toLocaleString('en-PK')}</td>
        <td>Rs. ${parseInt(order.received || 0).toLocaleString('en-PK')}</td>
        <td>Rs. ${parseInt(order.pending || 0).toLocaleString('en-PK')}</td>
        <td class="status-cell">
          <span class="badge ${isPending ? 'pending' : 'received'}">
            ${isPending ? 'Pending' : 'Received'}
          </span>
        </td>
        <td>
          <button class="arrow-btn" style="cursor:pointer;">
            <img src=${edit} style="cursor:pointer;" />
          </button>
        </td>
      `;

      // CLICK ROW → OPEN EDIT MODAL
      row.addEventListener('click', () => {
        openEditModal(order);
      });

      container.appendChild(row);
    });

    setDisplayedData(data);
  }

  // ---------------- FILTERS & CSV ----------------
  function applyFilters() {
    let filtered = [...allData];

    const group = document.getElementById('groups')?.value;
    const search = document.getElementById('search')?.value;

    if (group && group !== 'all') {
      filtered = filtered.filter((row) => row.group === group);
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.name?.toLowerCase().includes(s) ||
          row.contact?.toLowerCase().includes(s) ||
          row.booking_id?.toLowerCase().includes(s)
      );
    }

    setDisplayedData(filtered);
    renderData(filtered);
  }

  function exportToCSV() {
    if (!displayedData || displayedData.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = [
      'Customer ID',
      'Booking ID',
      'Name',
      'Contact',
      'Type',
      'Group',
      'Booking Date',
      'No Of Persons',
      'Package Price',
      'No of Infants',
      'Infant Price',
      'Total Price',
      'Bank',
      'Cash',
      'Received',
      'Pending',
      'Reference',
      'Source',
      'Requirement',
      'Payment Status',
    ];

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const rows = displayedData.map((order) => [
      order.customer_id ?? '',
      order.booking_id ?? '',
      order.name ?? '',
      order.contact ?? '',
      order.type ?? '',
      order.group ?? '',
      order.booking_date
        ? new Date(order.booking_date).toISOString().split('T')[0]
        : '',
      order.persons ?? '',
      order.package_price ?? '',
      order.infants ?? '',
      order.infant_price ?? '',
      order.total_price ?? '',
      order.bank ?? '',
      order.cash ?? '',
      order.received ?? '',
      order.pending ?? '',
      order.refrence ?? '',
      order.source ?? '',
      order.requirement ?? '',
      order.pending > 0 ? 'Pending' : 'Received',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const newDate = new Date();

    const day = String(newDate.getDate()).padStart(2, '0');
    const month = months[newDate.getMonth()];
    const year = newDate.getFullYear();

    const hours = String(newDate.getHours()).padStart(2, '0');
    const minutes = String(newDate.getMinutes()).padStart(2, '0');
    const seconds = String(newDate.getSeconds()).padStart(2, '0');

    const formatted = `${day}_${month}_${year}_(${hours}:${minutes}:${seconds})`;

    link.download = `GDTT_Transactions_Export_${formatted}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ---------------- MODAL LOGIC (Bank + Cash only) ----------------
  function openEditModal(order) {
    setSelectedTxn(order);
    setPayCash('');
    setPayBank('');
    setValidationMessage(
      Number(order.pending || 0) <= 0
        ? 'Pending is already 0. No more payments can be added.'
        : ''
    );
    setShowEditModal(true);
  }

  function closeEditModal() {
    setShowEditModal(false);
    setSelectedTxn(null);
    setPayCash('');
    setPayBank('');
    setValidationMessage('');
  }

  // Update validation message whenever inputs/pending change
  useEffect(() => {
    if (!selectedTxn) return;

    if (pendingZero) {
      setValidationMessage('Pending is already 0. No more payments can be added.');
    } else if (invalidNumbers) {
      setValidationMessage('Amounts must be valid non-negative numbers.');
    } else if (addNow > 0 && exceedsPending) {
      setValidationMessage(
        `Entered amount exceeds pending. Pending: Rs. ${currentPending.toLocaleString(
          'en-PK'
        )}.`
      );
    } else if (addNow <= 0) {
      setValidationMessage('Enter at least one amount (Cash or Bank).');
    } else {
      setValidationMessage('');
    }
  }, [pendingZero, invalidNumbers, exceedsPending, addNow, currentPending, selectedTxn]);

  function handleCashChange(e) {
    setPayCash(e.target.value);
  }

  function handleBankChange(e) {
    setPayBank(e.target.value);
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!selectedTxn) return;

    // Extra safety on submit
    if (disableSubmit) {
      alert(validationMessage || 'Please fix validation errors before submitting.');
      return;
    }

    const payload = {
      booking_id: selectedTxn.booking_id,
      bank: newBankTotal,
      cash: newCashTotal,
      received: newReceivedTotal,
      pending: newPendingTotal,
    };

    try {
      const res = await fetch(`${apiURL}/bookings/editTransactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload).toString(),
      });

      const msg = await res.text();
      if (!res.ok) {
        throw new Error(msg || `HTTP ${res.status}`);
      }

      alert(msg || 'Transaction updated ✅');
      closeEditModal();
      fetchData();
    } catch (err) {
      console.error('Edit transaction error:', err);
      alert(err.message || 'Failed to update transaction');
    }
  }

  // ---------------- RENDER ----------------
  return (
    <>
      <div className="topBar">
        <h2>TRANSACTIONS</h2>

        <div className="topFilters">
          <input type="text" id="search" placeholder="Search" onInput={applyFilters} />

          <select name="groups" id="groups" onChange={applyFilters}>
            <option value="all">All</option>
          </select>

          <button id="hiderr" onClick={exportToCSV}>
            Export to CSV
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Booking ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Total Price</th>
              <th>Bank</th>
              <th>Cash</th>
              <th>Received</th>
              <th>Pending</th>
              <th>Payment Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="ordersContainer">
            <tr>
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

      {/* EDIT TRANSACTION MODAL – reuse .newLoanModal styling */}
      <section
        className={`newLoanModal ${showEditModal ? 'show' : ''}`}
        style={{ display: showEditModal ? 'flex' : 'none' }}
      >
        <div className="content">
          <div className="loanModalHeader">
            <h1>Update Transaction</h1>
          </div>

          {selectedTxn && (
            <form onSubmit={submitEdit}>
              <div id="displaySection">
                {/* Left side – static info */}
                <div className="displaySectionContent">
                  <p>Customer ID: {selectedTxn.customer_id ?? '-'}</p>
                  <p>Booking ID: {selectedTxn.booking_id ?? '-'}</p>
                  <p>Name: {selectedTxn.name ?? '-'}</p>
                  <p>Contact: {selectedTxn.contact ?? '-'}</p>
                  <p>
                    Booking Date:{' '}
                    {selectedTxn.booking_date
                      ? new Date(selectedTxn.booking_date).toISOString().split('T')[0]
                      : '-'}
                  </p>
                  <p>Total Price: Rs. {totalPrice.toLocaleString('en-PK')}</p>
                  <p>
                    Current Bank: Rs. {currentBank.toLocaleString('en-PK')} <br />
                    Current Cash: Rs. {currentCash.toLocaleString('en-PK')}
                  </p>
                  <p>
                    Current Received: Rs. {currentReceived.toLocaleString('en-PK')} <br />
                    Current Pending: Rs. {currentPending.toLocaleString('en-PK')}
                  </p>
                </div>

                {/* Right side – user inputs (Bank + Cash) */}
                <div className="loanDetailsSection">
                  <div className="loanInputSection">
                    <label htmlFor="pay_cash">Add Cash:</label>
                    <input
                      type="number"
                      id="pay_cash"
                      name="pay_cash"
                      value={payCash}
                      onChange={handleCashChange}
                      min="0"
                      step="1"
                      placeholder="0"
                      autoComplete="off"
                      disabled={pendingZero}
                    />
                  </div>

                  <div className="loanInputSection">
                    <label htmlFor="pay_bank">Add Bank:</label>
                    <input
                      type="number"
                      id="pay_bank"
                      name="pay_bank"
                      value={payBank}
                      onChange={handleBankChange}
                      min="0"
                      step="1"
                      placeholder="0"
                      autoComplete="off"
                      disabled={pendingZero}
                    />
                  </div>
                </div>

                {/* Live preview & validation */}
                <div className="displaySectionContents">
                  {pendingZero ? (
                    <p style={{ color: 'red', fontWeight: 600 }}>
                      Pending is already 0. No more payments can be added.
                    </p>
                  ) : (
                    <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%', gap: '0.5rem 4.5rem' }}>
                        <p>
                            New Bank Total: Rs. {newBankTotal.toLocaleString('en-PK')} <br />
                            New Cash Total: Rs. {newCashTotal.toLocaleString('en-PK')}
                        </p>
                        <p>
                            New Received Total: Rs. {newReceivedTotal.toLocaleString('en-PK')} <br />
                            New Pending: Rs. {newPendingTotal.toLocaleString('en-PK')}
                        </p>
                    </div>
                      
                      {validationMessage && (
                        <p style={{ color: 'red', marginTop: '6px' }}>{validationMessage}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="loanBtns">
                <button type="button" onClick={closeEditModal}>
                  Close
                </button>
                <button className="submitBtn" type="submit" disabled={disableSubmit}>
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

export default transactionsTable;
