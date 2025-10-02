import './quote.css'
import { useEffect, useState } from 'react'
import React, { useRef } from 'react'; 

function generateQuote(props){

    function addNewPackageSection(){
        const packageSection = document.createElement("div");
        packageSection.className = "dottedBox";
        const packageNo = Number(document.getElementById("packageNo").innerText) + 1;
        packageSection.innerHTML = `
            <p>PACKAGE NO <span id='packageNo'>${packageNo}</span></p>
                <div className='dottedInputSections'>
                    <div id='inputSection' className='input-box'>
                        <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label htmlFor="customer_id" class="input-label">Group</label>
                    </div>

                    <div id='inputSection' className='input-box'>
                        <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label htmlFor="customer_id" class="input-label">Full Name</label>
                    </div>

                    <div id='inputSection' className='input-box'>
                        <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label htmlFor="customer_id" class="input-label">Booking ID</label>
                    </div>

                    <div id='inputSection' className='input-box'>
                        <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label htmlFor="customer_id" class="input-label">Phone Number</label>
                    </div>

                    <div id='inputSection' className='input-box'>
                        <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label htmlFor="customer_id" class="input-label">No. of People</label>
                    </div>

                    <div id='inputSection' className='input-box'>
                        <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label htmlFor="customer_id" class="input-label">No. of Infants</label>
                    </div>

                    <div id='inputSection' className='input-box'>
                        <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label htmlFor="customer_id" class="input-label">Booking Date</label>
                    </div>

                    <div id='inputSection' className='input-box'>
                        <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                        <label htmlFor="customer_id" class="input-label">Trip Type</label>
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
                    <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                    <label htmlFor="customer_id" class="input-label">Group</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                    <label htmlFor="customer_id" class="input-label">Full Name</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                    <label htmlFor="customer_id" class="input-label">Booking ID</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                    <label htmlFor="customer_id" class="input-label">Phone Number</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                    <label htmlFor="customer_id" class="input-label">No. of People</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                    <label htmlFor="customer_id" class="input-label">No. of Infants</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                    <label htmlFor="customer_id" class="input-label">Booking Date</label>
                </div>

                <div id='inputSection' className='input-box'>
                    <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                    <label htmlFor="customer_id" class="input-label">Trip Type</label>
                </div>
            </div>

                <div className='dottedBox'>
                <p>PACKAGE INCLUDES</p>
                <div className='dottedCheckboxSections'>
                    <div className='checkbox-section'>
                        <input type="checkbox" id="food" />
                        <label htmlFor="food">Food</label>
                    </div>

                    <div className='checkbox-section'>
                        <input type="checkbox" id="medical" />
                        <label htmlFor="medical">Medical Insurance</label>
                    </div>

                    <div className='checkbox-section'>
                        <input type="checkbox" id="hotel" />
                        <label htmlFor="hotel">Accomodation</label>
                    </div>
                    
                    <div className='checkbox-section'>
                        <input type="checkbox" id="visa" />
                        <label htmlFor="visa">VISA</label>
                    </div>

                    <div className='checkbox-section'>
                        <input type="checkbox" id="ticket" />
                        <label htmlFor="ticket">Ticket</label>
                    </div>

                    <div className='checkbox-section'>
                        <input type="checkbox" id="zyarat" />
                        <label htmlFor="zyarat">Zyarat</label>
                    </div>

                    <div className='checkbox-section'>
                        <input type="checkbox" id="transport" />
                        <label htmlFor="transport">Inter-City Transport</label>
                    </div>
                </div>
            </div>

            <div id='packages'>
                <div className='dottedBox'>
                    <p>PACKAGE NO <span id='packageNo'>1</span></p>
                    <div className='dottedInputSections'>
                        <div id='inputSection' className='input-box'>
                            <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                            <label htmlFor="customer_id" class="input-label">Group</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                            <label htmlFor="customer_id" class="input-label">Full Name</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                            <label htmlFor="customer_id" class="input-label">Booking ID</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                            <label htmlFor="customer_id" class="input-label">Phone Number</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                            <label htmlFor="customer_id" class="input-label">No. of People</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                            <label htmlFor="customer_id" class="input-label">No. of Infants</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                            <label htmlFor="customer_id" class="input-label">Booking Date</label>
                        </div>

                        <div id='inputSection' className='input-box'>
                            <input id="customer_id" type="text" name="customer_id" placeholder=" " required autoComplete="off" class="input-field"/>
                            <label htmlFor="customer_id" class="input-label">Trip Type</label>
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
                    <button type="submit">Add Booking</button>
                </div>
            </div>
        </form>

        </>
    )
}

export default generateQuote