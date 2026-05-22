'use client';
import { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Wrench, ClipboardList, Calculator } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import OrdenesPage from '../ordenes/page';
import PresupuestosPage from '../presupuestos/page';

export default function TallerPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabHeader = (label: string, Icon: LucideIcon) => (
    <div className="flex items-center gap-2 px-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
          <div className="p-4 bg-gradient-3d rounded-2xl shadow-3d shadow-blue-600/30 ring-4 ring-white/10">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          Módulo de Taller
        </h2>
        <p className="text-slate-500 font-medium text-lg ml-1">Centro operativo para diagnóstico, órdenes de trabajo y presupuestos del taller.</p>
      </div>

      <div className="card shadow-3d rounded-[3rem] overflow-hidden border border-slate-100 bg-white/90 backdrop-blur-xl">
        <TabView 
          activeIndex={activeIndex} 
          onTabChange={(e) => setActiveIndex(e.index)}
          panelContainerClassName="p-10"
          className="p-tabview-modern"
        >
          <TabPanel header={tabHeader('Órdenes de Trabajo', ClipboardList)}>
            <OrdenesPage hideHeader />
          </TabPanel>
          <TabPanel header={tabHeader('Presupuestos', Calculator)}>
            <PresupuestosPage hideHeader />
          </TabPanel>
        </TabView>
      </div>

    </div>
  );
}
