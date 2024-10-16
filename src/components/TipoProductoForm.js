import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faFingerprint } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const TipoProductoForm = ({ tipoProducto, onClose, refreshTiposProductos }) => {
  const [formData, setFormData] = useState({
    tipo_id: tipoProducto ? tipoProducto.tipo_id : '',
    tipo_nombre: tipoProducto ? tipoProducto.tipo_nombre : '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar que el ID no esté duplicado si se trata de una creación
    try {
      if (!tipoProducto || (tipoProducto && formData.tipo_id !== tipoProducto.tipo_id)) {
        const response = await axios.get(`http://127.0.0.1:8000/tipoproductos/${formData.tipo_id}`);
        if (response.status === 200) {
          Swal.fire({
            icon: 'warning',
            title: 'ID Duplicado',
            text: "Ya existe un tipo de producto con el mismo ID.",
          });
          return;
        }
      }
    } catch (error) {
      // Si el tipo de producto no existe, continuar
    }

    try {
      if (tipoProducto) {
        await axios.put(`http://127.0.0.1:8000/tipoproductos/${tipoProducto.tipo_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: "Tipo de Producto actualizado exitosamente.",
        });
      } else {
        await axios.post('http://127.0.0.1:8000/tipoproductos/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: "Tipo de Producto guardado exitosamente.",
        });
      }
      refreshTiposProductos();
      onClose();
    } catch (error) {
      console.error("Error al guardar el tipo de producto:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error al guardar el tipo de producto.",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>
          <FontAwesomeIcon icon={faFingerprint} /> ID del Tipo de Producto
        </Form.Label>
        <Form.Control
          type="text"
          name="tipo_id"
          value={formData.tipo_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del tipo de producto"
          required
          disabled={!!tipoProducto}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Nombre del Tipo de Producto</Form.Label>
        <Form.Control
          type="text"
          name="tipo_nombre"
          value={formData.tipo_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del tipo de producto"
          required
        />
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {tipoProducto ? 'Actualizar Tipo' : 'Guardar Tipo'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        Volver
      </Button>
    </Form>
  );
};

export default TipoProductoForm;
