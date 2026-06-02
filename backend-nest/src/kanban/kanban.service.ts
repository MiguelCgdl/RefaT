import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KanbanBoard, KanbanColumn, KanbanCard } from '@prisma/client';

@Injectable()
export class KanbanService {
  constructor(private readonly prisma: PrismaService) {}

  // Board CRUD
  async createBoard(title: string, userId: number): Promise<KanbanBoard> {
    return this.prisma.kanbanBoard.create({
      data: { titulo: title, creadorId: userId },
    });
  }

  async getBoards(userId: number) {
    return this.prisma.kanbanBoard.findMany({
      where: { creadorId: userId },
      include: {
        columnas: {
          include: { tarjetas: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

  async getBoard(id: number) {
    return this.prisma.kanbanBoard.findUniqueOrThrow({
      where: { id },
      include: {
        columnas: {
          include: { tarjetas: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

    async updateBoard(id: number, title?: string): Promise<KanbanBoard> {
      return this.prisma.kanbanBoard.update({
        where: { id },
        data: { titulo: title },
      });
    }

  async deleteBoard(id: number): Promise<KanbanBoard> {
    return this.prisma.kanbanBoard.delete({ where: { id } });
  }

  // Column CRUD
    async createColumn(boardId: number, title: string): Promise<KanbanColumn> {
      return this.prisma.kanbanColumn.create({
        data: { boardId, titulo: title },
      });
    }

    async updateColumn(id: number, title?: string): Promise<KanbanColumn> {
      return this.prisma.kanbanColumn.update({ where: { id }, data: { titulo: title } });
    }

  async deleteColumn(id: number): Promise<KanbanColumn> {
    return this.prisma.kanbanColumn.delete({ where: { id } });
  }

  // Card CRUD
  async createCard(columnId: number, title: string, description?: string): Promise<KanbanCard> {
    return this.prisma.kanbanCard.create({
      data: { columnaId: columnId, titulo: title, descripcion: description },
    });
  }

  async updateCard(id: number, data: { title?: string; description?: string; order?: number }): Promise<KanbanCard> {
    return this.prisma.kanbanCard.update({ where: { id }, data: {
      titulo: data.title,
      descripcion: data.description,
      orden: data.order
    } });
  }

  async deleteCard(id: number): Promise<KanbanCard> {
    return this.prisma.kanbanCard.delete({ where: { id } });
  }
}
