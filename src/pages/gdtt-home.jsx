import { useEffect, useState } from 'react'
import { getToken, getUser } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import './gdtt-home.css'
import NavigationBar from '../components/navigation_bar.jsx'
import GeneralStats from '../components/generalStats.jsx'
import LeadsStats from '../components/leadsStats.jsx'
import TeamPerformance from '../components/teamPerformance.jsx'
import Footer from '../components/footer.jsx'

function home(){

    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState("all");
    const [hide, setHide] = useState("yes");
    const navigate = useNavigate();
    const apiURL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = getToken();

        if (!token) {
            navigate('/');
            return;
        }

        async function fetchData() {
            const resConfirmed = await fetch(`${apiURL}/bookings/confirmed`);
            const confirmedData = await resConfirmed.json();

            const resLeads = await fetch(`${apiURL}/bookings/leads`);
            const leadsData = await resLeads.json();

            const allBookings = [...confirmedData, ...leadsData]; // merge into one array

            const groupFilter = document.getElementById("byGroup");
            const groups = [...new Set(allBookings.map(row => row.group))]; // fixed from allData to allBookings

            groups.forEach(group => {
                if (![...groupFilter.options].some(opt => opt.value === group)) {
                    const option = document.createElement("option");
                    option.value = group;
                    option.textContent = group;
                    groupFilter.appendChild(option);
                }
            });
        }

        fetchData();
    }, []);

    function setCampaign(){
        const groupFilterValue = document.getElementById("byGroup").value;

        setSelected(groupFilterValue);
    }

    return(
        <>
        <div className='wholePage'>
            <div>
                <NavigationBar companyName="GREENDOME TRAVEL & TOURS" active="dashboard"/>
            </div>
            <div className='statsSide'>
                <div className='filter-wrapper'>
                    <div className='filterStats'>

                        <h1>DASHBOARD</h1>
                    
                        <div className='filters'>
                            <select name="byGroup" id="byGroup" onChange={setCampaign}>
                                <option value="all">All Time</option>
                            </select>
                            <button id='hiderr' onClick={() => {
                                (hide == "yes")? setHide("no") : setHide("yes"); 
                                document.getElementById("hiderr").textContent = (hide == "yes")? "Hide Stats" : "Show Stats";
                            }}> Show Stats </button>
                        </div>
                    
                    </div>
                </div>
                

                <div className='generalStats'>
                    <GeneralStats filter={selected} currentCampaign={selected} hidden={hide}/>
                </div>

                <div className='generalStats'>
                    <LeadsStats filter={selected} currentCampaign={selected} hidden={hide} />
                </div>

                <div className='generalStats'>
                    <TeamPerformance filter={selected} currentCampaign={selected} hidden={hide} />
                </div>

                <div className='generalStats'>
                    <Footer name="GreeenDome Travel & Tours"/>
                </div>
            </div>
        </div>       
        </>
    )
}

export default home