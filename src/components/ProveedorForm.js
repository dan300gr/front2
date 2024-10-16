import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faFingerprint, faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Para alertas

const ProveedorForm = ({ proveedor, onClose, refreshProveedores }) => {
  const [formData, setFormData] = useState({
    proveedor_id: proveedor ? proveedor.proveedor_id : '',
    proveedor_nombre: proveedor ? proveedor.proveedor_nombre : '',
    proveedor_direccion: proveedor ? proveedor.proveedor_direccion : '',
    proveedor_telefono: proveedor ? proveedor.proveedor_telefono : '',
    proveedor_correo: proveedor ? proveedor.proveedor_correo : '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Verificar si el proveedor ID ya existe
      if (!proveedor || (proveedor && formData.proveedor_id !== proveedor.proveedor_id)) {
        const response = await axios.get(`http://127.0.0.1:8000/proveedores/${formData.proveedor_id}`);
        if (response.status === 200) {
          Swal.fire({
            icon: 'warning',
            title: 'ID Duplicado',
            text: "Ya existe un proveedor con el mismo ID.",
          });
          return; // No proceder si el proveedor ya existe
        }
      }
    } catch (error) {
      // Si el proveedor no existe, continuar con la creación
    }

    try {
      if (proveedor) {
        await axios.put(`http://127.0.0.1:8000/proveedores/${proveedor.proveedor_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: "Proveedor actualizado exitosamente.",
        });
      } else {
        await axios.post('http://127.0.0.1:8000/proveedores/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: "Proveedor guardado exitosamente.",
        });
      }
      refreshProveedores(); // Refrescar la lista de proveedores
      onClose(); // Cerrar el modal
    } catch (error) {
      console.error("Error al guardar el proveedor:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error al guardar el proveedor.",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faFingerprint}/> ID del Proveedor</Form.Label>
        <Form.Control
          type="text"
          name="proveedor_id"
          value={formData.proveedor_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del proveedor"
          required
          disabled={!!proveedor}  // Deshabilitar si está en modo edición
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faMapMarkerAlt}/> Nombre del Proveedor</Form.Label>
        <Form.Control
          type="text"
          name="proveedor_nombre"
          value={formData.proveedor_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del proveedor"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faPhone}/> Teléfono</Form.Label>
        <Form.Control
          type="text"
          name="proveedor_telefono"
          value={formData.proveedor_telefono}
          onChange={handleChange}
          placeholder="Ingrese el teléfono del proveedor"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faEnvelope}/> Correo Electrónico</Form.Label>
        <Form.Control
          type="email"
          name="proveedor_correo"
          value={formData.proveedor_correo}
          onChange={handleChange}
          placeholder="Ingrese el correo electrónico del proveedor"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faMapMarkerAlt}/> Dirección del Proveedor</Form.Label>
        <Form.Control
          type="text"
          name="proveedor_direccion"
          value={formData.proveedor_direccion}
          onChange={handleChange}
          placeholder="Ingrese la dirección del proveedor"
          required
        />
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {proveedor ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default ProveedorForm;
