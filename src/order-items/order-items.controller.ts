import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrderItemService } from './order-items.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('order-items')
export class OrderItemController {
  constructor(private orderItemService: OrderItemService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.orderItemService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.orderItemService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body()
    body: {
      order_id: number;
      product_id: number;
      quantity: number;
      unit_price: number;
    },
  ) {
    return this.orderItemService.createOrderItem(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      order_id?: number;
      product_id?: number;
      quantity?: number;
      unit_price?: number;
    },
  ) {
    return this.orderItemService.updateOrderItem(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.orderItemService.deleteOrderItem(+id);
  }
}