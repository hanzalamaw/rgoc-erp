import './dataTable.css'
import { useEffect } from "react"
import React, { useRef } from 'react';

function dataTable(props){

    useEffect(() => {
        async function fetchData() {
        const res = await fetch(`http://localhost:5000/api/bookings/${props.status}`);
        let data = await res.json();

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
        container.innerHTML = ''; // Clear existing rows

        data.forEach(order => {
            const isPending = order.pending > 0;

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>
                <select class="status-select">
                <option value="no" ${order.status === 'no' ? 'selected' : ''}>Lead</option>
                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>${order.customer_id}</td>
            <td>${order.booking_id}</td>
            <td>${order.name}</td>
            <td>${order.contact}</td>
            <td>${order.type}</td>
            <td>${order.group}</td>
            <td>${order.booking_date}</td>
            <td>${order.persons}</td>
            <td>Rs. ${parseInt(order.package_price).toLocaleString("en-PK")}</td>
            <td>${order.infants}</td>
            <td>Rs. ${parseInt(order.infant_price).toLocaleString("en-PK")}</td>
            <td>Rs. ${parseInt(order.total_price).toLocaleString("en-PK")}</td>
            <td>Rs. ${parseInt(order.bank).toLocaleString("en-PK")}</td>
            <td>Rs. ${parseInt(order.cash).toLocaleString("en-PK")}</td>
            <td>Rs. ${parseInt(order.received).toLocaleString("en-PK")}</td>
            <td>Rs. ${parseInt(order.pending).toLocaleString("en-PK")}</td>
            <td>${order.refrence}</td>
            <td>${order.source}</td>
            <td>${order.requirement}</td>
            <td class="status-cell">
                <span class="badge ${isPending ? 'pending' : 'received'}">
                ${isPending ? 'Pending' : 'Received'}
                </span>
            </td>
            <td><button class="arrow-btn"><img src="imgs/edit.png"></button></td>
            <td><button class="invoice-btn"><img src="imgs/invoice.png"></button></td>
            <td><button class="delete-btn"><img src="imgs/delete.png"></button></td>
            `;

            const dropdownRow = document.createElement('tr');
            dropdownRow.classList.add('dropdown-row');
            dropdownRow.style.display = 'none';
            dropdownRow.innerHTML = `
            <td colspan="25">
                <div class="next">
                ${generateInputField("Customer ID", "customer_id", order)}
                ${generateInputField("Booking ID", "booking_id", order)}
                ${generateInputField("Name", "name", order)}
                ${generateInputField("Contact No", "contact", order)}
                ${generateInputField("Type", "type", order)}
                ${generateInputField("Address", "group", order)}
                ${generateInputField("Booking Date", "booking_date", order)}
                ${generateInputField("No. of Persons", "persons", order)}
                ${generateInputField("Package Price", "package_price", order)}
                ${generateInputField("No. of Infants", "infants", order)}
                ${generateInputField("Infant Price", "infant_price", order)}
                ${generateInputField("Total Amount", "total_price", order)}
                ${generateInputField("Bank", "bank", order)}
                ${generateInputField("Cash", "cash", order)}
                ${generateInputField("Received Amount", "received", order)}
                ${generateInputField("Pending Amount", "pending", order)}
                ${generateInputField("Refrence", "refrence", order)}
                ${generateInputField("Source", "source", order)}
                ${generateInputField("Requirement", "requirement", order)}
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

            // Bind status update
            row.querySelector('.status-select').addEventListener('change', (e) => {
                const newStatus = e.target.value;
                fetch('/api/bookings/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: order.booking_id, status: newStatus }),
                }).then(() => alert('Status updated'));
            });

            // Bind invoice logic
            row.querySelector('.invoice-btn').addEventListener('click', () => {
                
            });

            // Bind delete logic
            row.querySelector('.delete-btn').addEventListener('click', () => {
                if (window.confirm("Are you sure you want to delete this order?")) {
                    fetch('/api/bookings/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({ booking_id: order.booking_id }).toString()
                    })
                    .then(res => res.text())
                    .then(msg => {
                        alert(msg);
                        fetchData(); // Reload
                    });
                }
            });

            // Bind update details
            dropdownRow.querySelector('.submit-btn').addEventListener('click', () => {
                const fields = ['customer_id', 'name', 'contact', 'type', 'group', 'booking_date', 'persons', 'package_price', 'infants', 'infant_price', 'total_price', 'cash', 'bank', 'received', 'pending', 'refrence', 'source', 'requirement'];
                const payload = { booking_id: order.booking_id };
                console.log(payload);
                fields.forEach(field => {
                    const el = dropdownRow.querySelector(`#${field}-${order.booking_id}`);
                    if (el) payload[field] = el.value;
            });

            fetch('/api/bookings/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(payload).toString()
            }).then(res => res.text())
                .then(msg => alert(msg));
            });

            container.appendChild(row);
            container.appendChild(dropdownRow);
        });

        function generateInputField(label, idKey, order) {
            return `
            <div class="align"><label>${label}: </label>
                <input type="text" id="${idKey}-${order.booking_id}" value="${order[idKey] || ''}" />
            </div>
            `;
        }
        }

        fetchData();
    }, [props.status, props.name, props.contact]);

    return(
        <>
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>Booking Status</th>
                        <th>Customer ID</th>
                        <th>Booking ID</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Type</th>
                        <th>Group</th>
                        <th>Booking Date</th>
                        <th>Persons</th>
                        <th>package Price</th>
                        <th>Infants</th>
                        <th>Infant Price</th>
                        <th>Total Price</th>
                        <th>Bank</th>
                        <th>Cash</th>
                        <th>Received</th>
                        <th>Pending</th>
                        <th>Refrence</th>
                        <th>Source</th>
                        <th>Description</th>
                        <th>Payment Status</th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="ordersContainer"></tbody>
            </table>
        </div>
        </>
    )
}

export default dataTable