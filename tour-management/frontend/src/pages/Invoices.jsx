// src/pages/Invoices.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Table, Button, Alert } from 'reactstrap';
import AuthContext from '../context/AuthContext';
import '../styles/invoices.css';

const Invoices = () => {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [refundSuccess, setRefundSuccess] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('/invoices', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const invoiceData = await response.json();
          setInvoices(invoiceData.invoices);
        } else {
          console.error('Failed to fetch invoices:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Formats the date to MM/DD/YYYY or the locale-specific format
  };

  const handleRefund = async (invoiceId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/invoices/refund/${invoiceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setRefundSuccess(true);
        setInvoices(invoices.map(invoice => 
          invoice.invoice_id === invoiceId ? { ...invoice, total_amount: 0 } : invoice
        ));
      } else {
        setRefundSuccess(false);
        console.error('Failed to refund invoice:', response.status, response.statusText);
      }
    } catch (error) {
      setRefundSuccess(false);
      console.error('Error refunding invoice:', error);
    }
  };

  return (
    <Container className="container-invoices">
      <Row>
        <Col lg="12" className="mb-5">
          <h2 className="h1-invoices">Invoices</h2>
          {refundSuccess !== null && (
            <Alert color={refundSuccess ? 'success' : 'danger'}>
              {refundSuccess ? 'Refund successful!' : 'Refund failed!'}
            </Alert>
          )}
          <Table striped className="table-invoices">
            <thead>
              <tr>
                <th className="th-invoices">Invoice ID</th>
                <th className="th-invoices">Booking ID</th>
                <th className="th-invoices">Payment ID</th>
                <th className="th-invoices">Issue Date</th>
                <th className="th-invoices">Total Amount</th>
                <th className="th-invoices">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.invoice_id} className="tr-invoices">
                  <td className="td-invoices">{invoice.invoice_id}</td>
                  <td className="td-invoices">{invoice.booking_id}</td>
                  <td className="td-invoices">{invoice.payment_id}</td>
                  <td className="td-invoices">{formatDate(invoice.issue_date)}</td>
                  <td className="td-invoices">${invoice.total_amount}</td>
                  <td className="td-invoices">
                    <Button 
                      className="btn-danger btnHT" 
                      onClick={() => handleRefund(invoice.invoice_id)}
                    >
                      Hoàn tiền
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Invoices;
