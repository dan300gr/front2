import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const EdificioForm = ({ edificio, onClose, refreshEdificios }) => {
  const [formData, setFormData] = useState({
    edificio_id: edificio ? edificio.edificio_id : '',
    edificio_nombre: edificio ? edificio.edificio_nombre : '',
    edificio_direccion: edificio ? edificio.edificio_direccion : '',
    edificio_status: edificio ? edificio.edificio_status : 'A',
    pais_descripcion: '',
    estado_descripcion: '',
    ciudad_descripcion: '',
  });

  const [paises, setPaises] = useState([]);
  const [estados, setEstados] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [estadosFiltrados, setEstadosFiltrados] = useState([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ciudadesResponse, estadosResponse] = await Promise.all([
          axios.get('http://34.134.65.19:5001/ciudades/api/ciudades'),
          axios.get('http://34.134.65.19:5001/estados/api/estados')
        ]);

        const ciudadesData = ciudadesResponse.data;
        const estadosData = estadosResponse.data;

        // Extraer países únicos
        const paisesUnicos = [...new Set(ciudadesData.map(ciudad => ciudad.pais_descripcion))];
        setPaises(paisesUnicos);

        setEstados(estadosData);
        setCiudades(ciudadesData);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener la información de países, estados y ciudades.',
        });
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'pais_descripcion') {
      const estadosFiltrados = estados.filter(estado => 
        ciudades.some(ciudad => ciudad.pais_descripcion === value && ciudad.ciudad_descripcion === estado.ciudad_descripcion)
      );
      setEstadosFiltrados(estadosFiltrados);
      setFormData(prev => ({ ...prev, estado_descripcion: '', ciudad_descripcion: '' }));
    } else if (name === 'estado_descripcion') {
      const ciudadesFiltradas = ciudades.filter(ciudad => 
        ciudad.pais_descripcion === formData.pais_descripcion && 
        estados.some(estado => estado.estado_descripcion === value && estado.ciudad_descripcion === ciudad.ciudad_descripcion)
      );
      setCiudadesFiltradas(ciudadesFiltradas);
      setFormData(prev => ({ ...prev, ciudad_descripcion: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (edificio && formData.edificio_status === 'I') {
        const ubicacionesResponse = await axios.get('https://api2-uetw.onrender.com/api/ubicaciones/');
        const ubicaciones = ubicacionesResponse.data;
        const isEdificioInUbicaciones = ubicaciones.some(ubicacion => ubicacion.edificio_id === edificio.edificio_id);

        if (isEdificioInUbicaciones) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No se puede desactivar el edificio porque está asociado a ubicaciones.',
          });
          return;
        }
      }

      if (edificio) {
        await axios.put(`https://api2-uetw.onrender.com/api/edificios/${edificio.edificio_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: 'Edificio actualizado exitosamente.',
        });
      } else {
        await axios.post('https://api2-uetw.onrender.com/api/edificios/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: 'Edificio guardado exitosamente.',
        });
      }

      refreshEdificios();
      onClose();
    } catch (error) {
      console.error('Error al guardar el edificio:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'No se puede guardar un edificio con el mismo ID.',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID del Edificio</Form.Label>
        <Form.Control
          type="text"
          name="edificio_id"
          value={formData.edificio_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del edificio"
          required
          disabled={!!edificio}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Nombre del Edificio</Form.Label>
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
        <Form.Label>País</Form.Label>
        <Form.Control as="select" name="pais_descripcion" value={formData.pais_descripcion} onChange={handleChange}>
          <option value="">Seleccione un país</option>
          {paises.map((pais, index) => (
            <option key={index} value={pais}>{pais}</option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control as="select" name="estado_descripcion" value={formData.estado_descripcion} onChange={handleChange} disabled={!formData.pais_descripcion}>
          <option value="">Seleccione un estado</option>
          {estadosFiltrados.map((estado, index) => (
            <option key={index} value={estado.estado_descripcion}>{estado.estado_descripcion}</option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Ciudad</Form.Label>
        <Form.Control as="select" name="ciudad_descripcion" value={formData.ciudad_descripcion} onChange={handleChange} disabled={!formData.estado_descripcion}>
          <option value="">Seleccione una ciudad</option>
          {ciudadesFiltradas.map((ciudad, index) => (
            <option key={index} value={ciudad.ciudad_descripcion}>{ciudad.ciudad_descripcion}</option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Dirección</Form.Label>
        <Form.Control
          type="text"
          name="edificio_direccion"
          value={formData.edificio_direccion}
          onChange={handleChange}
          placeholder="Ingrese la dirección del edificio"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control as="select" name="edificio_status" value={formData.edificio_status} onChange={handleChange}>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {edificio ? 'Actualizar' : 'Guardar'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default EdificioForm;

