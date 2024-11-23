import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const StockForm = ({ stock, onClose, refreshStocks }) => {
  const [formData, setFormData] = useState({
    stock_id: stock ? stock.stock_id : '',
    producto_id: stock ? stock.producto_id : '',
    stock_cantidad: stock ? stock.stock_cantidad : 0,
    stock_status: stock ? stock.stock_status : 'A',
  });

  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetchProductos();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Si estamos editando un stock y se intenta desactivar, comprobamos si está asociado a algún inventario
      if (stock && formData.stock_status === 'I') {
        const inventarioResponse = await axios.get('https://api2-uetw.onrender.com/api/inventarios/'); // Asegúrate de que este endpoint sea correcto
        const inventarioItems = inventarioResponse.data;
        const isStockInInventario = inventarioItems.some(item => item.stock_id === stock.stock_id);

        if (isStockInInventario) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No se puede desactivar el stock porque está asociado a inventario.',
          });
          return;
        }
      }

      // Guardar o actualizar el stock
      if (stock) {
        await axios.put(`https://api2-uetw.onrender.com/api/stocks/${stock.stock_id}`, formData); // Asegúrate de que este endpoint sea correcto
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: 'Stock actualizado exitosamente.',
        });
      } else {
        await axios.post('https://api2-uetw.onrender.com/api/stocks/', formData); // Asegúrate de que este endpoint sea correcto
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: 'Stock guardado exitosamente.',
        });
      }

      refreshStocks();
      onClose();
    } catch (error) {
      console.error('Error al guardar el stock:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el stock.',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID del Stock</Form.Label>
        <Form.Control
          type="text"
          name="stock_id"
          value={formData.stock_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del stock"
          required
          disabled={!!stock} // Deshabilita el ID si se está editando
        />
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
        <Form.Label>Cantidad</Form.Label>
        <Form.Control
          type="number"
          name="stock_cantidad"
          value={formData.stock_cantidad}
          onChange={handleChange}
          placeholder="Ingrese la cantidad de stock"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control as="select" name="stock_status" value={formData.stock_status} onChange={handleChange}>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {stock ? 'Actualizar' : 'Guardar'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default StockForm;
