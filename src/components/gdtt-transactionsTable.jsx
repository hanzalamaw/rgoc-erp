import './dataTable.css'
import { useEffect, useState } from 'react'
import edit from '../assets/edit.png'
import deleteImg from '../assets/delete.png' 
import invoice from '../assets/invoice.png'
import React, { useRef } from 'react';

function transactionsTable(props){
    const [allData, setAllData] = useState([]);
    const [displayedData, setDisplayedData] = useState([]);
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`${apiURL}/bookings/confirmed`);
            let data = await res.json();
            setAllData(data);
            renderData(data);
        }

        fetchData();

    }, [props.status, props.name, props.contact]);

    function renderData(data){
        const groupFilter = document.getElementById("groups");
        const groups = [...new Set(data.map(row => row.group))]; 

        groups.forEach(group => {
            if (![...groupFilter.options].some(opt => opt.value === group)) {
                const option = document.createElement("option");
                option.value = group;
                option.textContent = group;
                groupFilter.appendChild(option);
            }
        });

        // Filtering logic
        if (props.name) {
            data = data.filter(order =>
            order.name?.toLowerCase().includes(props.name.toLowerCase())
            );
        }
        if (props.contact) {
            data = data.filter(order =>
            order.contact?.toLowerCase().includes(props.contact.toLowerCase())
            );
        }

        const container = document.getElementById('ordersContainer');
        if (!container) return;
        container.innerHTML = '';

        data.forEach(order => {
            const isPending = order.pending > 0;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.customer_id}</td>
                <td>${order.booking_id}</td>
                <td>${order.name}</td>
                <td>${order.contact}</td>
                <td>Rs. ${parseInt(order.total_price).toLocaleString("en-PK")}</td>
                <td>Rs. ${parseInt(order.bank).toLocaleString("en-PK")}</td>
                <td>Rs. ${parseInt(order.cash).toLocaleString("en-PK")}</td>
                <td>Rs. ${parseInt(order.received).toLocaleString("en-PK")}</td>
                <td>Rs. ${parseInt(order.pending).toLocaleString("en-PK")}</td>
                <td class="status-cell">
                    <span class="badge ${isPending ? 'pending' : 'received'}">
                    ${isPending ? 'Pending' : 'Received'}
                    </span>
                </td>
                <td>
                    <button class="arrow-btn">
                        <img src=${edit} style="cursor: pointer;">
                    </button>
                </td>
            `;

            const dropdownRow = document.createElement('tr');
            dropdownRow.classList.add('dropdown-row');
            dropdownRow.style.display = 'none';
            dropdownRow.innerHTML = `
            <td colspan="25">
                <div class="next">
                    ${generateInputField("Total Amount", "total_price", order)}
                    ${generateInputField("Bank", "bank", order)}
                    ${generateInputField("Cash", "cash", order)}
                    ${generateInputField("Received Amount", "received", order)}
                    ${generateInputField("Pending Amount", "pending", order)}
                <div class="align">
                    <p>‎</p>
                    <button class="submit-btn">Submit</button>
                </div>
                </div>
            </td>
            `;

            // Bind dropdown toggle
            row.querySelector('.arrow-btn').addEventListener('click', () => {
                dropdownRow.style.display = dropdownRow.style.display === 'none' ? 'table-row' : 'none';
            });

            // Bind update details
            dropdownRow.querySelector('.submit-btn').addEventListener('click', () => {
                const fields = ['customer_id', 'name', 'contact', 'type', 'group', 'booking_date', 'persons', 'package_price', 'infants', 'infant_price', 'total_price', 'cash', 'bank', 'received', 'pending', 'refrence', 'source', 'requirement'];
                const payload = { booking_id: order.booking_id };
                const safeBookingId = sanitizeId(order.booking_id);

                console.log(payload);

                fields.forEach(field => {
                    const el = dropdownRow.querySelector(`#${field}-${safeBookingId}`);
                    if (el) payload[field] = el.value;
                });

                fetch(`${apiURL}/bookings/editTransactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(payload).toString()
                }).then(res => res.text())
                    .then(msg => {
                        alert(msg);
                        fetchData();
                    });
            });

            container.appendChild(row);
            container.appendChild(dropdownRow);
            setDisplayedData(data);
        });

        function sanitizeId(id) {
            return id.replace(/[^a-zA-Z0-9_-]/g, '');
        }

        function generateInputField(label, idKey, order) {
            const safeBookingId = sanitizeId(order.booking_id);

            let value = order[idKey];
            
            if (idKey === 'booking_date' && value) {
                value = new Date(value).toISOString().split('T')[0];
            }

            return `
                <div class="align"><label>${label}: </label>
                    <input type="text" id="${idKey}-${safeBookingId}" value="${value}" />
                </div>
            `;
        }
    }

    function applyFilters(){
        let filtered = [...allData];

        const group = document.getElementById("groups").value;
        const search = document.getElementById("search").value;

        if (group !== "all") {
            filtered = filtered.filter(row => row.group === group);
        }

        setDisplayedData(filtered);
        renderData(filtered);
    }

    function exportToCSV() {

        if (!displayedData || displayedData.length === 0) {
            alert("No data to export.");
            return;
        }       

        const headers = [
            "Customer ID", "Booking ID", "Name", "Contact", "Type", "Group", "Booking Date", "No Of Persons", "Package Price",
            "No of Infants", "Infant Price", "Total Price", "Bank", "Cash", "Received", "Pending", "Reference",
            "Source", "Requirement", "Payment Status"
        ];

        const rows = displayedData.map(order => [
            order.customer_id ?? '',
            order.booking_id ?? '',
            order.name ?? '',
            order.contact ?? '',
            order.type ?? '',
            order.group ?? '',
            new Date(order.booking_date).toISOString().split('T')[0] ?? '',
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
            (order.pending > 0 ? "Pending" : "Received")
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'GDTT Transactions.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return(
        <>
        <div className='topBar'> 
            <h2>TRANSACTIONS</h2>

            <div className='topFilters'>
                <input type="text" id='search' placeholder='Search' onInput={applyFilters}/>

                <select name="groups" id="groups" onChange={applyFilters}>
                    <option value="all">All</option>
                </select>

                <button id='hiderr' onClick={exportToCSV}>Export to CSV</button>
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
        </>
    )
}

export default transactionsTable