'use client';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCliente, getClientes, updateCliente, deleteCliente, createVehiculo, getVehiculos, updateVehiculo, deleteVehiculo, getVehiculoHistorial } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, User, Users, Mail, Phone, Car, Search } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import type { Cliente, Vehiculo } from '@/lib/types';

const VEHICLE_CATALOG: Record<string, string[]> = {
  Acura: ['ILX', 'Integra', 'MDX', 'NSX', 'RDX', 'RLX', 'TLX', 'ZDX'],
  'Alfa Romeo': ['4C', 'Giulia', 'Giulietta', 'Mito', 'Stelvio', 'Tonale'],
  Audi: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  BMW: ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'X1', 'X3', 'X5', 'X6', 'i4', 'iX'],
  Buick: ['Encore', 'Enclave', 'Envista', 'LaCrosse', 'Regal'],
  Cadillac: ['ATS', 'CT4', 'CT5', 'CT6', 'Escalade', 'SRX', 'XT4', 'XT5', 'XT6'],
  Chevrolet: ['Aveo', 'Beat', 'Blazer', 'Camaro', 'Captiva', 'Cavalier', 'Cheyenne', 'Colorado', 'Cruze', 'Equinox', 'Groove', 'Malibu', 'Onix', 'S10', 'Silverado', 'Spark', 'Suburban', 'Tahoe', 'Tornado', 'Tracker', 'Traverse'],
  Chrysler: ['200', '300', 'Pacifica', 'PT Cruiser', 'Town & Country', 'Voyager'],
  Cupra: ['Ateca', 'Born', 'Formentor', 'León'],
  Dodge: ['Attitude', 'Challenger', 'Charger', 'Dart', 'Durango', 'Journey', 'Neon'],
  Fiat: ['500', 'Argo', 'Cronos', 'Mobi', 'Palio', 'Pulse', 'Strada', 'Uno'],
  Ford: ['Bronco', 'EcoSport', 'Edge', 'Escape', 'Expedition', 'F-150', 'Fiesta', 'Focus', 'Fusion', 'Lobo', 'Maverick', 'Mustang', 'Ranger', 'Territory'],
  GMC: ['Acadia', 'Canyon', 'Sierra', 'Terrain', 'Yukon'],
  Honda: ['Accord', 'BR-V', 'City', 'Civic', 'CR-V', 'Fit', 'HR-V', 'Odyssey', 'Pilot', 'WR-V'],
  Hyundai: ['Accent', 'Creta', 'Elantra', 'Grand i10', 'HB20', 'Ioniq', 'Santa Fe', 'Sonata', 'Starex', 'Tucson', 'Venue'],
  Infiniti: ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
  Isuzu: ['D-Max', 'ELF', 'MU-X'],
  JAC: ['E Sei4', 'Frison', 'J4', 'J7', 'SEI2', 'SEI3', 'SEI4 Pro', 'SEI6 Pro', 'X200'],
  Jeep: ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Liberty', 'Patriot', 'Renegade', 'Wrangler'],
  Kia: ['Carnival', 'Forte', 'K3', 'K4', 'Niro', 'Optima', 'Rio', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Telluride'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
  Lincoln: ['Aviator', 'Corsair', 'MKC', 'MKX', 'Nautilus', 'Navigator'],
  Mazda: ['BT-50', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-60', 'CX-9', 'CX-90', 'Mazda 2', 'Mazda 3', 'Mazda 6', 'MX-5'],
  'Mercedes-Benz': ['Clase A', 'Clase C', 'Clase CLA', 'Clase E', 'Clase GLA', 'Clase GLB', 'Clase GLC', 'Clase GLE', 'Clase GLS', 'Clase S', 'Sprinter'],
  MG: ['GT', 'HS', 'MG3', 'MG5', 'MG RX5', 'One', 'ZS'],
  Mini: ['Clubman', 'Cooper', 'Countryman', 'John Cooper Works'],
  Mitsubishi: ['ASX', 'Eclipse Cross', 'L200', 'Mirage', 'Montero', 'Outlander', 'Xpander'],
  Nissan: ['Altima', 'Aprio', 'Frontier', 'Kicks', 'March', 'Maxima', 'Murano', 'NP300', 'Pathfinder', 'Rogue', 'Sentra', 'TIIDA', 'Urvan', 'Versa', 'V-Drive', 'X-Trail'],
  Omoda: ['C5'],
  Peugeot: ['2008', '208', '3008', '301', '308', '5008', 'Partner', 'Rifter'],
  Porsche: ['911', 'Boxster', 'Cayenne', 'Cayman', 'Macan', 'Panamera', 'Taycan'],
  RAM: ['700', '1200', '1500', '2500', '4000', 'ProMaster'],
  Renault: ['Captur', 'Clio', 'Duster', 'Fluence', 'Kangoo', 'Koleos', 'Kwid', 'Logan', 'Oroch', 'Sandero', 'Stepway'],
  SEAT: ['Arona', 'Ateca', 'Ibiza', 'León', 'Tarraco', 'Toledo'],
  Subaru: ['BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'WRX', 'XV'],
  Suzuki: ['Across', 'Baleno', 'Celerio', 'Ertiga', 'Grand Vitara', 'Ignis', 'Jimny', 'S-Cross', 'Swift', 'Vitara'],
  Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y'],
  Toyota: ['4Runner', 'Avanza', 'Camry', 'Corolla', 'Hilux', 'Hiace', 'Highlander', 'Land Cruiser', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Yaris'],
  Volkswagen: ['Amarok', 'Bora', 'Caddy', 'Cross Sport', 'Gol', 'Golf', 'Jetta', 'Nivus', 'Passat', 'Polo', 'Saveiro', 'Taos', 'Teramont', 'T-Cross', 'Tiguan', 'Virtus', 'Vento'],
  Volvo: ['C40', 'S60', 'S90', 'XC40', 'XC60', 'XC90'],
};

const AUTOMOTIVE_COLORS = [
  'Blanco',
  'Negro',
  'Plata',
  'Gris',
  'Grafito',
  'Azul',
  'Rojo',
  'Verde',
  'Amarillo',
  'Naranja',
  'Café',
  'Beige',
  'Bronce',
  'Arena',
  'Champagne',
  'Perla',
  'Titanio',
  'Vino',
  'Morado',
  'Turquesa',
  'Otro',
];

const toOption = (value: string) => ({ label: value, value });
const normalizeText = (value: string) => value.toUpperCase().slice(0, 13);

export default function ClientesVehiculosPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const toast = useRef<Toast>(null);
  const dialogBaseZIndex = 2000;
  
  // Queries
  const { data: clientesData, isLoading: loadingClientes } = useQuery({ 
    queryKey: ['clientes'], 
    queryFn: () => getClientes(token!), 
    enabled: Boolean(token) 
  });
  
  const { data: vehiculosData } = useQuery({ 
    queryKey: ['vehiculos'], 
    queryFn: () => getVehiculos(token!), 
    enabled: Boolean(token) 
  });

  // State
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<any>(null);
  const [showCreateCliente, setShowCreateCliente] = useState(false);
  const [editCliente, setEditCliente] = useState<Cliente | null>(null);
  const [deleteClienteItem, setDeleteClienteItem] = useState<Cliente | null>(null);
  
  const [showCreateVehiculo, setShowCreateVehiculo] = useState<number | null>(null);
  const [editVehiculo, setEditVehiculo] = useState<Vehiculo | null>(null);
  const [deleteVehiculoItem, setDeleteVehiculoItem] = useState<Vehiculo | null>(null);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [customColor, setCustomColor] = useState('');
  
  const [historyVehiculo, setHistoryVehiculo] = useState<Vehiculo | null>(null);

  const { data: historial, isLoading: loadingHistorial } = useQuery({
    queryKey: ['vehiculo-historial', historyVehiculo?.id],
    queryFn: () => getVehiculoHistorial(token!, historyVehiculo!.id),
    enabled: Boolean(token && historyVehiculo),
  });

  // Mutations
  const createClienteMutation = useMutation({
    mutationFn: (data: any) => createCliente(token!, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['clientes'] }); 
      setShowCreateCliente(false);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente creado' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const updateClienteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCliente(token!, id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['clientes'] }); 
      setEditCliente(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const deleteClienteMutation = useMutation({
    mutationFn: (id: number) => deleteCliente(token!, id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['clientes'] }); 
      setDeleteClienteItem(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente eliminado' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const createVehiculoMutation = useMutation({
    mutationFn: (data: any) => createVehiculo(token!, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['vehiculos'] }); 
      setShowCreateVehiculo(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Vehículo agregado' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const updateVehiculoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateVehiculo(token!, id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['vehiculos'] }); 
      setEditVehiculo(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Vehículo actualizado' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const deleteVehiculoMutation = useMutation({
    mutationFn: (id: number) => deleteVehiculo(token!, id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['vehiculos'] }); 
      setDeleteVehiculoItem(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Vehículo eliminado' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  // Filtering
  const filteredClientes = (clientesData?.results ?? []).filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.telefono ?? '').includes(search)
  );

  const getVehiculosByCliente = (clienteId: number) => 
    (vehiculosData?.results ?? []).filter(v => v.cliente === clienteId);

  useEffect(() => {
    if (editVehiculo) {
      setSelectedMarca(editVehiculo.marca ?? '');
      setSelectedModelo(editVehiculo.modelo ?? '');
      const existingColor = editVehiculo.color ?? '';
      const matchedColor = AUTOMOTIVE_COLORS.find(
        (color) => color.toLowerCase() === existingColor.toLowerCase(),
      );
      setSelectedColor(matchedColor ?? (existingColor ? 'Otro' : ''));
      setCustomColor(matchedColor ? '' : existingColor);
      return;
    }

    if (showCreateVehiculo !== null) {
      setSelectedMarca('');
      setSelectedModelo('');
      setSelectedColor('');
      setCustomColor('');
    }
  }, [editVehiculo, showCreateVehiculo]);

  const marcaOptions = Object.keys(VEHICLE_CATALOG).map(toOption);
  const currentMarcaExists = editVehiculo?.marca && VEHICLE_CATALOG[editVehiculo.marca];
  const mergedMarcaOptions = currentMarcaExists
    ? marcaOptions
    : editVehiculo?.marca
      ? [...marcaOptions, toOption(editVehiculo.marca)]
      : marcaOptions;

  const modelOptionsBase = selectedMarca ? VEHICLE_CATALOG[selectedMarca] ?? [] : [];
  const modelOptions = editVehiculo?.modelo && !modelOptionsBase.includes(editVehiculo.modelo)
    ? [...modelOptionsBase, editVehiculo.modelo].map(toOption)
    : modelOptionsBase.map(toOption);
  const colorOptions = AUTOMOTIVE_COLORS.map(toOption);

  // Templates
  const actionBodyTemplate = (rowData: Cliente) => (
    <div className="flex gap-2 justify-center">
      <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => setEditCliente(rowData)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setDeleteClienteItem(rowData)} />
    </div>
  );

  const rowExpansionTemplate = (data: Cliente) => {
    const vels = getVehiculosByCliente(data.id);
    const isAdding = showCreateVehiculo === data.id;
    const isEditing = editVehiculo !== null && editVehiculo.cliente === data.id;
    const showForm = isAdding || isEditing;

    return (
      <div className="p-10 bg-slate-50/50 rounded-[3rem] m-6 border border-slate-100 shadow-inner">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Car className="w-5 h-5" />
            </div>
            Vehículos de {data.nombre}
          </h4>
          {!showForm && (
            <Button 
              label="Vincular Vehículo" 
              icon={<Plus className="w-4 h-4 mr-2" />} 
              onClick={() => {
                setEditVehiculo(null);
                setShowCreateVehiculo(data.id);
              }}
              className="p-button-outlined p-button-sm rounded-xl font-bold border-2"
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List panel */}
          <div className={showForm ? "lg:col-span-6 xl:col-span-7 space-y-6" : "lg:col-span-12"}>
            <div className={showForm ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
              {vels.map((v: any) => (
                <div key={v.id} className="group bg-white p-6 rounded-[2rem] shadow-md hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full translate-x-8 translate-y-[-8] group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl text-sm border border-blue-100">
                        {v.placas}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => {
                          setEditVehiculo(v);
                          setShowCreateVehiculo(null);
                        }} />
                        <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setDeleteVehiculoItem(v)} />
                      </div>
                    </div>
                    
                    <h5 className="text-xl font-black text-slate-900 mb-1">{v.marca} {v.modelo}</h5>
                    <div className="flex flex-col gap-1 text-sm text-slate-500 font-bold">
                      <span className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-300 rounded-full" /> Año: {v.anio || 'N/A'}</span>
                      <span className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-300 rounded-full" /> Color: {v.color || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {vels.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <Car className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Este cliente no tiene vehículos registrados</p>
                </div>
              )}
            </div>
          </div>

          {/* Form panel */}
          {showForm && (
            <div className="lg:col-span-6 xl:col-span-5 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                  <Car className="w-5 h-5" />
                </div>
                {isEditing ? `Editar Vehículo: ${editVehiculo?.placas}` : "Nuevo Vehículo"}
              </h4>

              <form
                key={editVehiculo ? editVehiculo.id : 'new'}
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const colorFinal = selectedColor === 'Otro' ? customColor.trim() : selectedColor;
                  const dataSubmit = {
                    marca: selectedMarca,
                    modelo: selectedModelo,
                    anio: Number(fd.get('anio')),
                    placas: String(fd.get('placas') || '').toUpperCase(),
                    color: colorFinal,
                    kilometrajeActual: fd.get('kilometrajeActual') ? Number(fd.get('kilometrajeActual')) : '',
                    tipo_motor: fd.get('tipo_motor'),
                    kilometraje_actual: Number(fd.get('kilometraje_actual')),
                    unidad_luces: (e.currentTarget.elements.namedItem('unidad_luces') as HTMLInputElement).checked,
                    cuarto_luces: (e.currentTarget.elements.namedItem('cuarto_luces') as HTMLInputElement).checked,
                    antena: (e.currentTarget.elements.namedItem('antena') as HTMLInputElement).checked,
                    espejo_lateral: (e.currentTarget.elements.namedItem('espejo_lateral') as HTMLInputElement).checked,
                    cristales: (e.currentTarget.elements.namedItem('cristales') as HTMLInputElement).checked,
                    emblema: (e.currentTarget.elements.namedItem('emblema') as HTMLInputElement).checked,
                    rines: Number(fd.get('rines')),
                    tapon_gasolina: (e.currentTarget.elements.namedItem('tapon_gasolina') as HTMLInputElement).checked,
                    carroceria_sin_golpes: (e.currentTarget.elements.namedItem('carroceria_sin_golpes') as HTMLInputElement).checked,
                    gato: (e.currentTarget.elements.namedItem('gato') as HTMLInputElement).checked,
                    bocina_claxon: (e.currentTarget.elements.namedItem('bocina_claxon') as HTMLInputElement).checked,
                    limpiaparabrisas: (e.currentTarget.elements.namedItem('limpiaparabrisas') as HTMLInputElement).checked,
                    llave_rueda: (e.currentTarget.elements.namedItem('llave_rueda') as HTMLInputElement).checked,
                    llanta_repuesto: (e.currentTarget.elements.namedItem('llanta_repuesto') as HTMLInputElement).checked,
                    gasolina_aprox: Number(fd.get('gasolina_aprox')),
                    observaciones: fd.get('observaciones'),
                  };

                  const anioVal = Number(fd.get('anio'));
                  const placasVal = String(fd.get('placas') || '').trim().toUpperCase();

                  if (!selectedMarca || !selectedModelo || !colorFinal) {
                    toast.current?.show({
                      severity: 'warn',
                      summary: 'Datos incompletos',
                      detail: 'Selecciona marca, modelo y color para registrar el vehículo.',
                    });
                    return;
                  }

                  if (isNaN(anioVal) || anioVal < 1900 || anioVal > 2100) {
                    toast.current?.show({
                      severity: 'warn',
                      summary: 'Año inválido',
                      detail: 'El año del vehículo debe estar entre 1900 y 2100.',
                    });
                    return;
                  }

                  if (!placasVal) {
                    toast.current?.show({
                      severity: 'warn',
                      summary: 'Placas requeridas',
                      detail: 'Por favor ingresa las placas del vehículo.',
                    });
                    return;
                  }

                  const whitelistedData = {
                    marca: selectedMarca,
                    modelo: selectedModelo,
                    anio: anioVal,
                    placas: placasVal,
                    color: colorFinal,
                    kilometrajeActual: fd.get('kilometrajeActual') ? Number(fd.get('kilometrajeActual')) : undefined,
                    notas: String(fd.get('observaciones') || '').trim(),
                  };

                  if (editVehiculo) {
                    updateVehiculoMutation.mutate({ id: editVehiculo.id, data: whitelistedData });
                  } else {
                    createVehiculoMutation.mutate({ ...whitelistedData, clienteId: data.id });
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Marca *</label>
                    <select
                      value={selectedMarca}
                      onChange={(e) => {
                        setSelectedMarca(e.target.value);
                        setSelectedModelo('');
                      }}
                      className="refa-native-select rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-emerald-500/20 transition-all p-3"
                    >
                      <option value="" disabled>Seleccionar marca...</option>
                      {mergedMarcaOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Modelo *</label>
                    <select
                      value={selectedModelo}
                      onChange={(e) => setSelectedModelo(e.target.value)}
                      disabled={!selectedMarca}
                      className="refa-native-select rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-emerald-500/20 transition-all p-3"
                    >
                      <option value="" disabled>{selectedMarca ? 'Seleccionar modelo...' : 'Marca primero'}</option>
                      {modelOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Año *</label>
                    <InputText name="anio" type="number" defaultValue={editVehiculo?.anio?.toString()} required className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-emerald-500/20 transition-all py-3" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Placas *</label>
                    <InputText name="placas" defaultValue={editVehiculo?.placas} required className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-emerald-500/20 transition-all py-3 uppercase" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Color</label>
                    <select
                      value={selectedColor}
                      onChange={(e) => {
                        setSelectedColor(e.target.value);
                        if (e.target.value !== 'Otro') {
                          setCustomColor('');
                        }
                      }}
                      className="refa-native-select rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-emerald-500/20 transition-all p-3"
                    >
                      <option value="" disabled>Seleccionar color...</option>
                      {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Kilometraje</label>
                    <InputText name="kilometrajeActual" type="number" defaultValue={editVehiculo?.kilometraje_actual?.toString()} className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-emerald-500/20 transition-all py-3" />
                  </div>
                </div>

                {selectedColor === 'Otro' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Especificar Color *</label>
                    <InputText value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-emerald-500/20 transition-all py-3" placeholder="Ej. Azul eléctrico" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Tipo Motor (cil)</label>
                    <InputText name="tipo_motor" defaultValue={(editVehiculo as any)?.tipo_motor} className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-emerald-500/20 transition-all py-3" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Km Recorridos</label>
                    <InputNumber name="kilometraje_actual" value={(editVehiculo as any)?.kilometraje_actual} mode="decimal" className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-emerald-500/20 transition-all" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h5 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Inventario y Accesorios</h5>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div className="flex items-center">
                      <input type="checkbox" id="unidad_luces" name="unidad_luces" defaultChecked={(editVehiculo as any)?.unidad_luces} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="unidad_luces" className="text-xs font-bold text-slate-700">Unidad de Luces</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="cuarto_luces" name="cuarto_luces" defaultChecked={(editVehiculo as any)?.cuarto_luces} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="cuarto_luces" className="text-xs font-bold text-slate-700">1/4 de Luces</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="antena" name="antena" defaultChecked={(editVehiculo as any)?.antena} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="antena" className="text-xs font-bold text-slate-700">Antena</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="espejo_lateral" name="espejo_lateral" defaultChecked={(editVehiculo as any)?.espejo_lateral} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="espejo_lateral" className="text-xs font-bold text-slate-700">Espejo Lateral</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="cristales" name="cristales" defaultChecked={(editVehiculo as any)?.cristales} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="cristales" className="text-xs font-bold text-slate-700">Cristales</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="emblema" name="emblema" defaultChecked={(editVehiculo as any)?.emblema} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="emblema" className="text-xs font-bold text-slate-700">Emblema</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="tapon_gasolina" name="tapon_gasolina" defaultChecked={(editVehiculo as any)?.tapon_gasolina} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="tapon_gasolina" className="text-xs font-bold text-slate-700">Tapón de Gasolina</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="carroceria_sin_golpes" name="carroceria_sin_golpes" defaultChecked={(editVehiculo as any)?.carroceria_sin_golpes} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="carroceria_sin_golpes" className="text-xs font-bold text-slate-700">Carrocería sin Golpes</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="gato" name="gato" defaultChecked={(editVehiculo as any)?.gato} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="gato" className="text-xs font-bold text-slate-700">Gato</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="bocina_claxon" name="bocina_claxon" defaultChecked={(editVehiculo as any)?.bocina_claxon} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="bocina_claxon" className="text-xs font-bold text-slate-700">Bocina/Claxon</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="limpiaparabrisas" name="limpiaparabrisas" defaultChecked={(editVehiculo as any)?.limpiaparabrisas} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="limpiaparabrisas" className="text-xs font-bold text-slate-700">Limpiaparabrisas</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="llave_rueda" name="llave_rueda" defaultChecked={(editVehiculo as any)?.llave_rueda} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="llave_rueda" className="text-xs font-bold text-slate-700">Llave de Rueda</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="llanta_repuesto" name="llanta_repuesto" defaultChecked={(editVehiculo as any)?.llanta_repuesto} className="rounded border-slate-200 text-emerald-600 focus:ring-emerald-500/20 mr-2" />
                      <label htmlFor="llanta_repuesto" className="text-xs font-bold text-slate-700">Llanta de Repuesto</label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Rines</label>
                    <InputNumber name="rines" value={(editVehiculo as any)?.rines || 4} mode="decimal" className="rounded-2xl border-slate-200 bg-white/80" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Gasolina (%)</label>
                    <InputNumber name="gasolina_aprox" value={(editVehiculo as any)?.gasolina_aprox} mode="decimal" min={0} max={100} className="rounded-2xl border-slate-200 bg-white/80" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Observaciones</label>
                  <textarea name="observaciones" defaultValue={(editVehiculo as any)?.observaciones} className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-slate-800 focus:ring-4 focus:ring-emerald-500/20 transition-all outline-none" rows={3} />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <Button label="Cancelar" type="button" text className="font-bold rounded-2xl px-6 py-2.5 hover:bg-slate-100 transition-all text-sm" onClick={() => { setShowCreateVehiculo(null); setEditVehiculo(null); setSelectedMarca(''); setSelectedModelo(''); setSelectedColor(''); setCustomColor(''); }} />
                  <Button label={editVehiculo ? "Actualizar" : "Guardar"} type="submit" loading={createVehiculoMutation.isPending || updateVehiculoMutation.isPending} className="font-black rounded-2xl px-8 py-2.5 shadow-3d shadow-emerald-600/30 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-none transition-all active:scale-95 text-sm" />
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <Toast ref={toast} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
            <div className="p-4 bg-gradient-3d rounded-2xl shadow-3d shadow-blue-600/30 ring-4 ring-white/10">
              <Users className="w-8 h-8 text-white" />
            </div>
            Directorio de Clientes
          </h2>
          <p className="text-slate-500 mt-2 font-medium text-lg ml-1">Administración centralizada de propietarios y flota vehicular.</p>
        </div>
        <Button 
          label="Nuevo Cliente" 
          icon={<Plus className="w-5 h-5 mr-2" />} 
          onClick={() => setShowCreateCliente(true)} 
          className="p-button-raised p-button-primary rounded-2xl shadow-3d shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 border-none px-8 py-4 font-black transition-all active:scale-95" 
        />
      </div>

      <div className="card bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-3d border border-slate-100 overflow-hidden transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
        <div className="p-8 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-transparent">
          <div className="refa-search-shell max-w-2xl">
            <Search className="refa-search-icon" />
            <InputText 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Buscar cliente por nombre, email o teléfono..." 
              className="refa-search-input rounded-[2rem] border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
            />
          </div>
        </div>

        <DataTable 
          value={filteredClientes} 
          loading={loadingClientes}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="id"
          className="p-datatable-modern"
          emptyMessage={
            <div className="py-24 text-center flex flex-col items-center gap-4">
              <div className="p-8 bg-slate-50 rounded-full">
                <Users className="w-16 h-16 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">No se encontraron clientes en el directorio</p>
            </div>
          }
          rows={10}
          paginator
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}"
          rowHover
        >
          <Column expander style={{ width: '4rem' }} className="px-6" />
          <Column field="nombre" header="Nombre del Propietario" sortable body={(c) => (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <User className="w-5 h-5" />
              </div>
              <span className="font-black text-slate-800 text-lg tracking-tight">{c.nombre}</span>
            </div>
          )} className="px-6 py-6" />
          <Column field="telefono" header="Contacto" body={(c) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-slate-600 font-bold">
                <Phone className="w-3 h-3 text-slate-300" />
                {c.telefono || <span className="text-slate-300 italic">Sin teléfono</span>}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <Mail className="w-3 h-3 text-slate-300" />
                {c.email || <span className="text-slate-300 italic">Sin correo</span>}
              </div>
            </div>
          )} className="px-6 py-6" />
          <Column header="Acciones" body={actionBodyTemplate} style={{ width: '10rem' }} className="px-6 py-6" />
        </DataTable>
      </div>

      {/* Modals */}
      <Dialog 
        header={editCliente ? "Editar Cliente" : "Nuevo Cliente"} 
        visible={showCreateCliente || !!editCliente} 
        style={{ width: '450px' }} 
        onHide={() => { setShowCreateCliente(false); setEditCliente(null); }}
        className="rounded-[3rem] shadow-3d border border-slate-200 overflow-hidden"
        headerClassName="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 border-b border-blue-800/30"
        contentClassName="bg-gradient-to-b from-white to-slate-50/80 p-8"
        baseZIndex={dialogBaseZIndex}
      >
        <form className="grid grid-cols-1 gap-6 pt-2" onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const rawData = Object.fromEntries(fd);
          if (typeof rawData.rfc === 'string') {
            rawData.rfc = normalizeText(rawData.rfc);
          }
          
          // Omitir el campo 'ciudad' ya que no forma parte del esquema DTO ni de la base de datos
          const { ciudad, ...data } = rawData;

          if (editCliente) updateClienteMutation.mutate({ id: editCliente.id, data });
          else createClienteMutation.mutate(data);
        }}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Nombre Completo *</label>
            <InputText name="nombre" defaultValue={editCliente?.nombre} required className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-blue-500/20 transition-all py-4" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Teléfono</label>
              <InputText name="telefono" defaultValue={editCliente?.telefono} className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-blue-500/20 transition-all py-4" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Email</label>
              <InputText name="email" defaultValue={editCliente?.email} className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-blue-500/20 transition-all py-4" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest">RFC</label>
            <InputText
              name="rfc"
              defaultValue={editCliente?.rfc}
              maxLength={13}
              className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-blue-500/20 transition-all py-4 uppercase"
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = normalizeText(target.value);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Dirección</label>
            <InputText name="direccion" defaultValue={editCliente?.direccion} className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-blue-500/20 transition-all py-4" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest">Ciudad</label>
            <InputText name="ciudad" defaultValue={editCliente?.ciudad} className="rounded-2xl border-slate-200 bg-white/80 shadow-inner focus:ring-4 focus:ring-blue-500/20 transition-all py-4" />
          </div>
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
            <Button label="Cancelar" type="button" text className="font-bold rounded-2xl px-8 py-3 hover:bg-slate-100 transition-all" onClick={() => { setShowCreateCliente(false); setEditCliente(null); }} />
            <Button label={editCliente ? "Actualizar" : "Guardar"} type="submit" loading={createClienteMutation.isPending || updateClienteMutation.isPending} className="font-black rounded-2xl px-10 py-3 shadow-3d shadow-blue-600/30 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none transition-all active:scale-95" />
          </div>
        </form>
      </Dialog>


        
    

      {/* Historial Modal */}
      <Dialog 
        header={`Historial: ${historyVehiculo?.marca} ${historyVehiculo?.modelo}`} 
        visible={!!historyVehiculo} 
        style={{ width: '600px' }} 
        onHide={() => setHistoryVehiculo(null)}
        baseZIndex={dialogBaseZIndex}
      >
        <div className="space-y-4 pt-4">
          {loadingHistorial ? (
            <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
          ) : !historial?.length ? (
            <div className="text-center py-8 text-slate-400">Sin registros de reparaciones</div>
          ) : (
            <div className="space-y-4">
              {historial.map((ot: any) => (
                <div key={ot.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <Tag value={ot.folio} severity="info" />
                    <Tag value={ot.estado.toUpperCase()} severity={ot.estado === 'entregado' ? 'success' : 'warning'} />
                  </div>
                  <div className="text-xs font-bold text-slate-500">{new Date(ot.fecha_ingreso).toLocaleDateString()}</div>
                  <div className="text-sm font-bold text-slate-800">{ot.queja_cliente}</div>
                  <div className="text-sm text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100">
                    {ot.diagnostico || 'Pendiente de diagnóstico'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog 
        header="Confirmar eliminación" 
        visible={!!deleteClienteItem || !!deleteVehiculoItem} 
        style={{ width: '350px' }} 
        onHide={() => { setDeleteClienteItem(null); setDeleteVehiculoItem(null); }}
        baseZIndex={dialogBaseZIndex}
        footer={
          <div className="flex justify-end gap-2">
            <Button label="No" text onClick={() => { setDeleteClienteItem(null); setDeleteVehiculoItem(null); }} />
            <Button label="Sí, eliminar" severity="danger" onClick={() => {
              if (deleteClienteItem) deleteClienteMutation.mutate(deleteClienteItem.id);
              if (deleteVehiculoItem) deleteVehiculoMutation.mutate(deleteVehiculoItem.id);
            }} />
          </div>
        }
      >
        <p className="text-sm text-slate-600">¿Estás seguro de que deseas eliminar este registro? Esta acción es irreversible.</p>
      </Dialog>
    </div>
  );
}
