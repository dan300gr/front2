import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faFingerprint } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2

const InventarioForm = ({ inventario, onClose, refreshInventarios, ubicaciones, productos, stocks }) => {  // Añadir stocks si se usa
  const [formData, setFormData] = useState({
    inventario_id: inventario ? inventario.inventario_id : '',
    ubicacion_id: inventario ? inventario.ubicacion_id : '',
    producto_id: inventario ? inventario.producto_id : '',
    stock_id: inventario ? inventario.stock_id : '',  // Añadir stock si se utiliza
    inventario_cantidad: inventario ? inventario.inventario_cantidad : 0,
  });

  useEffect(() => {
    if (inventario) {
      setFormData({
        inventario_id: inventario.inventario_id,
        ubicacion_id: inventario.ubicacion_id,
        producto_id: inventario.producto_id,
        stock_id: inventario.stock_id,  // Añadir stock si se usa
        inventario_cantidad: inventario.inventario_cantidad,
      });
    }
  }, [inventario]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (inventario) {
        await axios.put(`http://127.0.0.1:8000/inventarios/${inventario.inventario_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: "Inventario actualizado exitosamente.",
        });
      } else {
        await axios.post('http://127.0.0.1:8000/inventarios/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: "Inventario guardado exitosamente.",
        });
      }
      refreshInventarios(); // Refrescar la lista de inventarios
      onClose(); // Cerrar el modal
    } catch (error) {
      console.error("Error al guardar el inventario:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error al guardar el inventario.",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faFingerprint}/> ID del Inventario</Form.Label>
        <Form.Control
          type="text"
          name="inventario_id"
          value={formData.inventario_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del inventario"
          required
          disabled={!!inventario}  // Deshabilitar si está en modo edición
        />
      </Form.Group>

      {/* Filtro de ubicaciones activas */}
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
          {ubicaciones
            .filter(ubicacion => ubicacion.ubicacion_status === 'A')  // Solo ubicaciones activas
            .map(ubicacion => (
              <option key={ubicacion.ubicacion_id} value={ubicacion.ubicacion_id}>
                {ubicacion.ubicacion_nombre}
              </option>
          ))}
        </Form.Control>
      </Form.Group>

      {/* Filtro de productos activos */}
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
            .filter(producto => producto.producto_status === 'A')  // Solo productos activos
            .map(producto => (
              <option key={producto.producto_id} value={producto.producto_id}>
                {producto.producto_nombre}
              </option>
          ))}
        </Form.Control>
      </Form.Group>

      {/* Filtro de stocks activos, si se usa */}
      <Form.Group className="mb-3">
        <Form.Label>Stock</Form.Label>
        <Form.Control
          as="select"
          name="stock_id"
          value={formData.stock_id}
          onChange={handleChange}
        >
          <option value="">Seleccione un stock</option>
          {stocks
            .filter(stock => stock.stock_status === 'A')  // Solo stocks activos
            .map(stock => (
              <option key={stock.stock_id} value={stock.stock_id}>
                {`ID: ${stock.stock_id} - Cantidad: ${stock.stock_cantidad}`}
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
          placeholder="Ingrese la cantidad"
          required
        />
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {inventario ? 'Actualizar Inventario' : 'Guardar Inventario'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default InventarioForm;
