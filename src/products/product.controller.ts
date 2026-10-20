import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  // Get all products (Public)
  @Get()
  async getAll() {
    return this.productService.getAll();
  }

  // Get single product by ID (Public)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.productService.findById(+id);
  }

  // Create product (Protected)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body()
    body: {
      category_id?: number;
      name: string;
      description?: string;
      price: number;
      stock_quantity?: number;
      is_available?: boolean;
    },
  ) {
    return this.productService.createProduct(body);
  }

  // Update product (Protected)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      category_id?: number;
      name?: string;
      description?: string;
      price?: number;
      stock_quantity?: number;
      is_available?: boolean;
    },
  ) {
    return this.productService.updateProduct(+id, body);
  }

  // Delete product (Protected)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productService.deleteProduct(+id);
  }
}