import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}