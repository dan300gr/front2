import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const CatalogForm = ({ catalogo, onClose, refreshCatalogos }) => {
  const [formData, setFormData] = useState({
    catalogo_id: catalogo ? catalogo.catalogo_id : '',
    catalogo_nombre: catalogo ? catalogo.catalogo_nombre : '',
    catalogo_status: catalogo ? catalogo.catalogo_status : 'A',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Si estamos editando un catálogo y se intenta desactivar, comprobamos si está asociado a productos
      if (catalogo && formData.catalogo_status === 'I') {
        const productsResponse = await axios.get('https://20.246.139.92/api/productos/');
        const products = productsResponse.data;
        const isCatalogInProducts = products.some(product => product.catalogo_id === catalogo.catalogo_id);

        if (isCatalogInProducts) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No se puede desactivar el catálogo porque está asociado a productos.',
          });
          return;
        }
      }

      // Guardar o actualizar el catálogo
      if (catalogo) {
        await axios.put(`https://20.246.139.92/api/catalogos/${catalogo.catalogo_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: 'Catálogo actualizado exitosamente.',
        });
      } else {
        await axios.post('https://20.246.139.92/api/catalogos/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: 'Catálogo guardado exitosamente.',
        });
      }

      refreshCatalogos();
      onClose();
    } catch (error) {
      console.error('Error al guardar el catálogo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el catálogo.',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID del Catálogo</Form.Label>
        <Form.Control
          type="text"
          name="catalogo_id"
          value={formData.catalogo_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del catálogo"
          required
          disabled={!!catalogo} // Deshabilita el ID si se está editando
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Nombre del Catálogo</Form.Label>
        <Form.Control
          type="text"
          name="catalogo_nombre"
          value={formData.catalogo_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del catálogo"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control as="select" name="catalogo_status" value={formData.catalogo_status} onChange={handleChange}>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {catalogo ? 'Actualizar' : 'Guardar'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default CatalogForm;
