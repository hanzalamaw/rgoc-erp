import { useEffect, useState } from 'react'
import { getToken, getUser } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import './gdtt-home.css'
import NavigationBar from '../components/navigation_bar.jsx'
import DataTable from '../components/gdtt-dataTable.jsx'
import Footer from '../components/footer.jsx'

function bookingManage(){

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
                <NavigationBar companyName="GREENDOME TRAVEL & TOURS" active="gdtt-bookingManage"/>
            </div>
            <div className='statsSide'>
                <div className='generalStats'>
                    <DataTable status="confirmed"/>
                </div>

                <div className='generalStats'>
                    <Footer name="GreeenDome Travel & Tours"/>
                </div>
            </div>
        </div>      
        </>
    )
}

export default bookingManage