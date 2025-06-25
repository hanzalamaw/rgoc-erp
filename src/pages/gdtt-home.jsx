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
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();

        if (!token) {
            navigate('/');
            return;
        }
    })

    return(
        <>
        <div className='wholePage'>
            <div>
                <NavigationBar companyName="GREENDOME TRAVEL & TOURS" active="dashboard"/>
            </div>
            <div className='statsSide'>
                <div className='filtersSection'>
                    <p
                        id='all'
                        className={selected === "all" ? "selected" : ""}
                        onClick={() => setSelected("all")}
                        >
                        ALL TIME
                    </p>

                    <p
                        id='current'
                        className={selected === "current" ? "selected" : ""}
                        onClick={() => setSelected("current")}
                        >
                        CURRENT CAMPAIGN
                    </p>
                </div>

                <div className='generalStats'>
                    <GeneralStats filter={selected} currentCampaign="JULY 2025"/>
                </div>

                <div className='generalStats'>
                    <LeadsStats filter={selected} currentCampaign="JULY 2025"/>
                </div>

                <div className='generalStats'>
                    <TeamPerformance filter={selected} currentCampaign="JULY 2025"/>
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