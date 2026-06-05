import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({
      select: { id: true, username: true, email: true, rol: true, activo: true },
      orderBy: { username: 'asc' },
    });
  }

  async create(dto: CreateUserDto) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const email = dto.email ?? `${dto.username}@example.com`;
    const user = await this.prisma.usuario.create({
      data: {
        username: dto.username,
        email,
        passwordHash,
        rol: dto.rol,
        activo: dto.activo ?? true,
      },
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      rol: user.rol,
      activo: user.activo,
    };
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: any = { ...dto };
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.passwordHash = await bcrypt.hash(data.password, salt);
      delete data.password;
    }

    const user = await this.prisma.usuario.update({
      where: { id },
      data,
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      rol: user.rol,
      activo: user.activo,
    };
  }

  async remove(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
