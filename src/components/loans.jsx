import './loans.css';

function Loans(){

    const addNewLoan = () => {
        alert("Add New Loan button clicked!");
    }

    return (
    <> 
    <div className='loanHeader'>
        <h1>LOAN MANAGEMENT</h1>
        <button className="addNewLoanBtn" onClick={addNewLoan}>Add New Loan</button>
    </div>
    </>
    )
}

export default Loans;