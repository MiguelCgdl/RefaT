'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getBoards, createBoard, createColumn, createCard, updateCard, deleteCard } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, GripVertical, Trash2, Layout } from 'lucide-react';
import { Card } from 'primereact/card';

export default function KanbanPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [boardId, setBoardId] = useState<number | null>(null);

  // Drag state
  const [draggingCard, setDraggingCard] = useState<any>(null);

  const { data: boards, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: () => getBoards(token!),
    enabled: !!token,
  });

  const activeBoard = boards?.find((b: any) => b.id === boardId) || boards?.[0];

  useEffect(() => {
    if (boards && boards.length > 0 && !boardId) {
      setBoardId(boards[0].id);
    }
  }, [boards, boardId]);

  // Mutations
  const createBoardMut = useMutation({
    mutationFn: (title: string) => createBoard(token!, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  const createColMut = useMutation({
    mutationFn: (data: { boardId: number; title: string }) => createColumn(token!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  const createCardMut = useMutation({
    mutationFn: (data: { columnId: number; title: string; description?: string }) => createCard(token!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  const updateCardMut = useMutation({
    mutationFn: (data: { id: number; title?: string; order?: number; columnId?: number }) => 
      updateCard(token!, data.id, { columnId: data.columnId, order: data.order }),
    // Optimistic or invalidate
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  const deleteCardMut = useMutation({
    mutationFn: (id: number) => deleteCard(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, card: any) => {
    setDraggingCard(card);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to hide the dragged element on the original spot (optional UX trick)
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    setDraggingCard(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: number) => {
    e.preventDefault();
    if (!draggingCard || draggingCard.columnaId === targetColumnId) return;

    // Call update API
    updateCardMut.mutate({
      id: draggingCard.id,
      columnId: targetColumnId,
    });
  };

  const handleAddBoard = () => {
    const title = prompt('Nombre del nuevo tablero:');
    if (title) createBoardMut.mutate(title);
  };

  const handleAddColumn = () => {
    if (!activeBoard) return;
    const title = prompt('Nombre de la nueva columna:');
    if (title) createColMut.mutate({ boardId: activeBoard.id, title });
  };

  const handleAddCard = (columnId: number) => {
    const title = prompt('Título de la tarea:');
    if (title) createCardMut.mutate({ columnId, title });
  };

  if (isLoading) {
    return <div className="p-8 text-slate-500">Cargando tablero...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-4 sm:p-6 overflow-hidden bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-gradient-3d rounded-2xl shadow-3d shadow-indigo-600/30">
              <Layout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Tablero Kanban
          </h1>
          <p className="text-slate-500 font-medium text-sm ml-1 mt-1">
            Organiza las tareas del taller arrastrando y soltando las tarjetas.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {boards?.map((b: any) => (
            <button
              key={b.id}
              onClick={() => setBoardId(b.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                b.id === activeBoard?.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {b.titulo}
            </button>
          ))}
          <button
            onClick={handleAddBoard}
            className="px-4 py-2 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        </div>
      </div>

      {/* Board Area */}
      {!activeBoard ? (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem]">
          <p className="text-slate-400 font-medium text-center">
            No hay tableros. Crea uno para empezar.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x">
          {activeBoard.columnas?.map((col: any) => (
            <div
              key={col.id}
              className="flex-shrink-0 w-80 max-w-[85vw] flex flex-col bg-slate-100/60 rounded-[1.5rem] border border-slate-200 snap-center"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-200/50 bg-slate-100 rounded-t-[1.5rem]">
                <h3 className="font-bold text-slate-800 tracking-tight">{col.titulo}</h3>
                <span className="bg-white text-slate-500 text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                  {col.tarjetas?.length || 0}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px]">
                {col.tarjetas?.map((card: any) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                    onDragEnd={handleDragEnd}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-700 text-sm">{card.titulo}</p>
                      <button
                        onClick={() => deleteCardMut.mutate(card.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {card.descripcion && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{card.descripcion}</p>
                    )}
                    <div className="mt-3 pt-2 border-t border-slate-50 flex items-center gap-2">
                       <GripVertical className="w-3 h-3 text-slate-300" />
                       <span className="text-[10px] font-bold text-slate-300 uppercase">Arrastrar</span>
                    </div>
                  </div>
                ))}
                
                {/* Add Card Button */}
                <button
                  onClick={() => handleAddCard(col.id)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-slate-400 font-bold text-sm bg-transparent hover:bg-slate-200/50 rounded-xl transition-colors border border-dashed border-transparent hover:border-slate-300"
                >
                  <Plus className="w-4 h-4" /> Añadir Tarjeta
                </button>
              </div>
            </div>
          ))}

          {/* Add Column Button */}
          <div className="flex-shrink-0 w-80 flex flex-col snap-center">
            <button
              onClick={handleAddColumn}
              className="flex items-center justify-center gap-2 p-4 bg-white/50 border-2 border-dashed border-slate-300 rounded-[1.5rem] text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all h-full min-h-[150px]"
            >
              <Plus className="w-5 h-5" /> Añadir Columna
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
