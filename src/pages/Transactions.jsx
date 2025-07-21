import React, { useState, useMemo, useEffect } from 'react';
import { Table, Form, Row, Col, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';
import CreateTransactionModal from '../components/CreateTransactionModal';
import axios from 'axios';
import { DateTime } from 'luxon';



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
    const timeZone = 'America/Puerto_Rico';

    const txnDate = DateTime.fromISO(txn.date, { zone: timeZone }).startOf('day');
    const start = startDate ? DateTime.fromJSDate(startDate, { zone: timeZone }).startOf('day') : null;
    const end = endDate ? DateTime.fromJSDate(endDate, { zone: timeZone }).startOf('day') : null;

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
  <div
    className="container px-3 py-4 d-flex flex-column min-vw-100 max-vw-100"
    style={{ overflowX: 'hidden' }}
  >
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
      <div className="d-flex mb-2 mb-md-0 flex-row w-100 justify-content-between">
        <Link to="/" className="d-flex align-items-center gap-1 mb-1">
          <i className="bi bi-house-door-fill fs-4"></i>
        </Link>
        <h3 className="mb-0">Transactions</h3>
        <div></div>
      </div>
      <div className="mt-3 mt-md-0">
        <Button onClick={() => setShowModal(true)} className=" w-md-auto">
          + Add Transaction
        </Button>
      </div>
    </div>

    <Row className="my-3 gy-3 gx-2 d-flex flex-column flex-md-row">
      <Col xs={12} md className="text-center">
        <Form.Label>Date Range</Form.Label>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            placeholderText="Start Date"
            className="form-control"
          />
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            placeholderText="End Date"
            className="form-control"
          />
        </div>
      </Col>
      <Col xs={12} md className="text-center">
        <Form.Label>Store</Form.Label>
        <Form.Select value={storeFilter} onChange={(e) => setstoreFilter(e.target.value)}>
          <option value="">All Stores</option>
          {stores.map(store => <option key={store} value={store}>{store}</option>)}
        </Form.Select>
      </Col>
      <Col xs={12} md className="text-center">
        <Form.Label>Category</Form.Label>
        <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </Form.Select>
      </Col>
      <Col xs={12} md className="text-center">
        <Form.Label>Amount</Form.Label>
        <Form.Select value={amountFilter} onChange={(e) => setAmountFilter(e.target.value)}>
          <option value="">All Amounts</option>
          <option value="0-50">$0 - $50</option>
          <option value="100-500">$100 - $500</option>
          <option value="500+">$500+</option>
        </Form.Select>
      </Col>
    </Row>

    <div
      className="bg-light p-2 rounded"
      style={{
        minHeight: '400px',
        overflowX: 'auto',
        maxWidth: '100%',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Table striped bordered hover responsive="sm" className="table-sm mb-0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Store</th>
            <th>Category</th>
            <th>Amount ($)</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((txn, idx) => (
              <tr key={idx}>
                <td style={{ wordBreak: 'break-word' }}>
                  {new Date(txn.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC'
                  })}
                </td>
                <td style={{ wordBreak: 'break-word' }}>{txn.store}</td>
                <td style={{ wordBreak: 'break-word' }}>{txn.category}</td>
                <td style={{ wordBreak: 'break-word' }}>{txn.amount.toFixed(2)}</td>
                <td style={{ wordBreak: 'break-word' }}>
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
            <tr>
              <td colSpan="5" className="text-center">No transactions found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>

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
