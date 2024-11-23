import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const ProductForm = ({ product, onClose, refreshProducts, types, catalogs, albums }) => {
  const [formData, setFormData] = useState({
    producto_id: product ? product.producto_id : '',
    producto_nombre: product ? product.producto_nombre : '',
    tipo_id: product ? product.tipo_id : '',
    catalogo_id: product ? product.catalogo_id : '',
    album_id: product ? product.album_id : '',
    producto_precio: product ? product.producto_precio : '',
    producto_status: product ? product.producto_status : 'A',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Si estamos editando un producto y se intenta desactivar, comprobamos si está asociado a algún stock
      if (product && formData.producto_status === 'I') {
        const stockResponse = await axios.get('https://api2-uetw.onrender.com/api/stocks/');
        const stocks = stockResponse.data;
        const isProductInStock = stocks.some(stock => stock.producto_id === product.producto_id);

        if (isProductInStock) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No se puede desactivar el producto porque está asociado a un stock activo.',
          });
          return; // Detenemos la ejecución para evitar el envío del formulario
        }
      }

      // Si el producto ya existe, actualizamos
      if (product) {
        await axios.put(`https://api2-uetw.onrender.com/api/productos/${formData.producto_id}`, formData);
        Swal.fire('Actualizado!', 'El producto ha sido actualizado.', 'success');
      } else {
        // Si el producto es nuevo, lo creamos
        await axios.post('https://api2-uetw.onrender.com/api/productos/', formData);
        Swal.fire('Guardado!', 'El producto ha sido guardado.', 'success');
      }

      refreshProducts(); // Actualizamos la lista de productos
      onClose(); // Cerramos el formulario
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      Swal.fire('Cuidado', 'Ya existe un producto con ese ID.', 'warning');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formProductoId">
        <Form.Label>ID del Producto</Form.Label>
        <Form.Control
          type="text"
          name="producto_id"
          value={formData.producto_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del producto"
          required
          disabled={!!product} // Deshabilita si se está editando
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formProductoNombre">
        <Form.Label>Nombre del Producto</Form.Label>
        <Form.Control
          type="text"
          name="producto_nombre"
          value={formData.producto_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del producto"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formTipo">
        <Form.Label>Tipo de Producto</Form.Label>
        <Form.Control
          as="select"
          name="tipo_id"
          value={formData.tipo_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un tipo de producto</option>
          {types.filter(type => type.tipo_status === 'A').map((type) => (
            <option key={type.tipo_id} value={type.tipo_id}>
              {type.tipo_nombre}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formCatalogo">
        <Form.Label>Catálogo</Form.Label>
        <Form.Control
          as="select"
          name="catalogo_id"
          value={formData.catalogo_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un catálogo</option>
          {catalogs.filter(catalog => catalog.catalogo_status === 'A').map((catalog) => (
            <option key={catalog.catalogo_id} value={catalog.catalogo_id}>
              {catalog.catalogo_nombre}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formAlbum">
        <Form.Label>Álbum</Form.Label>
        <Form.Control
          as="select"
          name="album_id"
          value={formData.album_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un álbum</option>
          {albums.filter(album => album.album_status === 'A').map((album) => (
            <option key={album.album_id} value={album.album_id}>
              {album.album_nombre}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formProductoPrecio">
        <Form.Label>Precio</Form.Label>
        <Form.Control
          type="number"
          name="producto_precio"
          value={formData.producto_precio}
          onChange={handleChange}
          placeholder="Ingrese el precio del producto"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formProductoStatus">
        <Form.Label>Estado</Form.Label>
        <Form.Control
          as="select"
          name="producto_status"
          value={formData.producto_status}
          onChange={handleChange}
        >
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={onClose}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </Button>
        <Button variant="success" type="submit">
          <FontAwesomeIcon icon={faSave} /> {product ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </Form>
  );
};

export default ProductForm;
