import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.categoryService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.categoryService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: { category_name: string; description?: string }) {
    return this.categoryService.createCategory(body.category_name, body.description);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { category_name?: string; description?: string }) {
    return this.categoryService.updateCategory(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryService.deleteCategory(+id);
  }
}