import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Pagination, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './Orders.css';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchName, setSearchName] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const friendNameParam = queryParams.get('friend');
    console.log(friendNameParam, "friendNameParam")

    const fetchOrders = async (page = 1) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/orders`, {
                params: { page: page, per_page: 5, search_name: searchName || friendNameParam },
                withCredentials: true,
            });
            console.log('API Response:', response.data); // Debug log to check API response
            console.log('Orders:', response.data.orders);
            setOrders(response.data.orders || []); // Ensure orders is set to an empty array if not provided
            setCurrentPage(response.data.current_page || 1); // Ensure your API response provides these
            setTotalPages(response.data.total_pages || 1);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage, searchName, friendNameParam]);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);

        }
    };

    const handleSearchChange = (event) => {
        setSearchName(event.target.value.toLowerCase());
        setCurrentPage(1); // Reset to first page on new search
    };

    const filteredOrders = orders.filter((order) => {
        const friendName = (order.friend_name || '').toLowerCase(); // Ensure default empty string
        const orderName = (order.order_name || '').toLowerCase();
        const orderAmount = (order.amount || '').toString(); // Convert to string for comparison

        return (
            friendName.includes(searchName) ||
            orderName.includes(searchName) ||
            orderAmount.includes(searchName)
        );
    });

    const handleCreateOrder = () => {
        navigate('/orders/new');
    };

    const fetchAllOrders = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/v1/orders', {
                params: { per_page: 1000, search_name: searchName || friendNameParam }, // Adjust per_page as needed
                withCredentials: true,
            });
            return response.data.orders || [];
        } catch (error) {
            console.error('Error fetching all orders:', error);
            return [];
        }
    };

    const generatePDF = async () => {
        const allOrders = await fetchAllOrders();
        const doc = new jsPDF();
        autoTable(doc, {
            head: [['Friend Name', 'Order Name', 'Order Date', 'Amount']],
            body: allOrders.map(order => [
                order.friend_name,
                order.order_name,
                new Date(order.order_date).toLocaleDateString(),
                order.amount
            ])
        });
        doc.save('orders.pdf');
    };

    // Generate Excel
    const generateExcel = async () => {
        const allOrders = await fetchAllOrders();
        const worksheet = XLSX.utils.json_to_sheet(allOrders.map(order => ({
            'Friend Name': order.friend_name,
            'Order Name': order.order_name,
            'Order Date': new Date(order.order_date).toLocaleDateString(),
            'Amount': order.amount
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
        XLSX.writeFile(workbook, 'orders.xlsx');
    };

    console.log(orders, "orders")
    return (
        <div className="orders-container">
            <h1>Orders List</h1>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <button className="action-btn" onClick={handleCreateOrder}>
                    Add New Order
                </button>
            </div>
            <div style={{ display: 'flex',marginLeft:'1000px', marginBottom: '15px' }}>
                <Button onClick={generatePDF} variant="primary" style={{marginRight:'10px'}}>Download PDF</Button>
                <Button onClick={generateExcel} variant="success">Download Excel</Button>
            </div>
            <Form>
                <Form.Group controlId="search">
                    <Form.Label>Search by Friend Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter friend name"
                        value={searchName}
                        onChange={handleSearchChange}
                        style={{ width: 'fit-content', marginBottom: '10px' }}
                    />
                </Form.Group>
            </Form>
            {orders.length > 0 ? (
                <>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Friend Name</th>
                                <th>Order Name</th>
                                <th>Order Date</th>
                                <th>Amount</th>

                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.friend_name}</td>
                                    <td>{order.order_name}</td>
                                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                    <td>{order.amount}</td>

                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
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
                </>

            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
}

export default Orders;
