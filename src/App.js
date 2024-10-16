import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard'; // Asegúrate de importar el componente Dashboard
import AlbumList from './components/AlbumList';
import ArtistList from './components/ArtistList';
import CatalogList from './components/CatalogList';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import AlbumForm from './components/AlbumForm';
import ArtistForm from './components/ArtistForm';
import CatalogForm from './components/CatalogForm';
import TipoProductoList from './components/TipoProductoList';
import TipoProductoForm from './components/TipoProductoForm';
import ProveedorList from './components/ProveedorList';
import ProveedorForm from './components/ProveedorForm';
import EdificioList from './components/EdificioList';
import EdificioForm from './components/EdificioForm';
import UbicacionForm from './components/UbicacionForm';
import UbicacionList from './components/UbicacionList';
import InventarioList from './components/InventarioList';
import InventarioForm from './components/InventarioForm';
import StockList from './components/StockList';
import StockForm from './components/StockForm';


const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />  {/* Componente Dashboard como pantalla principal */}
          <Route path="/productos" element={<ProductList />} />
          <Route path="/productos/agregar" element={<ProductForm />} />
          <Route path="/productos/:producto_id/editar" element={<ProductForm />} />

          <Route path="/albums" element={<AlbumList />} />
          <Route path="/albums/agregar" element={<AlbumForm />} />
          <Route path="/albums/:album_id/editar" element={<AlbumForm />} />

          <Route path="/artistas" element={<ArtistList />} />
          <Route path="/artistas/agregar" element={<ArtistForm />} />
          <Route path="/artistas/:artista_id/editar" element={<ArtistForm />} />

          <Route path="/catalogos" element={<CatalogList />} />
          <Route path="/catalogos/agregar" element={<CatalogForm />} />
          <Route path="/catalogos/:catalogo_id/editar" element={<CatalogForm />} />

          <Route path="/tipoproductos" element={<TipoProductoList />} />
          <Route path="/tipoproductos/agregar" element={<TipoProductoForm />} />
          <Route path="/tipoproductos/:tipo_id/editar" element={<TipoProductoForm/>} />

          <Route path="/proveedores" element={<ProveedorList/>} />
          <Route path="/proveedores/agregar" element={<ProveedorForm />} />
          <Route path="/proveedores/:proveedor_id/editar" element={<ProveedorForm/>} />

          <Route path="/edificios" element={<EdificioList/>} />
          <Route path="/edificios/agregar" element={<EdificioForm />} />
          <Route path="/edificios/:edificio_id/editar" element={<EdificioForm/>} />

          <Route path="/ubicaciones" element={<UbicacionList/>} />
          <Route path="/ubicaciones/agregar" element={<UbicacionForm />} />
          <Route path="/ubicaciones/:ubicacion_id/editar" element={<UbicacionForm/>} />

          <Route path="/inventarios" element={<InventarioList/>} />
          <Route path="/inventarios/agregar" element={<InventarioForm />} />
          <Route path="/inventarios/:inventario_id/editar" element={<InventarioForm/>} />

          <Route path="/stocks" element={<StockList/>} />
          <Route path="/stocks/agregar" element={<StockForm/>} />
          <Route path="/stocks/:stock_id/editar" element={<StockForm/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
