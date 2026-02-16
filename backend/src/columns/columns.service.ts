import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ColumnsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  async create(data: { name: string; order?: number }, userId: string) {
    const column = await this.prisma.column.create({
      data: {
        name: data.name,
        order: data.order ?? 0,
        createdById: userId,
      },
      include: { createdBy: true, cards: { include: { createdBy: true } } },
    });
    this.events.broadcast('column:created', column);
    return column;
  }

  findAll() {
    return this.prisma.column.findMany({
      include: {
        cards: { include: { createdBy: true } },
        createdBy: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: { cards: { include: { createdBy: true } }, createdBy: true },
    });
    if (!column) {
      throw new NotFoundException(`Coluna com id "${id}" não encontrada.`);
    }
    return column;
  }

  async update(id: string, data: { name?: string; order?: number }) {
    await this.findOne(id);
    const column = await this.prisma.column.update({
      where: { id },
      data,
      include: { createdBy: true, cards: { include: { createdBy: true } } },
    });
    this.events.broadcast('column:updated', column);
    return column;
  }

  async remove(id: string) {
    const column = await this.findOne(id);
    await this.prisma.column.delete({
      where: { id },
    });
    this.events.broadcast('column:deleted', column);
    return column;
  }
}
