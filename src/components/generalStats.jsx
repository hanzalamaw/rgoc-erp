import './generalStats.css'
import BlueUp from '../assets/blueUp.png'
import BlueDown from '../assets/blueDown.png'
import BlueLine from '../assets/blueLine.png'
import GreenUp from '../assets/greenUp.png'
import GreenDown from '../assets/greenDown.png'
import GreenLine from '../assets/greenLine.png'
import RedUp from '../assets/redUp.png'
import RedDown from '../assets/redDown.png'
import RedLine from '../assets/redLine.png'
import Splitter from '../components/splitter.jsx'
import { useEffect, useState } from 'react'

function generalStats(props){

    const [confirmedBookings, setConfirmedBookings] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('http://localhost:5000/api/bookings/confirmed');
            let data = await res.json();

            setConfirmedBookings(data); // Optional if you still want to store raw data

            // 🧮 Initialize counters
            let totalBookings = 0;
            let totalSales = 0;
            let paymentsReceived = 0;
            let amountReceived = 0;
            let paymentsPending = 0;
            let amountPending = 0;

            // 🔄 Filter logic based on props
            if(props.filter == "current"){
                data = data.filter(row => row.group === props.currentCampaign);
            }

            // 💹 Calculate stats
            data.forEach(booking => {
            totalBookings++;
            totalSales += parseInt(booking.total_price || 0);
            amountReceived += parseInt(booking.received || 0);
            amountPending += parseInt(booking.pending || 0);

            if (parseInt(booking.pending) === 0) {
                paymentsReceived++;
            } else {
                paymentsPending++;
            }
            });

            // ⬇️ Update DOM
            document.getElementById("bookings").textContent = `${totalBookings}`;
            document.getElementById("received").textContent = `${paymentsReceived}`;
            document.getElementById("pending").textContent = `${paymentsPending}`;
            document.getElementById("sales").textContent = `Rs. ${totalSales}`;
            document.getElementById("receivedAmount").textContent = `Rs. ${amountReceived}`;
            document.getElementById("pendingAmount").textContent = `Rs. ${amountPending}`;
        }

        fetchData();
    }, [props.filter]); // ✅ react to filter changes



    return(
        <>
        <Splitter name="GENERAL STATS"/>
        <div className='generals'>
            <div className='gen-cards'>
                <div className='gen-card'>
                    <div className='upper-content'>
                        <div className='card-text'>
                            <p>Total Bookings</p>
                            <h3 id='bookings'>Loading...</h3>
                        </div>
                        <img src={BlueUp} />
                    </div>
                    <img src={BlueLine} />
                </div>

                <div className='gen-card'>
                    <div className='upper-content'>
                        <div className='card-text'>
                            <p>Payments Received</p>
                            <h3 id='received'>Loading...</h3>
                        </div>
                        <img src={GreenUp} />
                    </div>
                    <img src={GreenLine} />
                </div>

                <div className='gen-card'>
                    <div className='upper-content'>
                        <div className='card-text'>
                            <p>Pending Payments</p>
                            <h3 id='pending'>Loading...</h3>
                        </div>
                        <img src={RedUp} />
                    </div>
                    <img src={RedLine} />
                </div>
            </div>

            <div className='gen-cards'>
                <div className='gen-card'>
                    <div className='upper-content'>
                        <div className='card-text'>
                            <p>Total Sales</p>
                            <h3 id='sales'>Loading...</h3>
                        </div>
                        <img src={BlueDown} />
                    </div>
                    <img src={BlueLine} />
                </div>

                <div className='gen-card'>
                    <div className='upper-content'>
                        <div className='card-text'>
                            <p>Amount Received</p>
                            <h3 id='receivedAmount'>Loading...</h3>
                        </div>
                        <img src={GreenDown} />
                    </div>
                    <img src={GreenLine} />
                </div>

                <div className='gen-card'>
                    <div className='upper-content'>
                        <div className='card-text'>
                            <p>Amount Pending</p>
                            <h3 id='pendingAmount'>Loading...</h3>
                        </div>
                        <img src={RedDown} />
                    </div>
                    <img src={RedLine} />
                </div>
            </div>
        </div>
        </>
    )
}

export default generalStats