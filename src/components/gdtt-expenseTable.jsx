import { useEffect, useState } from "react";
import axios from "axios";
import "./dataTable.css";

function ExpenseTable() {
  const apiURL = import.meta.env.VITE_API_URL;
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    date: "",
    from_bank: "",
    from_cash: "",
    total_amount: "",
    done_by: "",
    entered_by: "",
    description: ""
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  function fetchExpenses() {
    axios.get(`${apiURL}/expenses`)
      .then(res => setExpenses(res.data))
      .catch(err => console.log(err));
  }

  function handleAddExpense() {
    axios.post(`${apiURL}/expenses`, newExpense)
      .then(() => {
        fetchExpenses();
        setNewExpense({ date: "", from_bank: "", from_cash: "", total_amount: "", done_by: "", entered_by: "", description: "" });
      })
      .catch(err => console.log(err));
  }

    function handleDelete(id) {
        if (!confirm("Delete Expense?")) return;
        axios.delete(`${apiURL}/expenses/${id}`)
        .then(() => fetchExpenses())
        .catch(err => console.log(err));
    }

    function exportToCSV() {

        if (!expenses || expenses.length === 0) {
            alert("No data to export.");
            return;
        }       

        const headers = [
            "Date", "Bank", "Cash", "Total", "Done By", "Entered By", "Description"
        ];

        const rows = expenses.map(order => [
            new Date(order.date).toISOString().split('T')[0],
            `Rs. ${parseInt(order.from_bank).toLocaleString("en-PK")}`,
            `Rs. ${parseInt(order.from_cash).toLocaleString("en-PK")}`,
            `Rs. ${parseInt(order.total_amount).toLocaleString("en-PK")}`,
            order.done_by,
            order.entered_by,
            order.description
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'GDTT Expenses.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

  return (
    <>
      <div className="topBar">
        <h2>EXPENSES</h2>

        <button id='hiderr' onClick={exportToCSV}>Export to CSV</button>
      </div>

      {/* Add Form */}
      <div className="addNewExpense">
        <input type="date" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
        <input type="number" placeholder="Bank" value={newExpense.from_bank} onChange={e => setNewExpense({ ...newExpense, from_bank: e.target.value })}/>
        <input type="number" placeholder="Cash" value={newExpense.from_cash} onChange={e => setNewExpense({ ...newExpense, from_cash: e.target.value })}/>
        <input type="number" placeholder="Total" value={newExpense.total_amount} onChange={e => setNewExpense({ ...newExpense, total_amount: e.target.value })}/>
        <input type="text" placeholder="Done By" value={newExpense.done_by} onChange={e => setNewExpense({ ...newExpense, done_by: e.target.value })}/>
        <input type="text" placeholder="Entered By" value={newExpense.entered_by} onChange={e => setNewExpense({ ...newExpense, entered_by: e.target.value })}/>
        <input type="text" placeholder="Description" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}/>
        <button onClick={handleAddExpense}>Add New Expense</button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bank</th>
              <th>Cash</th>
              <th>Total</th>
              <th>Done By</th>
              <th>Entered By</th>
              <th>Description</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id}>
                <td>{new Date(exp.date).toISOString().split('T')[0]}</td>
                <td>Rs. {parseInt(exp.from_bank).toLocaleString("en-PK")}</td>
                <td>Rs. {parseInt(exp.from_cash).toLocaleString("en-PK")}</td>
                <td>Rs. {parseInt(exp.total_amount).toLocaleString("en-PK")}</td>
                <td>{exp.done_by}</td>
                <td>{exp.entered_by}</td>
                <td>{exp.description}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(exp.id)}>🗑️</button>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </>
  );
}

export default ExpenseTable;
