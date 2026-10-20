import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export type OrderStatus = 'pending' | 'preparing' | 'out_for_delivery' | 'completed' | 'cancelled';

@Injectable()
export class OrderService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createOrder(data: {
    user_id: number;
    address_id?: number;
    order_status?: OrderStatus;
    total_amount: number;
  }) {
    const [result] = await this.pool().execute<ResultSetHeader>(
      'INSERT INTO orders (user_id, address_id, order_status, total_amount) VALUES (?, ?, ?, ?)',
      [
        data.user_id,
        data.address_id || null,
        data.order_status ?? 'pending',
        data.total_amount,
      ],
    );
    return { order_id: result.insertId, ...data };
  }

  async findById(order_id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT order_id, user_id, address_id, order_status, total_amount, created_at FROM orders WHERE order_id = ?',
      [order_id],
    );
    if (!rows[0]) throw new NotFoundException('Order not found');
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT order_id, user_id, address_id, order_status, total_amount, created_at FROM orders',
    );
    return rows;
  }

async updateOrder(
  order_id: number,
  partial: {
    user_id?: number;
    address_id?: number;
    order_status?: OrderStatus;
    total_amount?: number;
  },
) {
  await this.findById(order_id);

  const fields: string[] = [];
  const values: any[] = [];

  if (partial.user_id !== undefined) {
    fields.push('user_id = ?');
    values.push(partial.user_id);
  }
  if (partial.address_id !== undefined) {
    fields.push('address_id = ?');
    values.push(partial.address_id);
  }
  if (partial.order_status) {
    fields.push('order_status = ?');
    values.push(partial.order_status);
  }
  if (partial.total_amount !== undefined) {
    fields.push('total_amount = ?');
    values.push(partial.total_amount);
  }

  if (fields.length === 0) return await this.findById(order_id);

  values.push(order_id);
  
  // Fixed template string below
  const sql = `UPDATE orders SET ${fields.join(', ')} WHERE order_id = ?`;
  await this.pool().execute(sql, values);
  
  return this.findById(order_id);
}

  async deleteOrder(order_id: number) {
    const [res] = await this.pool().execute<ResultSetHeader>('DELETE FROM orders WHERE order_id = ?', [order_id]);
    if (res.affectedRows === 0) throw new NotFoundException('Order not found');
    return res.affectedRows > 0;
  }
}