import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({
      select: { id: true, username: true, email: true, rol: true, activo: true },
      orderBy: { username: 'asc' },
    });
  }
}
