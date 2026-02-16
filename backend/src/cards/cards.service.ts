import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  async create(
    data: { title: string; content?: string; columnId: string },
    userId: string,
  ) {
    const columnExists = await this.prisma.column.findUnique({
      where: { id: data.columnId },
    });
    if (!columnExists) {
      throw new BadRequestException(
        `Coluna com id "${data.columnId}" não encontrada. Crie a coluna antes de adicionar cards.`,
      );
    }
    try {
      const card = await this.prisma.card.create({
        data: { ...data, createdById: userId },
        include: { createdBy: true, column: true },
      });
      this.events.broadcast('card:created', card);
      return card;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Coluna inválida. Verifique se o columnId existe.',
          );
        }
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.card.findMany({
      include: {
        column: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  findByColumn(columnId: string) {
    return this.prisma.card.findMany({
      where: { columnId },
      include: { createdBy: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.card.findUnique({
      where: { id },
      include: { createdBy: true },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      columnId?: string;
    },
  ) {
    if (data.columnId) {
      const columnExists = await this.prisma.column.findUnique({
        where: { id: data.columnId },
      });
      if (!columnExists) {
        throw new BadRequestException(
          `Coluna com id "${data.columnId}" não encontrada.`,
        );
      }
    }
    const card = await this.prisma.card.update({
      where: { id },
      data,
      include: { createdBy: true, column: true },
    });
    this.events.broadcast('card:updated', card);
    return card;
  }

  async remove(id: string) {
    const card = await this.prisma.card.delete({
      where: { id },
      include: { createdBy: true, column: true },
    });
    this.events.broadcast('card:deleted', card);
    return card;
  }
}
