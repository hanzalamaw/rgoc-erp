import './dataTable.css'
import { useEffect, useState } from 'react'
import edit from '../assets/edit.png'
import deleteImg from '../assets/delete.png'
import invoice from '../assets/invoice.png'
import React, { useRef } from 'react';
import { getUser } from '../utils/auth';
import { getToken} from '../utils/auth';
 
function dataTable(props){
    const apiURL = import.meta.env.VITE_API_URL;

    const [allData, setAllData] = useState([]);
    const [displayedData, setDisplayedData] = useState([]);

    const exportAlertEmail = async (fileName = "Unknown File") => {
        const adminEmail = "hanzalamawahab@gmail.com";
        const name = getUser()?.name || "Unknown User";
        const token = getToken();

        const htmlTemplate = `
            <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px; border-radius: 10px;">
        
            <!-- Header -->
            <div style="background: #c51e2a; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h2 style="color: white; margin: 0;">RGOC ERP</h2>
                <p style="color: #ffeaea; margin: 5px 0 0 0; font-size: 14px;">⚠️ File Export Alert</p>
            </div>

            <!-- Body -->
            <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px;">
            
                <h3 style="color: #333; margin-top: 0;">File Export Notification</h3>

                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                    A user has just exported a file from <strong>RGOC ERP</strong>.
                </p>

                <div style="margin: 20px 0; padding: 15px; background: #f4f4f4; border-left: 5px solid #c51e2a;">
                    <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">
                        <strong>Export Details:</strong><br>
                        • <strong>User Name:</strong> ${name} <br>
                        • <strong>File Exported:</strong> ${fileName} <br>
                        • <strong>Time:</strong> ${new Date().toLocaleString()} <br>
                    </p>
                </div>

                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                    If this export seems suspicious, please review the activity and take appropriate action.
                </p>

                <p style="color: #777; font-size: 13px; margin-top: 30px;">
                    — Automated security email from RGOC ERP
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
                    to: adminEmail,          // ALWAYS send to you
                    subject: "⚠️ File Export Alert – RGOC ERP",
                    html: htmlTemplate,
                }),
            });

            await res.json();
        } catch (error) {
            console.error("Export email error:", error);
        }
    };


    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`${apiURL}/bookings/${props.status}`);
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

        setDisplayedData(data);

        const container = document.getElementById('ordersContainer');
        if (!container) return;
        container.innerHTML = '';

        data.forEach(order => {
            const isPending = order.pending > 0;

            const row = document.createElement('tr');
            row.innerHTML = `
            <td><p onclick="showProfile('${order.customer_id}')" class="packageBtn">+</p></td>
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
            <td>${new Date(order.booking_date).toISOString().split('T')[0]}</td> 
            <td>${order.persons}</td>
            <td>Rs. ${parseInt(order.package_price).toLocaleString("en-PK")}</td>
            <td>${order.infants}</td> 
            <td>Rs. ${parseInt(order.infant_price).toLocaleString("en-PK")}</td>
            <td>Rs. ${parseInt(order.total_price).toLocaleString("en-PK")}</td>
            <td class="querryHider">Rs. ${parseInt(order.bank).toLocaleString("en-PK")}</td>
            <td class="querryHider">Rs. ${parseInt(order.cash).toLocaleString("en-PK")}</td>
            <td class="querryHider">Rs. ${parseInt(order.received).toLocaleString("en-PK")}</td> 
            <td class="querryHider">Rs. ${parseInt(order.pending).toLocaleString("en-PK")}</td> 
            <td class="querryHider">${order.total_loan==0 ? 'none' : "Rs. " + parseInt(order.total_loan).toLocaleString("en-PK")}</td> 
            <td>${order.refrence}</td>
            <td>${order.source}</td>
            <td>${order.requirement}</td>
            <td class="status-cell querryHider">
                <span class="badge ${isPending ? 'pending' : 'received'}">
                ${isPending ? 'Pending' : 'Received'}
                </span>
            </td>
            <td><button class="arrow-btn"><img src=${edit} style="cursor: pointer;"></button></td>
            <td class="querryHider"><button class="invoice-btn querryHider"><img src=${invoice} style="cursor: pointer;"></button></td>
            <td><button class="delete-btn"><img src=${deleteImg} style="cursor: pointer;"></button></td>
            `;

            if(props.status === "leads") {
                document.querySelectorAll(".querryHider").forEach(el => {
                    el.style.display = "none";
                });
            }

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

            row.querySelector('.arrow-btn').addEventListener('click', () => {
                dropdownRow.style.display = dropdownRow.style.display === 'none' ? 'table-row' : 'none';
            });

            // Bind status update
            row.querySelector('.status-select').addEventListener('change', (e) => {
                const newStatus = e.target.value;
                fetch(`${apiURL}/bookings/update-status`, {
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
                    fetch(`${apiURL}/bookings/delete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({ booking_id: order.booking_id }).toString()
                    })
                    .then(res => res.text())
                    .then(msg => {
                        alert(msg);
                        fetchData();
                    });
                }
            });

            // Bind update details
            dropdownRow.querySelector('.submit-btn').addEventListener('click', () => {
                let fields = [];
                if(props.status === "leads") {
                    fields = ['customer_id', 'name', 'contact', 'type', 'group', 'booking_date', 'persons', 'package_price', 'infants', 'infant_price', 'total_price', 'refrence', 'source', 'requirement'];
                } else{
                    fields = ['customer_id', 'name', 'contact', 'type', 'group', 'booking_date', 'persons', 'package_price', 'infants', 'infant_price', 'total_price', 'cash', 'bank', 'received', 'pending', 'refrence', 'source', 'requirement'];
                }
                
                const payload = { booking_id: order.booking_id };
                const safeBookingId = sanitizeId(order.booking_id);

                console.log(payload);

                fields.forEach(field => {
                    const el = dropdownRow.querySelector(`#${field}-${safeBookingId}`);
                    if (el) payload[field] = el.value;
                });

                fetch(`${apiURL}/bookings/edit`, {
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

    window.showProfile = function (id) {
        // Show popup
        const popup = document.querySelector('.customer-history-modal');
        popup.classList.add('show');
        popup.style.display = "flex";

        // Reset card contents (keep headers intact)
        const querryContent = document.querySelector("#querrySide .history-card-content");
        const travelContent = document.querySelector("#travelSide .history-card-content");
        const loanContent = document.querySelector("#loanSide .history-card-content");
        
        querryContent.innerHTML = '<p class="history-loading">Loading...</p>';
        travelContent.innerHTML = '<p class="history-loading">Loading...</p>';
        loanContent.innerHTML = '<p class="history-loading">Loading...</p>';

        // Fetch from API
        fetch(`${apiURL}/profile?customer_id=${encodeURIComponent(id)}`)
            .then(res => res.json())
            .then(data => {
                // Queries
                querryContent.innerHTML = '';
                if (data.Query && data.Query.length > 0) {
                    data.Query.forEach(item => {
                        const p = document.createElement("p");
                        p.className = "history-item";
                        let content = `${item.group} - ${item.type} (${item.date})`
                        p.textContent = content;
                        querryContent.appendChild(p);
                    });
                } else {
                    const p = document.createElement("p");
                    p.className = "history-empty";
                    p.textContent = "No query history";
                    querryContent.appendChild(p);
                }

                // Bookings
                travelContent.innerHTML = '';
                if (data.Booking && data.Booking.length > 0) {
                    data.Booking.forEach(item => {
                        const p = document.createElement("p");
                        p.className = "history-item";
                        let nameStart = item.group.substring(0,2);
                        let content = "";
                        if(nameStart == "IRQ" || nameStart == "IRN"){
                            nameStart = item.group.substring(5);
                            content = `${nameStart} - ${item.type} (${item.date})`
                        } else{
                            content = `${item.group} - ${item.type} (${item.date})`
                        }
                        p.textContent = content;
                        travelContent.appendChild(p);
                    });
                } else {
                    const p = document.createElement("p");
                    p.className = "history-empty";
                    p.textContent = "No travel history";
                    travelContent.appendChild(p);
                }

                // Loans
                loanContent.innerHTML = '';
                if (data.Loan && data.Loan.length > 0) {
                    data.Loan.forEach(item => {
                        const p = document.createElement("p");
                        p.className = "history-item";
                        p.textContent = `${item.group} - ${item.type} | Total Loan: Rs. ${parseInt(item.total_loan).toLocaleString("en-PK")}`;
                        loanContent.appendChild(p);
                    });
                } else {
                    const p = document.createElement("p");
                    p.className = "history-empty";
                    p.textContent = "No loan history";
                    loanContent.appendChild(p); 
                }
            })
            .catch(err => {
                console.error("Error fetching customer history:", err);
                querryContent.innerHTML = '<p class="history-error">Error loading data</p>';
                travelContent.innerHTML = '<p class="history-error">Error loading data</p>';
                loanContent.innerHTML = '<p class="history-error">Error loading data</p>';
            });
    };
    
    const close = () => {
        document.querySelector('.customer-history-modal').style.display = "none";
        document.querySelector('.customer-history-modal').classList.remove('show');
    }

    function applyFilters() {
        let filtered = [...allData];

        const group = document.getElementById("groups").value.trim().toLowerCase();
        const search = document.getElementById("search").value.trim().toLowerCase();

        // Filter by group if not "all"
        if (group && group !== "all") {
            filtered = filtered.filter(row => 
                row.group?.toLowerCase() === group
            );
        }

        // Filter by name (search box)
        if (search) {
            filtered = filtered.filter(row => 
                row.name?.toLowerCase().includes(search)
            );
        }

        // Finally render filtered data
        renderData(filtered);
    }


    if(props.status === "leads") {
        document.querySelectorAll(".querryHider").forEach(el => {
            el.style.display = "none";
        });
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
            const newDate = new Date();

            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const day = String(newDate.getDate()).padStart(2, '0');
            const month = months[newDate.getMonth()];
            const year = newDate.getFullYear();

            const hours = String(newDate.getHours()).padStart(2, '0');
            const minutes = String(newDate.getMinutes()).padStart(2, '0');
            const seconds = String(newDate.getSeconds()).padStart(2, '0');

            const formatted = `${day}_${month}_${year}_(${hours}:${minutes}:${seconds})`;

            link.download = `GDTT_Bookings_Export_${formatted}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            exportAlertEmail(link.download);
        }

    return(
        <>
        <div className='topBar'> 
            <h2>{props.pageName} MANAGEMENT</h2>

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
                        <th></th>
                        <th>Booking Status</th>
                        <th>Customer ID</th>
                        <th>Booking ID</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Type</th>
                        <th>Group</th>
                        <th>Booking Date</th>
                        <th>Adults</th>
                        <th>Package Price</th>
                        <th>Infants</th>
                        <th >Infant Price</th>
                        <th>Total Price</th>
                        <th className='querryHider'>Bank</th>
                        <th className='querryHider'>Cash</th>
                        <th className='querryHider'>Received</th>
                        <th className='querryHider'>Pending</th>
                        <th className='querryHider'>Total Loan</th>
                        <th>Refrence</th>
                        <th>Source</th>
                        <th>Description</th>
                        <th className='querryHider'>Payment Status</th>
                        <th></th>
                        <th className="querryHider"></th>
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
                        <td>Loading..</td>
                        <td>Loading..</td>
                        
                    </tr>
                </tbody>
            </table>
        </div>

        <section className='blockedUser customer-history-modal'>
            <div className='content'>
                <h2>Customer History</h2>

                <div className='history-grid'> 
                    <div className='history-card' id='querrySide'>
                        <div className='history-card-header'>
                            <span className='history-icon'>📋</span>
                            <b>Query History</b>
                        </div>
                        <div className='history-card-content'></div>
                    </div>

                    <div className='history-card' id='travelSide'>
                        <div className='history-card-header'>
                            <span className='history-icon'>✈️</span>
                            <b>Travel History</b>
                        </div>
                        <div className='history-card-content'></div>
                    </div>

                    <div className='history-card' id='loanSide'>
                        <div className='history-card-header'>
                            <span className='history-icon'>💰</span>
                            <b>Loan History</b>
                        </div>
                        <div className='history-card-content'></div>
                    </div>
                </div>

                <button className='history-close-btn' onClick={e => close(e)}>Close</button>
            </div>
        </section>
        </>
    )
}

export default dataTable