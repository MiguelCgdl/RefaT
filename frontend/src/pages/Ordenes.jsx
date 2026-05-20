import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Plus, X, Pencil, Save } from 'lucide-react';
import { carData } from '../utils/carData';

const API_URL = 'http://localhost:3001/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [vehiculosCliente, setVehiculosCliente] = useState([]);
  
  // Selection vs Creation
  const [isNewCliente, setIsNewCliente] = useState(false);
  const [isNewVehiculo, setIsNewVehiculo] = useState(false);

  // Existing Selections
  const [clienteId, setClienteId] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');

  // New Cliente Data
  const [newCliente, setNewCliente] = useState({ nombre: '', email: '', telefono: '' });
  // New Vehiculo Data
  const [newVehiculo, setNewVehiculo] = useState({ placas: '', marca: '', modelo: '', anio: '', color: '', motor: '', kilometraje: '' });

  // Order Data
  const [descripcion, setDescripcion] = useState('');
  const [problemasReportados, setProblemasReportados] = useState('');
  const [costoManoObra, setCostoManoObra] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchOrdenes();
    fetchClientes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      const res = await axios.get(`${API_URL}/ordenes`);
      setOrdenes(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`);
      setClientes(res.data);
    } catch (error) { console.error(error); }
  };

  const handleClienteChange = (e) => {
    const cid = e.target.value;
    setClienteId(cid);
    const cliente = clientes.find(c => c.id.toString() === cid);
    if (cliente) {
      setVehiculosCliente(cliente.vehiculos || []);
      if (cliente.vehiculos && cliente.vehiculos.length > 0) {
        setVehiculoId(cliente.vehiculos[0].id);
        setIsNewVehiculo(false);
      } else {
        setVehiculoId('');
        setIsNewVehiculo(true); // Si no tiene, forzamos nuevo
      }
    } else {
      setVehiculosCliente([]);
    }
  };

  const handleAddOrden = async (e) => {
    e.preventDefault();
    try {
      let finalClienteId = clienteId;
      let finalVehiculoId = vehiculoId;

      // 1. Crear Cliente si es necesario
      if (isNewCliente) {
        const cRes = await axios.post(`${API_URL}/clientes`, newCliente);
        finalClienteId = cRes.data.id;
      }

      // 2. Crear Vehículo si es necesario
      if (isNewVehiculo || isNewCliente) {
        const vRes = await axios.post(`${API_URL}/vehiculos`, { ...newVehiculo, anio: parseInt(newVehiculo.anio), clienteId: finalClienteId });
        finalVehiculoId = vRes.data.id;
      }

      // 3. Crear Orden
      await axios.post(`${API_URL}/ordenes`, {
        clienteId: finalClienteId,
        vehiculoId: finalVehiculoId,
        descripcion,
        problemasReportados,
        costoManoObra,
        refacciones: []
      });

      // Reset
      setShowForm(false);
      setDescripcion(''); setProblemasReportados(''); setCostoManoObra('');
      setIsNewCliente(false); setIsNewVehiculo(false);
      setNewCliente({ nombre: '', email: '', telefono: '' });
      setNewVehiculo({ placas: '', marca: '', modelo: '', anio: '', color: '', motor: '', kilometraje: '' });
      fetchClientes();
      fetchOrdenes();
    } catch (error) {
      alert("Error al crear la orden. Verifique los datos (Ej. Placas duplicadas).");
      console.error(error);
    }
  };

  const handleEnviarWhatsApp = async (id) => {
    try {
      await axios.post(`${API_URL}/ordenes/${id}/enviar-presupuesto`);
      alert("¡Presupuesto enviado exitosamente simulando WhatsApp/Email!");
      fetchOrdenes();
    } catch (error) {
      alert("Error enviando presupuesto");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/ordenes/${editingId}`, editData);
      setEditingId(null);
      setEditData({});
      fetchOrdenes();
    } catch (error) {
      alert("Error al actualizar la orden");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>Gestión de Órdenes y Presupuestos</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={20} /> : <Plus size={20} />} {showForm ? 'Cerrar' : 'Nueva Orden'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Crear Nueva Orden de Trabajo</h3>
          <form onSubmit={handleAddOrden} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* SECCIÓN CLIENTE */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Datos del Cliente</h4>
                <button type="button" className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setIsNewCliente(!isNewCliente)}>
                  {isNewCliente ? 'Seleccionar Existente' : '+ Crear Nuevo Cliente'}
                </button>
              </div>

              {isNewCliente ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <input className="input" placeholder="Nombre completo" value={newCliente.nombre} onChange={e => setNewCliente({...newCliente, nombre: e.target.value})} required />
                  <input className="input" type="email" placeholder="Correo electrónico" value={newCliente.email} onChange={e => setNewCliente({...newCliente, email: e.target.value})} required />
                  <input className="input" type="tel" placeholder="Teléfono/WhatsApp" value={newCliente.telefono} onChange={e => setNewCliente({...newCliente, telefono: e.target.value})} required />
                </div>
              ) : (
                <select className="input" value={clienteId} onChange={handleClienteChange} required>
                  <option value="">Seleccione un cliente registrado...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.telefono})</option>)}
                </select>
              )}
            </div>

            {/* SECCIÓN VEHÍCULO */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Datos del Vehículo</h4>
                {!isNewCliente && (
                  <button type="button" className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setIsNewVehiculo(!isNewVehiculo)}>
                    {isNewVehiculo ? 'Seleccionar Existente' : '+ Crear Nuevo Vehículo'}
                  </button>
                )}
              </div>

              {isNewVehiculo || isNewCliente ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                  <input className="input" placeholder="Placas" value={newVehiculo.placas} onChange={e => setNewVehiculo({...newVehiculo, placas: e.target.value})} required />
                  <select className="input" value={newVehiculo.marca} onChange={e => setNewVehiculo({...newVehiculo, marca: e.target.value, modelo: ''})} required>
                    <option value="">Marca...</option>
                    {Object.keys(carData).map(marca => <option key={marca} value={marca}>{marca}</option>)}
                  </select>
                  {newVehiculo.marca && !carData[newVehiculo.marca] ? (
                    <input className="input" placeholder="Modelo" value={newVehiculo.modelo} onChange={e => setNewVehiculo({...newVehiculo, modelo: e.target.value})} required />
                  ) : (
                    <select className="input" value={newVehiculo.modelo} onChange={e => setNewVehiculo({...newVehiculo, modelo: e.target.value})} required disabled={!newVehiculo.marca}>
                      <option value="">Modelo...</option>
                      {newVehiculo.marca && carData[newVehiculo.marca]?.map(modelo => <option key={modelo} value={modelo}>{modelo}</option>)}
                    </select>
                  )}
                  <input className="input" type="number" placeholder="Año" value={newVehiculo.anio} onChange={e => setNewVehiculo({...newVehiculo, anio: e.target.value})} required />
                </div>
              ) : (
                <select className="input" value={vehiculoId} onChange={e => setVehiculoId(e.target.value)} required disabled={!clienteId}>
                  <option value="">Seleccione un vehículo del cliente...</option>
                  {vehiculosCliente.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} - Placas: {v.placas}</option>)}
                </select>
              )}
            </div>

            {/* SECCIÓN ORDEN */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: '1rem' }}>Detalles de la Reparación</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Problemas Reportados por el Cliente</label>
                  <textarea className="input" rows="2" placeholder="Ej. El cliente indica que el auto vibra al frenar..." value={problemasReportados} onChange={e => setProblemasReportados(e.target.value)} required />
                </div>
                <div>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Diagnóstico / Trabajo a Realizar</label>
                  <textarea className="input" rows="2" placeholder="Ej. Rectificación de discos y cambio de balatas." value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
                </div>
                <div style={{ width: '300px' }}>
                  <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Costo Mano de Obra Estimada</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>$</span>
                    <input className="input" type="number" step="0.01" placeholder="0.00" value={costoManoObra} onChange={e => setCostoManoObra(e.target.value)} required />
                    <span style={{ color: 'var(--text-muted)' }}>MXN</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>Generar Cotización</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {ordenes.map(o => (
          <div key={o.id} className="glass-panel" style={{ padding: '1.5rem', border: editingId === o.id ? '1px solid var(--primary-color)' : 'none' }}>
            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Orden #{o.id} - {o.vehiculo?.marca} {o.vehiculo?.modelo}
                  {editingId !== o.id && (
                    <button className="btn" style={{ padding: '0.25rem' }} onClick={() => { setEditingId(o.id); setEditData(o); }}>
                      <Pencil size={14} />
                    </button>
                  )}
                </h3>
                <span className="text-muted">{o.cliente?.nombre} | Placas: {o.vehiculo?.placas}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', color: 'var(--success-color)', fontWeight: 'bold' }}>
                  {formatCurrency(o.total)}
                </div>
                {editingId === o.id ? (
                  <select className="input" value={editData.estado} onChange={e => setEditData({...editData, estado: e.target.value})} style={{ marginTop: '0.5rem' }}>
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="ENVIADO">ENVIADO</option>
                    <option value="AUTORIZADO">AUTORIZADO</option>
                    <option value="COMPLETADO">COMPLETADO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>
                ) : (
                  <span className={`badge ${o.estado === 'AUTORIZADO' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                    Estado: {o.estado}
                  </span>
                )}
              </div>
            </div>

            {editingId === o.id ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <textarea className="input" placeholder="Problemas reportados..." value={editData.problemasReportados} onChange={e => setEditData({...editData, problemasReportados: e.target.value})} />
                <textarea className="input" placeholder="Diagnóstico..." value={editData.descripcion} onChange={e => setEditData({...editData, descripcion: e.target.value})} />
                <input className="input" type="number" step="0.01" placeholder="Costo Mano Obra" value={editData.costoManoObra} onChange={e => setEditData({...editData, costoManoObra: e.target.value})} />
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button className="btn" onClick={() => setEditingId(null)}><X size={18} /> Cancelar</button>
                  <button className="btn btn-primary" onClick={handleUpdate}><Save size={18} /> Guardar Cambios</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 className="flex items-center gap-2" style={{ marginBottom: '0.5rem', color: 'var(--danger-color)' }}><AlertTriangle size={18} /> Problemas Reportados</h4>
                  <p style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                    {o.problemasReportados || 'Ninguno especificado.'}
                  </p>
                  <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Diagnóstico del Mecánico</h4>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>{o.descripcion}</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                  {o.estado === 'PENDIENTE' && (
                    <button className="btn btn-primary" onClick={() => handleEnviarWhatsApp(o.id)}>
                      📲 Enviar Presupuesto al Cliente
                    </button>
                  )}
                  {o.estado === 'ENVIADO' && (
                    <span style={{ color: 'var(--text-muted)' }}>Esperando que el cliente ingrese al link y autorice.</span>
                  )}
                  {o.estado === 'AUTORIZADO' && (
                    <span style={{ color: 'var(--success-color)' }}>✓ Cotización Autorizada por el cliente.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {ordenes.length === 0 && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aún no hay órdenes registradas.
          </div>
        )}
      </div>
    </div>
  );
};

export default Ordenes;
