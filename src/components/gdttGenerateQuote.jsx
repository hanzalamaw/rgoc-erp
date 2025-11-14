import './quote.css'
import { useEffect, useState } from 'react'
import React, { useRef } from 'react'; 

function generateQuote(props){
    const apiURL = import.meta.env.VITE_API_URL;

    const generateQuotePDF = async (event) => {
        event.preventDefault();

        const form = document.querySelector('#orderForm');
        const formData = new FormData(form);

        // 1. Read single-value fields
        const group          = formData.get('group');
        const fullName       = formData.get('fullName');
        const booking_id     = formData.get('booking_id');
        const contact        = formData.get('contact');
        const no_of_adults   = formData.get('no_of_adults');
        const no_of_infants  = formData.get('no_of_infants');
        const booking_date   = formData.get('booking_date');
        const trip_type      = formData.get('trip_type');

        // ✅ 2. Read checkbox values (will be "on" if checked, null if not)
        const food         = formData.get('food');
        const medical      = formData.get('medical');
        const hotel        = formData.get('hotel');
        const visa         = formData.get('visa');
        const ticket       = formData.get('ticket');
        const zyarat       = formData.get('zyarat');
        const transport    = formData.get('transport');
        const merchandise  = formData.get('merchandise');

        // 3. Packages (same as you already have)
        const noOfDaysArr       = formData.getAll('noOfDays');
        const makkahHotelArr    = formData.getAll('makkahHotel');
        const medinahHotelArr   = formData.getAll('medinahHotel');
        const pricePerAdultArr  = formData.getAll('pricePerAdult');
        const pricePerInfantArr = formData.getAll('pricePerInfant');
        const totalPriceArr     = formData.getAll('totalPrice');

        const packages = noOfDaysArr.map((_, index) => ({
            noOfDays:       noOfDaysArr[index],
            makkahHotel:    makkahHotelArr[index],
            medinahHotel:   medinahHotelArr[index],
            pricePerAdult:  pricePerAdultArr[index],
            pricePerInfant: pricePerInfantArr[index],
            totalPrice:     totalPriceArr[index],
        }));

        // 4. Build payload (✅ include checkbox fields)
        const payload = {
            group,
            fullName,
            booking_id,
            contact,
            no_of_adults,
            no_of_infants,
            booking_date,
            trip_type,
            packages,
            food,
            medical,
            hotel,
            visa,
            ticket,
            zyarat,
            transport,
            merchandise,
        };

        try {
            const response = await fetch(`${apiURL}/generate-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'quote.pdf';
                link.click();
            } else {
                console.error('Server error:', await response.text());
                alert('Failed to generate the quote');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    let packageNo = 1;

    function addNewPackageSection(){ 
        const packageSection = document.createElement("div");
        packageSection.className = "dottedBox";
        packageNo += 1;
        packageSection.innerHTML = `
            <p>PACKAGE NO <span id='packageNo'>${packageNo}</span></p>
                <div class='dottedInputSections'>
                    <div id='inputSection' class='input-box'>
                        <input id="noOfDays" type="text" name="noOfDays" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label for="noOfDays" class="input-label">No. of Days</label>
                    </div>

                    <div id='inputSection' class='input-box'>
                        <input id="makkahHotel" type="text" name="makkahHotel" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label for="makkahHotel" class="input-label">Makkah Hotel</label>
                    </div>

                    <div id='inputSection' class='input-box'>
                        <input id="medinahHotel" type="text" name="medinahHotel" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label for="medinahHotel" class="input-label">Medinah Hotel</label>
                    </div>

                    <div id='inputSection' class='input-box'>
                        <input id="pricePerAdult" type="text" name="pricePerAdult" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label for="pricePerAdult" class="input-label">Price Per Adult</label>
                    </div>

                    <div id='inputSection' class='input-box'>
                        <input id="pricePerInfant" type="text" name="pricePerInfant" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label for="pricePerInfant" class="input-label">Price Per Infant</label>
                    </div>

                    <div id='inputSection' class='input-box'>
                        <input id="totalPrice" type="text" name="totalPrice" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label for="totalPrice" class="input-label">Total Price</label>
                    </div>
                </div>
            `;

        document.getElementById("packages").appendChild(packageSection);
    }

    return(
        <>
        <form id='orderForm'>
            <div className='inputSectionsGrid'>
                <div id='inputSection' className='input-box'>
                    <input id="group" type="text" name="group" placeholder=" " required autoComplete="off" className="input-field"/>
                    <label htmlFor="group" className="input-label">Group</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="fullName" type="text" name="fullName" placeholder=" " required autoComplete="off" className="input-field"/>
                    <label htmlFor="fullName" className="input-label">Full Name</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="booking_id" type="text" name="booking_id" placeholder=" " required autoComplete="off" className="input-field"/>
                    <label htmlFor="booking_id" className="input-label">Booking ID</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="contact" type="text" name="contact" placeholder=" " required autoComplete="off" className="input-field"/>
                    <label htmlFor="contact" className="input-label">Phone Number</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="no_of_adults" type="text" name="no_of_adults" placeholder=" " required autoComplete="off" className="input-field"/>
                    <label htmlFor="no_of_adults" className="input-label">No. of Adults</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="no_of_infants" type="text" name="no_of_infants" placeholder=" " required autoComplete="off" className="input-field"/>
                    <label htmlFor="no_of_infants" className="input-label">No. of Infants</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="booking_date" type="text" name="booking_date" placeholder=" " required autoComplete="off" className="input-field"/>
                    <label htmlFor="booking_date" className="input-label">Booking Date</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="trip_type" type="text" name="trip_type" placeholder=" " required autoComplete="off" className="input-field"/>
                    <label htmlFor="trip_type" className="input-label">Trip Type</label>
                </div>
            </div>

            <div className='dottedBox'>
                <p>PACKAGE INCLUDES</p>
                <div className='dottedCheckboxSections'>
                    <div class='checkbox-section'>
                        <input type="checkbox" id="food" name="food" />
                        <label htmlFor="food">Food</label>
                    </div>

                    <div class='checkbox-section'>
                        <input type="checkbox" id="medical" name="medical" />
                        <label htmlFor="medical">Medical Insurance</label>
                    </div>

                    <div class='checkbox-section'>
                        <input type="checkbox" id="hotel" name="hotel" />
                        <label htmlFor="hotel">Accommodation</label>
                    </div>

                    <div class='checkbox-section'>
                        <input type="checkbox" id="visa" name="visa" />
                        <label htmlFor="visa">VISA</label>
                    </div>

                    <div class='checkbox-section'>
                        <input type="checkbox" id="ticket" name="ticket" />
                        <label htmlFor="ticket">Ticket</label>
                    </div>

                    <div class='checkbox-section'>
                        <input type="checkbox" id="zyarat" name="zyarat" />
                        <label htmlFor="zyarat">Zyarat</label>
                    </div>

                    <div class='checkbox-section'>
                        <input type="checkbox" id="transport" name="transport" />
                        <label htmlFor="transport">Inter-City Transport</label>
                    </div>

                    <div class='checkbox-section '>
                        <input type="checkbox" id="merchandise" name="merchandise" />
                        <label htmlFor="merchandise">Merchandise</label>
                    </div>

                </div>
            </div>

            <div id='packages'>
                <div className='dottedBox'>
                    <p>PACKAGE NO <span id='packageNo'>1</span></p>
                    <div className='dottedInputSections'>
                        <div id='inputSection' className='input-box'>
                            <input id="noOfDays" type="text" name="noOfDays" placeholder=" " required autoComplete="off" className="input-field"/>
                            <label htmlFor="noOfDays" className="input-label">No. of Days</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="makkahHotel" type="text" name="makkahHotel" placeholder=" " required autoComplete="off" className="input-field"/>
                            <label htmlFor="makkahHotel" className="input-label">Makkah Hotel</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="medinahHotel" type="text" name="medinahHotel" placeholder=" " required autoComplete="off" className="input-field"/>
                            <label htmlFor="medinahHotel" className="input-label">Medinah Hotel</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="pricePerAdult" type="text" name="pricePerAdult" placeholder=" " required autoComplete="off" className="input-field"/>
                            <label htmlFor="pricePerAdult" className="input-label">Price Per Adult</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="pricePerInfant" type="text" name="pricePerInfant" placeholder=" " required autoComplete="off" className="input-field"/>
                            <label htmlFor="pricePerInfant" className="input-label">Price Per Infant</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="totalPrice" type="text" name="totalPrice" placeholder=" " required autoComplete="off" className="input-field"/>
                            <label htmlFor="totalPrice" className="input-label">Total Price</label>
                        </div>
                    </div>
                </div>
            </div>

            <div className='inputSectionsGrid'>
                {/* 
                <div id='inputSection'>
                    <label htmlFor="status">Booking Status</label>
                    <select id="status" type="text" name="status" placeholder="Booking Status"autoComplete="off">
                        <option value="">Select</option>
                        <option value="no">Querry</option>
                        <option value="confirmed">Confirmed</option>
                    </select>    
                </div> */}

                <div id='addPackage'>
                    <button id='submitBtn' onClick={addNewPackageSection}>Add Another Package</button>
                </div>
                
                <div id='submit'>
                    <button type="submit" onClick={generateQuotePDF}>Generate Quote</button>
                </div>
            </div>
        </form>

        </>
    )
}

export default generateQuote