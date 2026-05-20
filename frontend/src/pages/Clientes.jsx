import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Car, Pencil, Save, X } from 'lucide-react';
import { carData } from '../utils/carData';

const API_URL = 'http://localhost:3001/api';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  
  // Create State
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // Vehículo Create State
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [vPlacas, setVPlacas] = useState('');
  const [vMarca, setVMarca] = useState('');
  const [vModelo, setVModelo] = useState('');
  const [vAnio, setVAnio] = useState('');
  const [vColor, setVColor] = useState('');
  const [vKilometraje, setVKilometraje] = useState('');

  // Edit State
  const [editingClienteId, setEditingClienteId] = useState(null);
  const [editClienteData, setEditClienteData] = useState({});
  const [editingVehiculoId, setEditingVehiculoId] = useState(null);
  const [editVehiculoData, setEditVehiculoData] = useState({});

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`);
      setClientes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/clientes`, { nombre, email, telefono });
      setNombre(''); setEmail(''); setTelefono('');
      fetchClientes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddVehiculo = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/vehiculos`, { 
        placas: vPlacas, 
        marca: vMarca, 
        modelo: vModelo, 
        anio: vAnio,
        color: vColor,
        kilometraje: vKilometraje,
        clienteId: selectedClienteId 
      });
      setShowVehicleForm(false);
      setVPlacas(''); setVMarca(''); setVModelo(''); setVAnio(''); setVColor(''); setVKilometraje('');
      fetchClientes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateCliente = async () => {
    try {
      await axios.put(`${API_URL}/clientes/${editingClienteId}`, editClienteData);
      setEditingClienteId(null);
      fetchClientes();
    } catch (error) {
      alert("Error actualizando cliente");
    }
  };

  const handleUpdateVehiculo = async () => {
    try {
      await axios.put(`${API_URL}/vehiculos/${editingVehiculoId}`, editVehiculoData);
      setEditingVehiculoId(null);
      fetchClientes();
    } catch (error) {
      alert("Error actualizando vehículo");
    }
  };

  return (
    <div className="animate-fade-in">
      <h2>Directorio de Clientes</h2>

      <div className="glass-panel" style={{ padding: '1.5rem', margin: '2rem 0' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Nuevo Cliente</h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-center">
          <input className="input" placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} required />
          <input className="input" type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="tel" placeholder="WhatsApp / Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Guardar Cliente</button>
        </form>
      </div>

      {showVehicleForm && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--primary-color)' }}>Agregar Vehículo al Cliente #{selectedClienteId}</h3>
          <form onSubmit={handleAddVehiculo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <input className="input" placeholder="Placas" value={vPlacas} onChange={e => setVPlacas(e.target.value)} required />
            <select className="input" value={vMarca} onChange={e => { setVMarca(e.target.value); setVModelo(''); }} required>
              <option value="">Marca...</option>
              {Object.keys(carData).map(marca => <option key={marca} value={marca}>{marca}</option>)}
            </select>
            {vMarca && !carData[vMarca] ? (
              <input className="input" placeholder="Modelo" value={vModelo} onChange={e => setVModelo(e.target.value)} required />
            ) : (
              <select className="input" value={vModelo} onChange={e => setVModelo(e.target.value)} required disabled={!vMarca}>
                <option value="">Modelo...</option>
                {vMarca && carData[vMarca]?.map(modelo => <option key={modelo} value={modelo}>{modelo}</option>)}
              </select>
            )}
            <input className="input" type="number" placeholder="Año" value={vAnio} onChange={e => setVAnio(e.target.value)} required />
            <input className="input" placeholder="Color" value={vColor} onChange={e => setVColor(e.target.value)} />
            <input className="input" type="number" placeholder="Kilometraje" value={vKilometraje} onChange={e => setVKilometraje(e.target.value)} />
            <div style={{ gridColumn: 'span 3', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => setShowVehicleForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar Vehículo</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {clientes.map(c => (
          <div key={c.id} className="glass-panel" style={{ padding: '1.5rem' }}>
            {editingClienteId === c.id ? (
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <input className="input" value={editClienteData.nombre} onChange={e => setEditClienteData({...editClienteData, nombre: e.target.value})} />
                <input className="input" value={editClienteData.telefono} onChange={e => setEditClienteData({...editClienteData, telefono: e.target.value})} />
                <input className="input" value={editClienteData.email} onChange={e => setEditClienteData({...editClienteData, email: e.target.value})} />
                <button className="btn btn-primary" onClick={handleUpdateCliente}><Save size={18} /></button>
                <button className="btn" onClick={() => setEditingClienteId(null)}><X size={18} /></button>
              </div>
            ) : (
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {c.nombre}
                    <button className="btn" style={{ padding: '0.25rem' }} onClick={() => { setEditingClienteId(c.id); setEditClienteData(c); }}><Pencil size={14} /></button>
                  </h3>
                  <span className="text-muted">{c.telefono} | {c.email}</span>
                </div>
                <button className="btn btn-primary" onClick={() => { setSelectedClienteId(c.id); setShowVehicleForm(true); }}>
                  + Agregar Vehículo
                </button>
              </div>
            )}

            {c.vehiculos && c.vehiculos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                {c.vehiculos.map(v => (
                  <div key={v.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    {editingVehiculoId === v.id ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input className="input" placeholder="Placas" value={editVehiculoData.placas} onChange={e => setEditVehiculoData({...editVehiculoData, placas: e.target.value})} />
                        <input className="input" type="number" placeholder="Año" value={editVehiculoData.anio} onChange={e => setEditVehiculoData({...editVehiculoData, anio: e.target.value})} />
                        <input className="input" placeholder="Color" value={editVehiculoData.color || ''} onChange={e => setEditVehiculoData({...editVehiculoData, color: e.target.value})} />
                        <input className="input" type="number" placeholder="Km" value={editVehiculoData.kilometraje || ''} onChange={e => setEditVehiculoData({...editVehiculoData, kilometraje: e.target.value})} />
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpdateVehiculo}><Save size={16} /> Guardar</button>
                          <button className="btn" style={{ flex: 1 }} onClick={() => setEditingVehiculoId(null)}><X size={16} /> Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="flex items-center gap-3">
                          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
                            <Car size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {v.marca} {v.modelo} ({v.anio})
                              <button className="btn" style={{ padding: '0.25rem', background: 'transparent', border: 'none' }} onClick={() => { setEditingVehiculoId(v.id); setEditVehiculoData(v); }}>
                                <Pencil size={14} color="var(--text-muted)" />
                              </button>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                              Placas: {v.placas} | Km: {v.kilometraje || '-'} | Color: {v.color || '-'}
                            </div>
                          </div>
                        </div>
                        <Link to={`/admin/vehiculo/${v.id}`} className="btn" style={{ fontSize: '0.75rem' }}>Historial</Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>No hay vehículos registrados para este cliente.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clientes;
