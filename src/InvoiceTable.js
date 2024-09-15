import React, { useState, useEffect } from 'react';
import { Table, Pagination, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './InvoiceTable.css';

function InvoiceTable() {
    const [invoices, setInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editInvoiceId, setEditInvoiceId] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [paidDate, setPaidDate] = useState('');
    const [searchAmount, setSearchAmount] = useState('');
    const [searchStatus, setSearchStatus] = useState('');




    // Fetch invoices from backend
    useEffect(() => {
        const fetchInvoices = async (page = 1) => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/invoices', {
                    params: { page: page, per_page: 5,
                        amount: searchAmount,
                        payment_status: searchStatus }
                });
                console.log(response.data, "response.data")
                console.log(response.data.invoices, "response.data.invoices")
                setInvoices(Array.isArray(response.data.invoices) ? response.data.invoices : []);
                setCurrentPage(response.data.current_page || 1);
                setTotalPages(response.data.total_pages || 1);
            } catch (error) {
                console.error('Error fetching invoices:', error);
            }
        };
        fetchInvoices(currentPage);
    }, [currentPage, searchAmount, searchStatus]);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleEditClick = (invoice) => {
        setEditInvoiceId(invoice.id);
        setNewStatus(invoice.payment_status ? 'Paid' : 'Unpaid');
    };

    const handleStatusChange = (e) => {
        setNewStatus(e.target.value);
    };

    const handleSave = async (invoiceId) => {
        try {
            await axios.put(`http://localhost:3000/api/v1/invoices/${invoiceId}`, {
                payment_status: newStatus === 'Paid',
                paid_date: newStatus === 'Paid' ? new Date().toISOString() : ''
            });
            setEditInvoiceId(null);
            // Refetch invoices to get updated data
            const response = await axios.get('http://localhost:3000/api/v1/invoices', {
                params: { page: currentPage, per_page: 5 }
            });
            setInvoices(response.data.invoices || []);
        } catch (error) {
            console.error('Error saving invoice:', error);
        }
    };

    const fetchAllInvoices = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/v1/invoices', {
                params: { amount: searchAmount, payment_status: searchStatus, per_page: 1000 } // Adjust `per_page` as needed
            });
            return response.data.invoices || [];
        } catch (error) {
            console.error('Error fetching all invoices:', error);
            return [];
        }
    };

    const generatePDF = async () => {
        const allInvoices = await fetchAllInvoices();
        const doc = new jsPDF();
        autoTable(doc, {
            head: [['Order ID', 'Total Amount', 'Payment Status', 'Created At', 'Paid Date']],
            body: allInvoices.map(invoice => [
                invoice.order_id,
                invoice.total_amount,
                invoice.payment_status ? 'Paid' : 'Not Paid',
                new Date(invoice.created_at).toLocaleDateString(),
                invoice.paid_date ? new Date(invoice.paid_date).toLocaleDateString() : 'N/A'
            ])
        });
        doc.save('invoices.pdf');
    };


    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page on search
        const fetchInvoices = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/invoices', {
                    params: { page: 1, per_page: 5, amount: amountFilter, payment_status: statusFilter }
                });
                setInvoices(Array.isArray(response.data.invoices) ? response.data.invoices : []);
                setCurrentPage(response.data.current_page || 1);
                setTotalPages(response.data.total_pages || 1);
            } catch (error) {
                console.error('Error fetching invoices:', error);
            }
        };
        fetchInvoices();
    };

    const generateExcel = async () => {
        const allInvoices = await fetchAllInvoices();
        const worksheet = XLSX.utils.json_to_sheet(allInvoices.map(invoice => ({
            'Order ID': invoice.order_id,
            'Total Amount': invoice.total_amount,
            'Payment Status': invoice.payment_status ? 'Paid' : 'Not Paid',
            'Created At': new Date(invoice.created_at).toLocaleDateString(),
            'Paid Date': invoice.paid_date ? new Date(invoice.paid_date).toLocaleDateString() : 'N/A'
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
        XLSX.writeFile(workbook, 'invoices.xlsx');
    };

    return (
        <div className="invoice-table-container">
            <h2>Invoice List</h2>
            <div className="export-buttons">
                <Button onClick={generatePDF} variant="primary" style={{marginRight:'10px'}}>Download PDF</Button>
                <Button onClick={generateExcel} variant="success" className="ml-2">Download Excel</Button>
            </div>
            <Form className='search-container'>
                <Form.Group controlId="formSearchAmount" style={{marginRight: '10px'}}>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control 
                        
                        type="text" 
                        placeholder="Enter amount" 
                        value={searchAmount}
                        onChange={(e) => setSearchAmount(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formSearchStatus" style={{marginRight: '10px'}}>
                    <Form.Label>Payment Status</Form.Label>
                    <Form.Control 
                        style={{width: '160px'}}
                        as="select"
                        value={searchStatus}
                        onChange={(e) => setSearchStatus(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="true">Paid</option>
                        <option value="false">Unpaid</option>
                    </Form.Control>
                </Form.Group>
                <Button style={{width:'150px', height:'40px',marginTop:'30px'}}variant="primary" onClick={handleSearch}>Search</Button>
            </Form>
            <table className="invoice-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Total Amount</th>
                        <th>Payment Status</th>
                        <th>Created At</th>
                        <th>Paid Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(invoices) && invoices.length > 0 ? (
                        invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td>{invoice.order_id}</td>
                                <td>{invoice.total_amount}</td>
                                <td>
                                    {editInvoiceId === invoice.id ? (
                                        <Form.Control as="select" value={newStatus} onChange={handleStatusChange}>
                                            <option value="Paid">Paid</option>
                                            <option value="Unpaid">Unpaid</option>
                                        </Form.Control>
                                    ) : (
                                        invoice.payment_status ? 'Paid' : 'Not Paid'
                                    )}
                                </td>
                                <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                                <td>
                                    {
                                        invoice.payment_status ? (
                                            new Date(invoice.paid_date).toLocaleDateString()
                                        ) : (
                                            'N/A'
                                        )
                                    }
                                </td>
                                <td>
                                {invoice.payment_status ? (
                                        // No Edit button if status is Paid
                                        <span>No action</span>
                                    ) : (
                                        // Show Edit button if status is Unpaid
                                        editInvoiceId === invoice.id ? (
                                            <Button onClick={() => handleSave(invoice.id)}>Save</Button>
                                        ) : (
                                            <Button onClick={() => handleEditClick(invoice)}>Edit</Button>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No invoices available</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <Pagination style={{marginTop : '10px'}}>
                <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                />
                {[...Array(totalPages).keys()].map(pageNumber => (
                    <Pagination.Item
                        key={pageNumber + 1}
                        active={pageNumber + 1 === currentPage}
                        onClick={() => handlePageChange(pageNumber + 1)}
                    >
                        {pageNumber + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
            
        </div>
    );
}

export default InvoiceTable;
