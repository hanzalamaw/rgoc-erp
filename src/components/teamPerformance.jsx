import './teamPerformance.css'
import Splitter from './splitter.jsx'
import { useEffect, useState } from 'react'

function teamPerformance(props){

    const [confirmedBookings, setConfirmedBookings] = useState([]);
    const [allLeads, setLeads] = useState([]);


    function setTeamStats(name, leads, bookings, rate, revenue){
        let leadsId = `${name}Leads`;
        let bookingsId = `${name}Bookings`;
        let rateId = `${name}Rate`;
        let revenueId = `${name}Revenue`;

        document.getElementById(leadsId).textContent = leads;
        document.getElementById(bookingsId).textContent = bookings;
        document.getElementById(rateId).textContent = `${rate}%`;
        document.getElementById(revenueId).textContent = `Rs. ${parseInt(revenue).toLocaleString("en-PK")}`;
    }

    useEffect(() => {
        async function getTeamPerformanceData() {
            const [bookedRes, leadsRes] = await Promise.all([
                fetch('http://localhost:5000/api/bookings/confirmed'),
                fetch('http://localhost:5000/api/bookings/leads')
            ]);

            let bookedData = await bookedRes.json();
            let leadsData = await leadsRes.json();

            // 🔄 Filter by campaign if needed
            if (props.filter === "current") {
                bookedData = bookedData.filter(row => row.group === props.currentCampaign);
                leadsData = leadsData.filter(row => row.group === props.currentCampaign);
            }

            const members = ["Ashhal", "Omer", "Fayez"];

            members.forEach(member => {
                const memberLeads = leadsData.filter(lead => lead.refrence === member);
                const memberBookings = bookedData.filter(booking => booking.refrence === member);

                const totalLeads = memberLeads.length + memberBookings.length;
                const bookingCount = memberBookings.length;

                const revenue = memberBookings.reduce((sum, booking) => {
                    return sum + parseInt(booking.total_price);
                }, 0);

                const rate = totalLeads > 0 ? Math.round((bookingCount * 100) / totalLeads) : 0;

                setTeamStats(member, totalLeads, bookingCount, rate, revenue);
            });
        }

        getTeamPerformanceData();
    }, [props.filter]);

    return(
        <>
        <Splitter name ="TEAM PERFORMANCE"/>
        <div className='teamPerformance'>
            <table id='performanceTable'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Leads</th>
                        <th>Leads Converted</th>
                        <th>Conversion Rate</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Ashhal</td>
                        <td id='AshhalLeads'>Loading...</td>
                        <td id='AshhalBookings'>Loading...</td>
                        <td id='AshhalRate'>Loading...</td>
                        <td id='AshhalRevenue'>Loading...</td>
                    </tr>
                    <tr>
                        <td>Omer</td>
                        <td id='OmerLeads'>Loading...</td>
                        <td id='OmerBookings'>Loading...</td>
                        <td id='OmerRate'>Loading...</td>
                        <td id='OmerRevenue'>Loading...</td>
                    </tr>
                    <tr>
                        <td>Fayez</td>
                        <td id='FayezLeads'>Loading...</td>
                        <td id='FayezBookings'>Loading...</td>
                        <td id='FayezRate'>Loading...</td>
                        <td id='FayezRevenue'>Loading...</td>
                    </tr>
                </tbody>
            </table>
        </div>
        </>
    )
}

export default teamPerformance