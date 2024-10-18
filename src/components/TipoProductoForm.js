import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const TipoProductoForm = ({ tipoProducto, onClose, refreshTiposProductos }) => {
  const [formData, setFormData] = useState({
    tipo_id: tipoProducto ? tipoProducto.tipo_id : '',
    tipo_nombre: tipoProducto ? tipoProducto.tipo_nombre : '',
    tipo_status: tipoProducto ? tipoProducto.tipo_status : 'A',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Verificar si se intenta desactivar el tipo de producto
      if (formData.tipo_status === 'I') {
        const productsResponse = await axios.get('http://20.246.139.92/api/productos/');
        const products = productsResponse.data;
        const isTipoInProducts = products.some(product => product.tipo_id === formData.tipo_id);

        if (isTipoInProducts) {
          Swal.fire({
            icon: 'warning',
            title: 'Cuidado',
            text: 'No se puede desactivar el tipo de producto porque está asociado a productos.',
          });
          return; // Salir de la función si no se puede desactivar
        }
      }

      if (tipoProducto) {
        await axios.put(`http://20.246.139.92/api/tipos-producto/${tipoProducto.tipo_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: 'Tipo de Producto actualizado exitosamente.',
        });
      } else {
        await axios.post('http://20.246.139.92/api/tipos-producto/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: 'Tipo de Producto guardado exitosamente.',
        });
      }
      refreshTiposProductos();
      onClose();
    } catch (error) {
      console.error('Error al guardar el tipo de producto:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Cuidado',
        text: 'Ya existe tipo de producto con ese ID.',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID del Tipo de Producto</Form.Label>
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
      <Form.Group className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control as="select" name="tipo_status" value={formData.tipo_status} onChange={handleChange}>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {tipoProducto ? 'Actualizar' : 'Guardar'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default TipoProductoForm;
