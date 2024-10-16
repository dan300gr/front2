import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faFingerprint } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2

const StockForm = ({ stock, onClose, refreshStocks, productos }) => {
  const [formData, setFormData] = useState({
    stock_id: stock ? stock.stock_id : '',
    producto_id: stock ? stock.producto_id : '',
    stock_cantidad: stock ? stock.stock_cantidad : 0,
  });

  useEffect(() => {
    if (stock) {
      setFormData({
        stock_id: stock.stock_id,
        producto_id: stock.producto_id,
        stock_cantidad: stock.stock_cantidad,
      });
    }
  }, [stock]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (stock) {
        await axios.put(`http://127.0.0.1:8000/stocks/${stock.stock_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: "Stock actualizado exitosamente.",
        });
      } else {
        await axios.post('http://127.0.0.1:8000/stocks/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: "Stock guardado exitosamente.",
        });
      }
      refreshStocks(); // Refrescar la lista de stocks
      onClose(); // Cerrar el modal
    } catch (error) {
      console.error("Error al guardar el stock:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error al guardar el stock.",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faFingerprint}/> ID del Stock</Form.Label>
        <Form.Control
          type="text"
          name="stock_id"
          value={formData.stock_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del stock"
          required
          disabled={!!stock}  // Deshabilitar si está en modo edición
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
          {productos
            .filter(producto => producto.producto_status === 'A')  // Filtrar solo productos activos
            .map(producto => (
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
          placeholder="Ingrese la cantidad"
          required
        />
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {stock ? 'Actualizar Stock' : 'Guardar Stock'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default StockForm;
