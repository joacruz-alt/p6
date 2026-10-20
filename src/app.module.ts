import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AddressModule } from './addresses/address.module';
import { CategoryModule } from './categories/category.module';
import { ProductModule } from './products/product.module';
import { OrderModule } from './orders/order.module';
import { OrderItemModule } from './order-items/order-items.module';
import { PaymentModule } from './payments/payment.module';


@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, AddressModule, CategoryModule, ProductModule, OrderModule, OrderItemModule, PaymentModule],
})
export class AppModule {}