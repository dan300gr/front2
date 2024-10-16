import React, { useEffect, useState } from 'react';
import { Card, Row, Col, ListGroup } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

// Registrar todos los elementos de Chart.js
Chart.register(...registerables);

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState({
    products: 0,
    inventories: 0,
    suppliers: 0,
    albums: 0,
    artists: 0,
    stock: 0,
    locations: 0,
    buildings: 0,
  });

  const [stockData, setStockData] = useState([]);
  const [productData, setProductData] = useState([]);

  // Fetch data for summary and charts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get('http://127.0.0.1:8000/productos/');
        const inventoryResponse = await axios.get('http://127.0.0.1:8000/inventarios/');
        const supplierResponse = await axios.get('http://127.0.0.1:8000/proveedores/');
        const albumResponse = await axios.get('http://127.0.0.1:8000/albums/');
        const artistResponse = await axios.get('http://127.0.0.1:8000/artistas/');
        const stockResponse = await axios.get('http://127.0.0.1:8000/stocks/');
        const locationResponse = await axios.get('http://127.0.0.1:8000/ubicaciones/');
        const buildingResponse = await axios.get('http://127.0.0.1:8000/edificios/');

        setSummaryData({
          products: productResponse.data.filter(p => p.producto_status === 'A').length,
          inventories: inventoryResponse.data.length,
          suppliers: supplierResponse.data.filter(s => s.proveedor_status === 'A').length,
          albums: albumResponse.data.filter(a => a.album_status === 'A').length,
          artists: artistResponse.data.filter(a => a.artista_status === 'A').length,
          stock: stockResponse.data.length,
          locations: locationResponse.data.filter(l => l.ubicacion_status === 'A').length,
          buildings: buildingResponse.data.filter(b => b.edificio_status === 'A').length,
        });

        // Set stock data for chart
        setStockData(stockResponse.data);
        
        // Set product data for chart
        setProductData(productResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Chart Data for Stocks
  const stockChartData = {
    labels: stockData.map(item => item.producto_id),
    datasets: [
      {
        label: 'Stock por Producto',
        data: stockData.map(item => item.stock_cantidad),
        backgroundColor: stockData.map(() => 
          `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
        ),
        borderColor: stockData.map(() => 
          `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`
        ),
        borderWidth: 1,
      },
    ],
  };

  // Chart Data for Products
  const productChartData = {
    labels: productData.map(item => item.producto_nombre),
    datasets: [
      {
        label: 'Productos Activos',
        data: productData.map(item => item.producto_status === 'A' ? 1 : 0),
        backgroundColor: productData.map(() => 
          `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
        ),
        borderColor: productData.map(() => 
          `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`
        ),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard">
      <h1>Hola, Bienvenido de Nuevo 👋</h1>
      <h3>📊 Resumen de la tienda</h3>
      <Row>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Productos Activos</Card.Title>
              <Card.Text>{summaryData.products}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Inventarios</Card.Title>
              <Card.Text>{summaryData.inventories}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Proveedores Activos</Card.Title>
              <Card.Text>{summaryData.suppliers}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Álbumes Activos</Card.Title>
              <Card.Text>{summaryData.albums}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Artistas Activos</Card.Title>
              <Card.Text>{summaryData.artists}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Stock Total</Card.Title>
              <Card.Text>{summaryData.stock}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Ubicaciones Activas</Card.Title>
              <Card.Text>{summaryData.locations}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Edificios Activos</Card.Title>
              <Card.Text>{summaryData.buildings}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3>📈 Gráficas</h3>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Stock por Producto</Card.Title>
              <Bar data={stockChartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Productos Activos</Card.Title>
              <Doughnut data={productChartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3>📢 Notificaciones Recientes</h3>
      <ListGroup>
        <ListGroup.Item>Vinilo "1989" bajo en stock en Exhibición Sucursal.</ListGroup.Item>
        <ListGroup.Item>Nueva orden pendiente del proveedor "Sony Music".</ListGroup.Item>
        <ListGroup.Item>Actualiza inventario: Faltan 10 CDs de "Master of Puppets".</ListGroup.Item>
      </ListGroup>
    </div>
  );
};

export default Dashboard;
