import './leadsStats.css'
import Splitter from '../components/splitter.jsx'
import BlueUp from '../assets/blueUp.png'
import GreenUp from '../assets/greenUp.png'
import { useEffect, useState } from 'react'

function leadsStats(props){

    const [confirmedBookings, setConfirmedBookings] = useState([]);

    useEffect(() => {
    async function fetchData() {
        const resConfirmed = await fetch('http://localhost:5000/api/bookings/confirmed');
        let confirmedData = await resConfirmed.json();

        const resLeads = await fetch('http://localhost:5000/api/bookings/leads');
        let leadsData = await resLeads.json();

        if (props.filter === "current") {
            leadsData = leadsData.filter(row => row.group === props.currentCampaign);
            confirmedData = confirmedData.filter(row => row.group === props.currentCampaign);
        }

        const totalBooked = confirmedData.filter(item => item.status === "confirmed").length;

        const leads = leadsData.length;
        const totalLeads = leads + totalBooked;
        const leadsConverted = totalBooked;
        const conversionRate = totalLeads > 0 ? ((leadsConverted * 100) / totalLeads).toFixed(2) : 0;

        setConfirmedBookings(leadsData); 

        document.getElementById("leads").textContent = `${totalLeads}`;
        document.getElementById("converted").textContent = `${leadsConverted}`;
        document.getElementById("conversion").textContent = `${conversionRate}%`;
    }

    fetchData();
}, [props.filter]);


    return(
        <>
        <Splitter name="LEADS STATS"/>
        <div className='leads'>
            <div className='lead-cards'>
                <div className='lead-card'>
                    <div className='lupper-content'>
                        <div className='card-text'>
                            <p>Total leads</p>
                            <h3 id='leads'>Loading...</h3>
                        </div>
                        <img src={BlueUp} />
                    </div>
                </div>

                <div className='lead-card'>
                    <div className='lupper-content'>
                        <div className='card-text'>
                            <p>Leads Converted</p>
                            <h3 id='converted'>Loading...</h3>
                        </div>
                        <img src={GreenUp} />
                    </div>
                </div>

                <div className='lead-card'>
                    <div className='lupper-content'>
                        <div className='card-text'>
                            <p>Conversion Rate</p>
                            <h3 id='conversion'>Loading...</h3>
                        </div>
                        <img src={GreenUp} />
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default leadsStats