import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AddressService } from './address.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private addressService: AddressService) {}

  // Get all addresses for the logged-in user
  @Get()
  async getAll(@Request() req: any) {
    return this.addressService.findByUserId(req.user.userId);
  }

  // Get single address by id
  @Get(':id')
  async getOne(@Param('id') id: string, @Request() req: any) {
    return this.addressService.findById(+id, req.user.userId);
  }

  // Create address for the logged-in user
  @Post()
  async create(
    @Body() body: { street_address: string; city: string; postal_code: string; is_default?: boolean },
    @Request() req: any,
  ) {
    return this.addressService.createAddress(req.user.userId, body);
  }

  // Update address
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { street_address?: string; city?: string; postal_code?: string; is_default?: boolean },
    @Request() req: any,
  ) {
    return this.addressService.updateAddress(+id, req.user.userId, body);
  }

  // Delete address
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.addressService.deleteAddress(+id, req.user.userId);
  }
}