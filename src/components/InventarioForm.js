import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const InventarioForm = ({ inventario, onClose, refreshInventarios }) => {
  const [formData, setFormData] = useState({
    inventario_id: inventario ? inventario.inventario_id : '',
    ubicacion_id: inventario ? inventario.ubicacion_id : '',
    producto_id: inventario ? inventario.producto_id : '',
    stock_id: inventario ? inventario.stock_id : '',
    inventario_cantidad: inventario ? inventario.inventario_cantidad : 0,
    inventario_status: inventario ? inventario.inventario_status : 'A',
  });

  const [productos, setProductos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetchProductos();
    fetchUbicaciones();
    fetchStocks();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get('https://api2-uetw.onrender.com/api/productos/');
      const activos = response.data.filter(producto => producto.producto_status === 'A');
      setProductos(activos);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los productos.',
      });
    }
  };

  const fetchUbicaciones = async () => {
    try {
      const response = await axios.get('https://api2-uetw.onrender.com/api/ubicaciones/');
      const activos = response.data.filter(ubicacion => ubicacion.ubicacion_status === 'A');
      setUbicaciones(activos);
    } catch (error) {
      console.error('Error al obtener las ubicaciones:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las ubicaciones.',
      });
    }
  };

  const fetchStocks = async () => {
    try {
      const response = await axios.get('https://api2-uetw.onrender.com/api/stocks/');
      const activos = response.data.filter(stock => stock.stock_status === 'A');
      setStocks(activos);
    } catch (error) {
      console.error('Error al obtener los stocks:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los stocks.',
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Guardar o actualizar el inventario
      if (inventario) {
        await axios.put(`https://api2-uetw.onrender.com/api/inventarios/${inventario.inventario_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: 'Inventario actualizado exitosamente.',
        });
      } else {
        await axios.post('https://api2-uetw.onrender.com/api/inventarios/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: 'Inventario guardado exitosamente.',
        });
      }

      // Verifica si refreshInventarios está definido antes de llamarlo
      if (typeof refreshInventarios === 'function') {
        refreshInventarios();
      } else {
        console.error('refreshInventarios no es una función');
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar el inventario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el inventario.',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID del Inventario</Form.Label>
        <Form.Control
          type="text"
          name="inventario_id"
          value={formData.inventario_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del inventario"
          required
          disabled={!!inventario} // Deshabilita el ID si se está editando
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Ubicación</Form.Label>
        <Form.Control
          as="select"
          name="ubicacion_id"
          value={formData.ubicacion_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione una ubicación</option>
          {ubicaciones.map((ubicacion) => (
            <option key={ubicacion.ubicacion_id} value={ubicacion.ubicacion_id}>
              {ubicacion.ubicacion_nombre}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Producto</Form.Label>
        <Form.Control
          as="select"
          name="producto_id"
          value={formData.producto_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un producto</option>
          {productos.map((producto) => (
            <option key={producto.producto_id} value={producto.producto_id}>
              {producto.producto_nombre}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Stock</Form.Label>
        <Form.Control
          as="select"
          name="stock_id"
          value={formData.stock_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un stock</option>
          {stocks.map((stock) => (
            <option key={stock.stock_id} value={stock.stock_id}>
              {stock.stock_id}  {/* Aquí puedes mostrar un nombre más descriptivo si lo tienes */}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Cantidad</Form.Label>
        <Form.Control
          type="number"
          name="inventario_cantidad"
          value={formData.inventario_cantidad}
          onChange={handleChange}
          placeholder="Ingrese la cantidad de inventario"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control as="select" name="inventario_status" value={formData.inventario_status} onChange={handleChange}>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {inventario ? 'Actualizar' : 'Guardar'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default InventarioForm;
