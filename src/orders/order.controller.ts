import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type OrderStatus = 'pending' | 'preparing' | 'out_for_delivery' | 'completed' | 'cancelled';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.orderService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.orderService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body()
    body: {
      user_id: number;
      address_id?: number;
      order_status?: OrderStatus;
      total_amount: number;
    },
  ) {
    return this.orderService.createOrder(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      user_id?: number;
      address_id?: number;
      order_status?: OrderStatus;
      total_amount?: number;
    },
  ) {
    return this.orderService.updateOrder(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.orderService.deleteOrder(+id);
  }
}