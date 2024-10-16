import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2

const CatalogForm = ({ catalogo, onClose, refreshCatalogos }) => {
  const [formData, setFormData] = useState({
    catalogo_id: catalogo ? catalogo.catalogo_id : '',  // Mostrar ID solo si está en edición
    catalogo_nombre: catalogo ? catalogo.catalogo_nombre : '',  // Nombre del catálogo
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Verificar si el ID ya existe, excepto cuando se está editando el mismo catálogo
      if (!catalogo || (catalogo && formData.catalogo_id !== catalogo.catalogo_id)) {
        const response = await axios.get(`http://127.0.0.1:8000/catalogos/${formData.catalogo_id}`);
        if (response.status === 200) {
          Swal.fire({
            icon: 'warning',
            title: 'ID Duplicado',
            text: "Ya existe un catálogo con el mismo ID.",
          });
          return; // No proceder si el catálogo ya existe
        }
      }
    } catch (error) {
      // Si el catálogo no existe, el error es esperado. Continuar con la creación.
    }

    try {
      if (catalogo) {
        // Actualizar catálogo existente
        await axios.put(`http://127.0.0.1:8000/catalogos/${catalogo.catalogo_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: "Catálogo actualizado exitosamente.",
        });
      } else {
        // Crear nuevo catálogo
        await axios.post('http://127.0.0.1:8000/catalogos/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: "Catálogo guardado exitosamente.",
        });
      }
      refreshCatalogos();
      onClose(); // Cerrar el modal
    } catch (error) {
      console.error("Error al guardar el catálogo:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error al guardar el catálogo.",
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
          disabled={!!catalogo}  
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
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {catalogo ? 'Actualizar Catálogo' : 'Guardar Catálogo'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default CatalogForm;
