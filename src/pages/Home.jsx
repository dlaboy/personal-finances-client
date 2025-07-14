import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CreateTransactionModal from '../components/CreateTransactionModal';

const Home = () => {
  const [showModal, setShowModal] = useState(false);

  const stores = ['Amazon', 'Walmart', 'Shell', 'Netflix', 'Apple'];
  const categories = ['Shopping', 'Groceries', 'Gas', 'Entertainment', 'Tech'];

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
    <div className="container-fluid vh-100 d-flex flex-column border border-dark vw-100">
      {/* Top Navigation */}
      <div className="d-flex justify-content-between px-4 pt-3">
        <Link to="/dashboard" className="text-decoration-none text-dark fw-semibold">
          Go to Dashboard
        </Link>
        <Link to="/transactions" className="text-decoration-none text-dark fw-semibold">
          See Transactions
        </Link>
      </div>

      {/* Centered Content */}
      <div className="d-flex flex-column flex-grow-1 justify-content-center align-items-center text-center">
        <h1 className="mb-4">Welcome to PerFin!</h1>
        <button
          className="btn btn-primary btn-lg rounded-pill px-4 py-2"
          onClick={() => setShowModal(true)}
        >
          Add New Transaction
        </button>
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

export default Home;
