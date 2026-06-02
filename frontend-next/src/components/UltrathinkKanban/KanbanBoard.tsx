
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getBoards, createBoard, createColumn, createCard, moveCard } from '@/lib/api/kanban';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import styles from './KanbanBoard.module.css';

interface Card {
  id: number;
  titulo: string;
  descripcion?: string;
  order: number;
}

interface Column {
  id: number;
  titulo: string;
  order: number;
  tarjetas: Card[];
}

interface Board {
  id: number;
  titulo: string;
  columnas: Column[];
}

export const KanbanBoard: React.FC = () => {
  const { user } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    if (user?.id) {
      getBoards(user.id).then((boards) => {
        if (boards.length) setBoard(boards[0]);
        else {
          // crear board por defecto
          createBoard({ title: 'Tablero Taller' }, user.id).then((b) => setBoard(b));
        }
      });
    }
  }, [user]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const sourceColId = Number(source.droppableId);
    const destColId = Number(destination.droppableId);
    const cardId = Number(draggableId);

    // actualizar backend
    await moveCard(cardId, destColId, destination.index);
    // refrescar board
    if (user?.id) {
      const refreshed = await getBoards(user.id);
      setBoard(refreshed[0]);
    }
  };

  if (!board) return <div className={styles.loading}>Cargando tablero...</div>;

  return (
    <div className={styles.boardContainer}>
      <h2 className={styles.boardTitle}>{board.titulo}</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.columnsWrapper}>
          {board.columnas
            .sort((a, b) => a.order - b.order)
            .map((col) => (
              <Droppable droppableId={col.id.toString()} key={col.id}>
                {(provided) => (
                  <div
                    className={styles.column}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h3 className={styles.columnTitle}>{col.titulo}</h3>
                    <div className={styles.cards}>
                      {col.tarjetas
                        .sort((a, b) => a.order - b.order)
                        .map((card, idx) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id.toString()}
                            index={idx}
                          >
                            {(provided) => (
                              <div
                                className={styles.card}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <strong>{card.titulo}</strong>
                                {card.descripcion && (
                                  <p className={styles.cardDesc}>
                                    {card.descripcion}
                                  </p>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
        </div>
      </DragDropContext>
    </div>
  );
};
