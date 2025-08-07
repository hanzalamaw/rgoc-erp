import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GDTT_Home from './pages/gdtt-home';
import Login from './pages/login';
import GDTT_newBooking from './pages/gdtt-newBooking.jsx';
import GDTT_bookingManage from './pages/gdtt-bookingManage.jsx';
import GDTT_querryManage from './pages/gdtt-querryManage.jsx';
import GDTT_transactions from './pages/gdtt-transactions.jsx';
import Test from './pages/roomTest.jsx';
import GdtDataTable from './components/gdtt-dataTable.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/gdtt-home" element={<GDTT_Home />} />
        <Route path="/gdtt-newBooking" element={<GDTT_newBooking />} />
        <Route path="/gdtt-bookingManage" element={<GDTT_bookingManage />} />
        <Route path="/gdtt-querryManage" element={<GDTT_querryManage />} />
        <Route path="/gdtt-transactions" element={<GDTT_transactions />} />
        <Route path="/roomTest" element={<Test />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
