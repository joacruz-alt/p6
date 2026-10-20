import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class ProductService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createProduct(data: {
    category_id?: number;
    name: string;
    description?: string;
    price: number;
    stock_quantity?: number;
    is_available?: boolean;
  }) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO products (category_id, name, description, price, stock_quantity, is_available) VALUES (?, ?, ?, ?, ?, ?)',
      [
        data.category_id || null,
        data.name,
        data.description || null,
        data.price,
        data.stock_quantity ?? 8,
        data.is_available ?? true,
      ],
    );
    return { product_id: result.insertId, ...data };
  }

  async findById(product_id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT product_id, category_id, name, description, price, stock_quantity, is_available FROM products WHERE product_id = ?',
      [product_id],
    );
    if (!rows[0]) throw new NotFoundException('Product not found');
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT product_id, category_id, name, description, price, stock_quantity, is_available FROM products',
    );
    return rows;
  }

  async updateProduct(
    product_id: number,
    partial: {
      category_id?: number;
      name?: string;
      description?: string;
      price?: number;
      stock_quantity?: number;
      is_available?: boolean;
    },
  ) {
    await this.findById(product_id);

    const fields: string[] = [];
    const values: any[] = [];

    if (partial.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(partial.category_id);
    }
    if (partial.name) {
      fields.push('name = ?');
      values.push(partial.name);
    }
    if (partial.description !== undefined) {
      fields.push('description = ?');
      values.push(partial.description);
    }
    if (partial.price !== undefined) {
      fields.push('price = ?');
      values.push(partial.price);
    }
    if (partial.stock_quantity !== undefined) {
      fields.push('stock_quantity = ?');
      values.push(partial.stock_quantity);
    }
    if (partial.is_available !== undefined) {
      fields.push('is_available = ?');
      values.push(partial.is_available);
    }

    if (fields.length === 0) return await this.findById(product_id);

    values.push(product_id);
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`;
    await this.pool().execute(sql, values);
    return this.findById(product_id);
  }

  async deleteProduct(product_id: number) {
    const [res] = await this.pool().execute<OkPacket>('DELETE FROM products WHERE product_id = ?', [product_id]);
    if (res.affectedRows === 0) throw new NotFoundException('Product not found');
    return res.affectedRows > 0;
  }
}