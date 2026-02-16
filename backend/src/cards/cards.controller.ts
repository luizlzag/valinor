import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CardsService } from './cards.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() body: { title: string; content?: string; columnId: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.cardsService.create(body, user.id);
  }

  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  @Get('column/:columnId')
  findByColumn(@Param('columnId') columnId: string) {
    return this.cardsService.findByColumn(columnId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string; columnId?: string },
  ) {
    return this.cardsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.cardsService.remove(id);
  }
}
  