import './gdtt-home.css'
import NavigationBar from '../components/navigation_bar.jsx'
import Footer from '../components/footer.jsx'
import ExpenseTable from '../components/gdtt-expenseTable.jsx'

function Expenses(){
    return(
        <>
            <div className='wholePage'>
                <div>
                    <NavigationBar active="gdtt-expenses"/>
                </div>
                <div className='statsSide'>
                    <div className='generalStats'>
                        <ExpenseTable />
                    </div>

                    <div className='generalStats'>
                        <Footer name="GreenDome Travel & Tours"/>
                    </div>
                </div>
            </div>      
        </>
    )
}

export default Expenses;