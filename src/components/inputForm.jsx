import './inputForm.css'
import { useEffect, useState } from 'react'

function inputForm(){

    const [form, setForm] = useState({
        customer_id: "",
        booking_id: "",
        booking_date: "",
        name: "",
        contact: "",
        type: "",
        group: "",
        persons: "",
        package_price: "",
        infants: "",
        infant_price: "",
        total_price: "",
        bank: "",
        cash: "",
        received: "",
        pending: "",
        requirement: "",
        refrence: "",
        source: "",
        status: "",
    });

    const handlePriceChange = () => {
        const persons = Number(document.getElementById("persons").value);
        const package_price = Number(document.getElementById("package_price").value);
        const infants = Number(document.getElementById("infants").value);
        const infant_price = Number(document.getElementById("infant_price").value);
        
        const bank = Number(document.getElementById("bank").value);
        const cash = Number(document.getElementById("cash").value);
        const pending = Number(document.getElementById("pending").value);

        const total_price = (package_price * persons) + (infant_price * infants);
        const received = bank + cash;

        document.getElementById("total_price").value = total_price;
        document.getElementById("received").value = received;
        document.getElementById("pending").value = total_price - received;

        setForm(prev => ({
            ...prev,
            total_price,
            received,
            pending
        }));
    };


    async function generateIDs() {
        const res = await fetch("/api/bookings/all");
        const data = await res.json();

         const contact = document.getElementById("contact").value.trim();
        const typeInput = document.getElementById("type").value.trim();
        const groupInput = document.getElementById("group").value.trim();

        const typeLetter = typeInput.charAt(0).toUpperCase() || "X";
        const groupCode = groupInput.substring(0, 3).toUpperCase() || "XXX";

        // === CUSTOMER ID ===
        let customer_id = "";
        const existingBooking = data.find(b => b.contact === contact);

        if (existingBooking) {
            customer_id = existingBooking.customer_id;
        } else {
            let num = 1;
            while (true) {
            const candidate = `#GDTT-${num.toString().padStart(4, "0")}`;
            const exists = data.some(b => b.customer_id === candidate);
            if (!exists) {
                customer_id = candidate;
                break;
            }
            num++;
            }
        }

        // === BOOKING ID ===
        let booking_id = "";
        let bookingNum = 1;
        while (true) {
            const candidate = `#${typeLetter}-${bookingNum.toString().padStart(4, "0")}-${groupCode}`;
            const exists = data.some(b => b.booking_id === candidate);
            if (!exists) {
            booking_id = candidate;
            break;
            }
            bookingNum++;
        }

        document.getElementById("customer_id").value = customer_id;
        document.getElementById("booking_id").value = booking_id;

        // ✅ Update form state
        setForm(prev => ({
            ...prev,
            customer_id,
            booking_id
        }));
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        let newValue = (type === "number" && value < 0) ? 0 : value;

        setForm((prevForm) => ({
            ...prevForm,
            [name]: newValue
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        console.log("Form data before sending:", form);
        const res = await fetch("http://localhost:5000/api/bookings/addGDTTBookings", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Booking added successfully ✅");
            if(!(document.getElementById("keepInfo").checked)){
                e.target.reset();
            }
            else {
                document.getElementById("type").value = "";
                document.getElementById("booking_id").value = "";
            }
        } else {
            alert("❌ " + data.error);
        }
        } catch (err) {
        console.error(err);
        alert("Server error");
        }
    };

    useEffect(() => {
        const infant = 0;
        const infant_price = 0;
        const type = `Umrah`;
        const group = `JULY 2025`;

        document.getElementById("infants").value = 0;
        document.getElementById("infant_price").value = 0;
        document.getElementById("type").value = `Umrah`;
        document.getElementById("group").value = `JULY 2025`;
        
        let date = new Date();
        let booking_date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        document.getElementById("booking_date").value = booking_date;

        setForm(prev => ({
            ...prev,
            infant,
            infant_price,
            type,
            group,
            booking_date
        }));
    }, []);


    return(
        <>
        <form onSubmit={handleSubmit} id='orderForm'>
            <div id='inputSection'>
                <label htmlFor="customer_id">Customer ID</label>
                <input id="customer_id" type="text" name="customer_id" placeholder="Enter Phone Number to Generate" onChange={handleChange} required autoComplete="off"/>
            </div>

            <div id='inputSection'>
                <label htmlFor="booking_id">Booking ID</label>
                <input id="booking_id" type="text" name="booking_id" placeholder="Enter Phone Number to Generate" onChange={handleChange} required autoComplete="off"/>
            </div>

            <div id='inputSection'>
                <label htmlFor="booking_date">Booking Date</label>
                <input id="booking_date" type="text" name="booking_date" onChange={handleChange} placeholder='YYYY-MM-DD' required autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="name">Name</label>
                <input id="name" type="text" name="name" placeholder="Customer Name" onChange={handleChange} required autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="contact">Contact</label>
                <input id="contact" type="text" name="contact" placeholder="Contact Number" onChange={(e) => {handleChange(e); generateIDs();}} required autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="type">Trip Type</label>
                <input id="type" type="text" name="type" placeholder="Booking Type" onChange={(e) => {handleChange(e); generateIDs();}} autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="group">Group</label>
                <input id="group" type="text" name="group" placeholder="Group Name" onChange={(e) => {handleChange(e); generateIDs();}} autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="persons">No. of Persons</label>
                <input id="persons" type="number" name="persons" placeholder="Number of Persons" onChange={(e) => {handleChange(e); handlePriceChange();}} autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="package_price">Package Price</label>
                <input id="package_price" type="number" name="package_price" placeholder="Package Price Per Person" onChange={(e) => {handleChange(e); handlePriceChange();}} autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="infants">No. of Infants</label>
                <input id="infants" type="number" name="infants" placeholder="Number of Infants" onChange={(e) => {handleChange(e); handlePriceChange();}} autoComplete="off"/>
            </div>

            <div id='inputSection'>
                <label htmlFor="infant_price">Infant Price</label>
                <input id="infant_price" type="number" name="infant_price" placeholder="Package Price Per Infant" onChange={(e) => {handleChange(e); handlePriceChange();}} autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="total_price">Total Price</label>
                <input id="total_price" type="number" name="total_price" placeholder="Total Price" onChange={(e) => {handleChange(e); handlePriceChange();}} autoComplete="off" readOnly/>
            </div>

            <div id='inputSection'>
                <label htmlFor="bank">Bank</label>
                <input id="bank" type="number" name="bank" placeholder="Amount Received in Bank" onChange={(e) => {handleChange(e); handlePriceChange();}} autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="cash">Cash</label>
                <input id="cash" type="number" name="cash" placeholder="Amount Received in Cash" onChange={(e) => {handleChange(e); handlePriceChange();}} autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="received">Received</label>
                <input id="received" type="number" name="received" placeholder="Total Amount Received" onChange={(e) => {handleChange(e); handlePriceChange();}} autoComplete="off" readOnly/>
            </div>

            <div id='inputSection'>
                <label htmlFor="pending">Pending</label>
                <input id="pending" type="number" name="pending" placeholder="Pending Amount" onChange={(e) => {handleChange(e); handlePriceChange();}} autoComplete="off" readOnly/>
            </div>

            <div id='inputSection'>
                <label htmlFor="requirement">Requirement</label>
                <input id="requirement" type="text" name="requirement" placeholder="Customer Requirement" onChange={handleChange} autoComplete="off" />
            </div>

            <div id='inputSection'>
                <label htmlFor="refrence">Reference</label>
                <select id="refrence" type="text" name="refrence" placeholder="Reference Name" onChange={handleChange} autoComplete="off">
                    <option value="">Select</option>
                    <option value="Ashhal">Ashhal</option>
                    <option value="Omer">Omer</option>
                    <option value="Fayez">Fayez</option>
                </select>
            </div>

            <div id='inputSection'>
                <label htmlFor="source">Source</label>
                <select id="source" type="text" name="source" placeholder="Source" onChange={handleChange} autoComplete="off">
                    <option value="">Select</option>
                    <option value="Whatsapp (Socail Media Ads)">Whatsapp (Socail Media Ads)</option>
                    <option value="Whatsapp (New PR)">Whatsapp (New PR)</option>
                    <option value="Whatsapp (Old PR)">Whatsapp (Old PR)</option>
                    <option value="Social Media Engagement">Social Media Engagement</option>
                    <option value="Calling (Previus Customer)">Calling (Previus Customer)</option>
                    <option value="Calling (New Data)">Calling (New Data)</option>
                    <option value="Ambassador Program">Ambassador Program</option>
                    <option value="Website">Website</option>
                </select>
            </div>

            <div id='inputSection'>
                <label htmlFor="status">Booking Status</label>
                <select id="status" type="text" name="status" placeholder="Booking Status" onChange={handleChange} autoComplete="off">
                    <option value="">Select</option>
                    <option value="no">Querry</option>
                    <option value="confirmed">Confirmed</option>
                </select>    
            </div>

            <div className="checkbox-section">
                <input type="checkbox" id="keepInfo" />
                <label htmlFor="keepInfo">Don't Clear Information After Submitting</label>
            </div>

            <div id='submit'>
                <button type="submit">Add Booking</button>
            </div>
        </form>
        </>
    )
}

export default inputForm