import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class OrderItemService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createOrderItem(data: {
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
  }) {
    const [result] = await this.pool().execute<ResultSetHeader>(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
      [data.order_id, data.product_id, data.quantity, data.unit_price],
    );
    return { order_item_id: result.insertId, ...data };
  }

  async findById(order_item_id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT order_item_id, order_id, product_id, quantity, unit_price FROM order_items WHERE order_item_id = ?',
      [order_item_id],
    );
    if (!rows[0]) throw new NotFoundException('Order item not found');
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT order_item_id, order_id, product_id, quantity, unit_price FROM order_items',
    );
    return rows;
  }

  async updateOrderItem(
    order_item_id: number,
    partial: {
      order_id?: number;
      product_id?: number;
      quantity?: number;
      unit_price?: number;
    },
  ) {
    await this.findById(order_item_id);

    const fields: string[] = [];
    const values: any[] = [];

    if (partial.order_id !== undefined) {
      fields.push('order_id = ?');
      values.push(partial.order_id);
    }
    if (partial.product_id !== undefined) {
      fields.push('product_id = ?');
      values.push(partial.product_id);
    }
    if (partial.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(partial.quantity);
    }
    if (partial.unit_price !== undefined) {
      fields.push('unit_price = ?');
      values.push(partial.unit_price);
    }

    if (fields.length === 0) return await this.findById(order_item_id);

    values.push(order_item_id);
    const sql = `UPDATE order_items SET ${fields.join(', ')} WHERE order_item_id = ?`;
    await this.pool().execute(sql, values);
    return this.findById(order_item_id);
  }

  async deleteOrderItem(order_item_id: number) {
    const [res] = await this.pool().execute<ResultSetHeader>(
      'DELETE FROM order_items WHERE order_item_id = ?',
      [order_item_id],
    );
    if (res.affectedRows === 0) throw new NotFoundException('Order item not found');
    return res.affectedRows > 0;
  }
}