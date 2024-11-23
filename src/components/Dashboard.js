import React, { useEffect, useState } from 'react';
import { Card, Row, Col, ListGroup } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

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
  const [activeSuppliersCount, setActiveSuppliersCount] = useState(0);
  const [inactiveSuppliersCount, setInactiveSuppliersCount] = useState(0);

  // Fetch data for summary and charts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get('https://api2-uetw.onrender.com/api/tipos-producto/');
        const inventoryResponse = await axios.get('https://api2-uetw.onrender.com/api/inventarios/');
        const supplierResponse = await axios.get('https://api2-uetw.onrender.com/api/proveedores/');
        const albumResponse = await axios.get('https://api2-uetw.onrender.com/api/albumes/');
        const artistResponse = await axios.get('https://api2-uetw.onrender.com/api/artistas/');
        const stockResponse = await axios.get('https://api2-uetw.onrender.com/api/stocks/');
        const locationResponse = await axios.get('https://api2-uetw.onrender.com/api/ubicaciones/');
        const buildingResponse = await axios.get('https://api2-uetw.onrender.com/api/edificios/');

        const activos = supplierResponse.data.filter(s => s.proveedor_status === 'A');
        const inactivos = supplierResponse.data.filter(s => s.proveedor_status !== 'A');

        setSummaryData({
          products: productResponse.data.length,
          inventories: inventoryResponse.data.length,
          suppliers: activos.length + inactivos.length,
          albums: albumResponse.data.filter(a => a.album_status === 'A').length,
          artists: artistResponse.data.filter(a => a.artista_status === 'A').length,
          stock: stockResponse.data.length,
          locations: locationResponse.data.filter(l => l.ubicacion_status === 'A').length,
          buildings: buildingResponse.data.filter(b => b.edificio_status === 'A').length,
        });

        // Set stock data for chart
        setStockData(stockResponse.data);
        
        // Set active and inactive suppliers counts
        setActiveSuppliersCount(activos.length);
        setInactiveSuppliersCount(inactivos.length);
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

  // Chart Data for Suppliers
  const supplierChartData = {
    labels: ['Proveedores Activos', 'Proveedores Inactivos'], // Nombres de las categorías
    datasets: [
      {
        label: 'Estado de Proveedores',
        data: [
          activeSuppliersCount, // Cantidad de proveedores activos
          inactiveSuppliersCount // Cantidad de proveedores inactivos
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Color para proveedores activos
          'rgba(255, 99, 132, 0.6)' // Color para proveedores inactivos
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)', 
          'rgba(255, 99, 132, 1)'
        ],
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
              <Card.Title>Productos</Card.Title>
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
              <Card.Title>Estado de Proveedores</Card.Title>
              <Doughnut data={supplierChartData} />
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
