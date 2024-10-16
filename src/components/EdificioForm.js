
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faFingerprint, faBuilding } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2

const EdificioForm = ({ edificio, onClose, refreshEdificios }) => {
  const [formData, setFormData] = useState({
    edificio_id: edificio ? edificio.edificio_id : '',  // ID del edificio
    edificio_nombre: edificio ? edificio.edificio_nombre : '',
    edificio_direccion: edificio ? edificio.edificio_direccion : '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Verificar si el edificio ID ya existe, excepto cuando se está editando el mismo edificio
      if (!edificio || (edificio && formData.edificio_id !== edificio.edificio_id)) {
        const response = await axios.get(`http://127.0.0.1:8000/edificios/${formData.edificio_id}`);
        if (response.status === 200) {
          Swal.fire({
            icon: 'warning',
            title: 'ID Duplicado',
            text: "Ya existe un edificio con el mismo ID.",
          });
          return; // No proceder si el edificio ya existe
        }
      }
    } catch (error) {
      // Si el edificio no existe, el error es esperado. Continuar con la creación.
    }

    try {
      if (edificio) {
        await axios.put(`http://127.0.0.1:8000/edificios/${edificio.edificio_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: "Edificio actualizado exitosamente.",
        });
      } else {
        await axios.post('http://127.0.0.1:8000/edificios/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: "Edificio guardado exitosamente.",
        });
      }
      refreshEdificios(); // Refrescar la lista de edificios
      onClose(); // Cerrar el modal
    } catch (error) {
      console.error("Error al guardar el edificio:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error al guardar el edificio.",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faFingerprint}/> ID del Edificio</Form.Label>
        <Form.Control
          type="text"
          name="edificio_id"
          value={formData.edificio_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del edificio"
          required
          disabled={!!edificio}  // Deshabilitar si está en modo edición
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faBuilding}/> Nombre del Edificio</Form.Label>
        <Form.Control
          type="text"
          name="edificio_nombre"
          value={formData.edificio_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del edificio"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Dirección del Edificio</Form.Label>
        <Form.Control
          type="text"
          name="edificio_direccion"
          value={formData.edificio_direccion}
          onChange={handleChange}
          placeholder="Ingrese la dirección del edificio"
          required
        />
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {edificio ? 'Actualizar Edificio' : 'Guardar Edificio'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default EdificioForm;
