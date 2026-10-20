import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentService, PaymentMethod, PaymentStatus } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.paymentService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.paymentService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body()
    body: {
      order_id: number;
      payment_method: PaymentMethod;
      payment_status?: PaymentStatus;
      transaction_id?: string;
      paid_at?: Date | string;
    },
  ) {
    return this.paymentService.createPayment(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      order_id?: number;
      payment_method?: PaymentMethod;
      payment_status?: PaymentStatus;
      transaction_id?: string;
      paid_at?: Date | string;
    },
  ) {
    return this.paymentService.updatePayment(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.paymentService.deletePayment(+id);
  }
}