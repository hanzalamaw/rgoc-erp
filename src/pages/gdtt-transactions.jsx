import './gdtt-home.css'
import { useEffect, useState } from 'react'
import { getToken, getUser } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import NavigationBar from '../components/navigation_bar.jsx'
import Footer from '../components/footer.jsx'
import TransactionsTable from '../components/gdtt-transactionsTable.jsx'

function transactions(){

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
                    <NavigationBar companyName="GREENDOME TRAVEL & TOURS" active="gdtt-transactions"/>
                </div>
                <div className='statsSide'>
                    <div className='generalStats'>
                        <TransactionsTable />
                    </div>

                    <div className='generalStats'>
                        <Footer name="GreenDome Travel & Tours"/>
                    </div>
                </div>
            </div>        
        </>
    );
}

export default transactions