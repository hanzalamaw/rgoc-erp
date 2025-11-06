import './teamPerformance.css'
import Splitter from './splitter.jsx'
import { useEffect, useState } from 'react'

function teamPerformance(props){

    const [confirmedBookings, setConfirmedBookings] = useState([]);
    const [allLeads, setLeads] = useState([]);
    const apiURL = import.meta.env.VITE_API_URL;


    function setTeamStats(name, leads, bookings, rate, persons, revenue){
        let leadsId = `${name}Leads`;
        let bookingsId = `${name}Bookings`;
        let rateId = `${name}Rate`;
        let personsId = `${name}Persons`;
        let revenueId = `${name}Revenue`;

        document.getElementById(leadsId).textContent = leads;
        document.getElementById(bookingsId).textContent = bookings;
        document.getElementById(rateId).textContent = `${rate}%`;
        document.getElementById(personsId).textContent = `${persons}`;
        document.getElementById(revenueId).textContent = `Rs. ${parseInt(revenue).toLocaleString("en-PK")}`;
    }

    useEffect(() => {
        async function getTeamPerformanceData() {
            const [bookedRes, leadsRes, cancelledRes] = await Promise.all([
                fetch(`${apiURL}/bookings/confirmed`),
                fetch(`${apiURL}/bookings/leads`),
                fetch(`${apiURL}/bookings/cancelled`)
            ]);

            let bookedData = await bookedRes.json();
            let leadsData = await leadsRes.json();
            let cancelledData = await cancelledRes.json();

            // 🔄 Filter by campaign if needed
            if (props.filter != "all") {
                bookedData = bookedData.filter(row => row.group === props.currentCampaign);
                leadsData = leadsData.filter(row => row.group === props.currentCampaign);
                cancelledData = cancelledData.filter(row => row.group === props.currentCampaign);
            }

            const members = ["Ashhal", "Omer", "Huzaifa", "Hanzala", "Abuzar", "Abdullah", "Arsalan", "Other"];

            const getReferenceName = (ref) => {
            return members.includes(ref) && ref !== "Other" ? ref : "Other";
            };

            members.forEach(member => {
                const memberLeads = leadsData.filter(lead => getReferenceName(lead.refrence) === member);
                const memberCancelled = cancelledData.filter(lead => getReferenceName(lead.refrence) === member);
                const memberBookings = bookedData.filter(booking => getReferenceName(booking.refrence) === member);

                const totalLeads = memberLeads.length + memberBookings.length + memberCancelled.length;
                const bookingCount = memberBookings.length;

                const revenue = memberBookings.reduce((sum, booking) => {
                    return sum + parseInt(booking.total_price);
                }, 0);

                const persons = memberBookings.reduce((sum, booking) => {
                    return sum + (parseInt(booking.persons) || 0) + (parseInt(booking.infants) || 0);
                }, 0);

                const rate = totalLeads > 0 ? Math.round((bookingCount * 100) / totalLeads) : 0;

                setTeamStats(member, totalLeads, bookingCount, rate, persons, revenue);
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
                        <th>Converted</th>
                        <th>Conversion Rate</th>
                        <th>No. Of People</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Ashhal</td>
                        <td id='AshhalLeads'>Loading...</td>
                        <td id='AshhalBookings'>Loading...</td>
                        <td id='AshhalRate'>Loading...</td>
                        <td id='AshhalPersons'>Loading...</td>
                        <td id='AshhalRevenue'>Loading...</td>
                    </tr>
                    <tr>
                        <td>Omer</td>
                        <td id='OmerLeads'>Loading...</td>
                        <td id='OmerBookings'>Loading...</td>
                        <td id='OmerRate'>Loading...</td>
                        <td id='OmerPersons'>Loading...</td>
                        <td id='OmerRevenue'>Loading...</td>
                    </tr>
                    <tr>
                        <td>Huzaifa</td>
                        <td id='HuzaifaLeads'>Loading...</td>
                        <td id='HuzaifaBookings'>Loading...</td>
                        <td id='HuzaifaRate'>Loading...</td>
                        <td id='HuzaifaPersons'>Loading...</td>
                        <td id='HuzaifaRevenue'>Loading...</td>
                    </tr>
                    <tr>
                        <td>Abdullah</td>
                        <td id='AbdullahLeads'>Loading...</td>
                        <td id='AbdullahBookings'>Loading...</td>
                        <td id='AbdullahRate'>Loading...</td>
                        <td id='AbdullahPersons'>Loading...</td>
                        <td id='AbdullahRevenue'>Loading...</td>
                    </tr>
                    <tr>
                        <td>Abuzar</td>
                        <td id='AbuzarLeads'>Loading...</td>
                        <td id='AbuzarBookings'>Loading...</td>
                        <td id='AbuzarRate'>Loading...</td>
                        <td id='AbuzarPersons'>Loading...</td>
                        <td id='AbuzarRevenue'>Loading...</td>
                    </tr>
                    <tr>
                        <td>Hanzala</td>
                        <td id='HanzalaLeads'>Loading...</td>
                        <td id='HanzalaBookings'>Loading...</td>
                        <td id='HanzalaRate'>Loading...</td>
                        <td id='HanzalaPersons'>Loading...</td>
                        <td id='HanzalaRevenue'>Loading...</td>
                    </tr>
                    <tr>
                        <td>Arsalan</td>
                        <td id='ArsalanLeads'>Loading...</td>
                        <td id='ArsalanBookings'>Loading...</td>
                        <td id='ArsalanRate'>Loading...</td>
                        <td id='ArsalanPersons'>Loading...</td>
                        <td id='ArsalanRevenue'>Loading...</td>
                    </tr>
                    <tr>
                        <td>Other</td>
                        <td id='OtherLeads'>Loading...</td>
                        <td id='OtherBookings'>Loading...</td>
                        <td id='OtherRate'>Loading...</td>
                        <td id='OtherPersons'>Loading...</td>
                        <td id='OtherRevenue'>Loading...</td>
                    </tr>
                </tbody>
            </table>
        </div>
        </>
    )
}

export default teamPerformance