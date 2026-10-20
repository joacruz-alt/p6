import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class CategoryService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createCategory(category_name: string, description?: string) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO categories (category_name, description) VALUES (?, ?)',
      [category_name, description || null],
    );
    return { category_id: result.insertId, category_name, description };
  }

  async findById(category_id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT category_id, category_name, description FROM categories WHERE category_id = ?',
      [category_id],
    );
    if (!rows[0]) throw new NotFoundException('Category not found');
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT category_id, category_name, description FROM categories',
    );
    return rows;
  }

  async updateCategory(category_id: number, partial: { category_name?: string; description?: string }) {
    await this.findById(category_id);

    const fields: string[] = [];
    const values: any[] = [];
    
    if (partial.category_name) {
      fields.push('category_name = ?');
      values.push(partial.category_name);
    }
    if (partial.description !== undefined) {
      fields.push('description = ?');
      values.push(partial.description);
    }
    
    if (fields.length === 0) return await this.findById(category_id);
    
    values.push(category_id);
    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE category_id = ?`;
    await this.pool().execute(sql, values);
    return this.findById(category_id);
  }

  async deleteCategory(category_id: number) {
    const [res] = await this.pool().execute<OkPacket>('DELETE FROM categories WHERE category_id = ?', [category_id]);
    if (res.affectedRows === 0) throw new NotFoundException('Category not found');
    return res.affectedRows > 0;
  }
}