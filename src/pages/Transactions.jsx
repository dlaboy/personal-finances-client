import React, { useState, useMemo, useEffect } from 'react';
import { Table, Form, Row, Col, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';
import CreateTransactionModal from '../components/CreateTransactionModal';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [storeFilter, setstoreFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/transactions`);
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };
    fetchTransactions();
  }, []);

  const stores = useMemo(() => [...new Set(transactions.map(t => t.store))], [transactions]);
  const categories = useMemo(() => [...new Set(transactions.map(t => t.category))], [transactions]);

  const filteredTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.date);
    txnDate.setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    const dateMatch = (!start || txnDate >= start) && (!end || txnDate <= end);
    const storeMatch = !storeFilter || txn.store === storeFilter;
    const categoryMatch = !categoryFilter || txn.category === categoryFilter;
    const amountMatch =
      !amountFilter ||
      (amountFilter === '0-50' && txn.amount <= 50) ||
      (amountFilter === '100-500' && txn.amount >= 100 && txn.amount <= 500) ||
      (amountFilter === '500+' && txn.amount > 500);

    return dateMatch && storeMatch && categoryMatch && amountMatch;
  });

  const handleNewTransaction = async (txn) => {
    console.log('New transaction from Transactions:', txn);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/transactions`, txn);
      setTransactions(prev => [...prev, data]);
    } catch (err) {
      console.error('Failed to create transaction:', err);
      alert('Failed to add transaction. Please try again.');
    }
  };

  return (
    <div className="container-fluid vh-100 border border-dark p-4 d-flex flex-column vw-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/">Home</Link>
        <h3>Transactions</h3>
        <Button onClick={() => setShowModal(true)}>+ Add Transaction</Button>
      </div>

      <Row className="my-3 justify-content-around align-items-end g-2">
        <Col md="auto" className='text-center'>
          <Form.Label>Date Range</Form.Label>
          <div className="d-flex gap-2">
            <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" className="form-control" />
            <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" className="form-control" />
          </div>
        </Col>
        <Col md="auto" className='text-center'>
          <Form.Label>Store</Form.Label>
          <Form.Select value={storeFilter} onChange={(e) => setstoreFilter(e.target.value)}>
            <option value="">All Stores</option>
            {stores.map(store => <option key={store} value={store}>{store}</option>)}
          </Form.Select>
        </Col>
        <Col md="auto" className='text-center'>
          <Form.Label>Category</Form.Label>
          <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </Form.Select>
        </Col>
        <Col md="auto" className='text-center'>
          <Form.Label>Amount</Form.Label>
          <Form.Select value={amountFilter} onChange={(e) => setAmountFilter(e.target.value)}>
            <option value="">All Amounts</option>
            <option value="0-50">$0 - $50</option>
            <option value="100-500">$100 - $500</option>
            <option value="500+">$500+</option>
          </Form.Select>
        </Col>
      </Row>

      <div className="flex-grow-1 overflow-auto bg-light p-3 rounded" style={{ minHeight: '400px' }}>
        <Table striped bordered hover responsive className="mb-0">
          <thead>
            <tr className=''>
              <th>Date</th>
              <th>Store</th>
              <th>Category</th>
              <th>Amount ($)</th>
              <th>Receipt</th> {/* New column */}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn, idx) => (
                <tr key={idx}>
                  <td>{new Date(txn.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                    })}</td>
                  <td>{txn.store}</td>
                  <td>{txn.category}</td>
                  <td>{txn.amount.toFixed(2)}</td>
                  <td>
                    {txn.receipt ? (
                      <a href={txn.receipt} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center">No transactions found</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* <div className="text-center mt-3">Page 1 of 300</div> */}

      <CreateTransactionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleNewTransaction}
        stores={stores}
        categories={categories}
      />
    </div>
  );
};

export default Transactions;
