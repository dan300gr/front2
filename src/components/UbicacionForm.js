import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faFingerprint, faBuilding } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const UbicacionForm = ({ ubicacion, onClose, refreshUbicaciones }) => {
  const [formData, setFormData] = useState({
    ubicacion_id: ubicacion ? ubicacion.ubicacion_id : '',  
    ubicacion_nombre: ubicacion ? ubicacion.ubicacion_nombre : '',
    edificio_id: ubicacion ? ubicacion.edificio_id : '',
  });

  const [edificios, setEdificios] = useState([]);

  useEffect(() => {
    const fetchEdificios = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/edificios/');
        const edificiosActivos = response.data.filter(edificio => edificio.edificio_status === 'A');
        setEdificios(edificiosActivos);
      } catch (error) {
        console.error("Error al obtener los edificios:", error);
      }
    };

    fetchEdificios();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!ubicacion || (ubicacion && formData.ubicacion_id !== ubicacion.ubicacion_id)) {
        const response = await axios.get(`http://127.0.0.1:8000/ubicaciones/${formData.ubicacion_id}`);
        if (response.status === 200) {
          Swal.fire({
            icon: 'warning',
            title: 'ID Duplicado',
            text: "Ya existe una ubicación con el mismo ID.",
          });
          return;
        }
      }
    } catch (error) {
      // Error esperado si la ubicación no existe
    }

    try {
      if (ubicacion) {
        await axios.put(`http://127.0.0.1:8000/ubicaciones/${ubicacion.ubicacion_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: "Ubicación actualizada exitosamente.",
        });
      } else {
        await axios.post('http://127.0.0.1:8000/ubicaciones/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: "Ubicación guardada exitosamente.",
        });
      }
      refreshUbicaciones(); 
      onClose(); 
    } catch (error) {
      console.error("Error al guardar la ubicación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error al guardar la ubicación.",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faFingerprint}/> ID de la Ubicación</Form.Label>
        <Form.Control
          type="text"
          name="ubicacion_id"
          value={formData.ubicacion_id}
          onChange={handleChange}
          placeholder="Ingrese el ID de la ubicación"
          required
          disabled={!!ubicacion}  
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Nombre de la Ubicación</Form.Label>
        <Form.Control
          type="text"
          name="ubicacion_nombre"
          value={formData.ubicacion_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre de la ubicación"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faBuilding}/> Edificio</Form.Label>
        <Form.Control
          as="select"
          name="edificio_id"
          value={formData.edificio_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un edificio</option>
          {edificios.map(edificio => (
            <option key={edificio.edificio_id} value={edificio.edificio_id}>
              {edificio.edificio_nombre}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {ubicacion ? 'Actualizar Ubicación' : 'Guardar Ubicación'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default UbicacionForm;
