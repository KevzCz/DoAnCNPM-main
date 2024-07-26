// src/pages/Invoices.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Table } from 'reactstrap';
import AuthContext from '../context/AuthContext';
import '../styles/invoices.css';

const Invoices = () => {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);

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

  return (
    <Container>
      <Row>
        <Col lg="12" className="mb-5">
          <h2 className="invoice__title">Invoices</h2>
          <Table striped>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Booking ID</th>
                <th>Payment ID</th>
                <th>Issue Date</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.invoice_id}>
                  <td>{invoice.invoice_id}</td>
                  <td>{invoice.booking_id}</td>
                  <td>{invoice.payment_id}</td>
                  <td>{formatDate(invoice.issue_date)}</td>
                  <td>${invoice.total_amount}</td>
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
