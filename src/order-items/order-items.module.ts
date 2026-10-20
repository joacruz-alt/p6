import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OrderItemService } from './order-items.service';
import { OrderItemController } from './order-items.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [OrderItemController],
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}