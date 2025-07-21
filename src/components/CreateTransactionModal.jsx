import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Scan from '../pages/Scan';

const CreateTransactionModal = ({ show, onHide, onSubmit, stores, categories }) => {
  const [newTxn, setNewTxn] = useState({
    date: new Date(),
    store: '',
    category: '',
    amount: '',
    receipt: null
  });

  const [customstore, setCustomstore] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const handleScanResult = (data) => {
    console.log('Scan result:', data);
    setNewTxn({
      ...newTxn,
      receipt: data.receiptUrl || null
    });
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(newTxn.amount);
    const finalTxn = {
      ...newTxn,
      store: newTxn.store === 'Other' ? customstore.trim() : newTxn.store.trim(),
      category: newTxn.category === 'Other' ? customCategory.trim() : newTxn.category.trim(),
      amount: isNaN(parsedAmount) ? 0 : parsedAmount,
      receipt: newTxn.receipt || null
    };
    console.log('Raw store:', newTxn.store);
    console.log('Custom store:', customstore);
    console.log('Final store:', finalTxn.store);
    console.log('Raw category:', newTxn.category);
    console.log('Custom category:', customCategory);
    console.log('Final category:', finalTxn.category);
    console.log('Amount:', finalTxn.amount);

    // Basic validation
    if (!finalTxn.store || !finalTxn.category || finalTxn.amount <= 0) {
      alert('Please fill out Store, Category, and a valid Amount before saving.');
      return;
    }

    console.log('Saving transaction:', finalTxn);
    onSubmit(finalTxn);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Date</Form.Label>
            <DatePicker
              selected={newTxn.date}
              onChange={date => setNewTxn({ ...newTxn, date })}
              className="form-control"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Store</Form.Label>
            <Form.Select
              value={newTxn.store}
              onChange={e => setNewTxn({ ...newTxn, store: e.target.value })}
            >
              <option value="">Select Store</option>
              {stores.map(store => (
                <option key={store} value={store}>{store}</option>
              ))}
              <option value="Other">Other</option>
            </Form.Select>
            {newTxn.store === 'Other' && (
              <Form.Control
                className="mt-2"
                placeholder="Enter custom store"
                value={customstore}
                onChange={e => setCustomstore(e.target.value)}
              />
            )}
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={newTxn.category}
              onChange={e => setNewTxn({ ...newTxn, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="Other">Other</option>
            </Form.Select>
            {newTxn.category === 'Other' && (
              <Form.Control
                className="mt-2"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
              />
            )}
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Amount ($)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={newTxn.amount}
              onChange={e => setNewTxn({ ...newTxn, amount: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Scan Receipt</Form.Label>
            <Scan onResult={handleScanResult} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTransactionModal;
