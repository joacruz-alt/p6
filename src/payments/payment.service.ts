import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export type PaymentMethod = 'credit_card' | 'e_wallet' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

@Injectable()
export class PaymentService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createPayment(data: {
    order_id: number;
    payment_method: PaymentMethod;
    payment_status?: PaymentStatus;
    transaction_id?: string;
    paid_at?: Date | string;
  }) {
    const [result] = await this.pool().execute<ResultSetHeader>(
      'INSERT INTO payments (order_id, payment_method, payment_status, transaction_id, paid_at) VALUES (?, ?, ?, ?, ?)',
      [
        data.order_id,
        data.payment_method,
        data.payment_status ?? 'pending',
        data.transaction_id || null,
        data.paid_at || null,
      ],
    );
    return { payment_id: result.insertId, ...data };
  }

  async findById(payment_id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT payment_id, order_id, payment_method, payment_status, transaction_id, paid_at FROM payments WHERE payment_id = ?',
      [payment_id],
    );
    if (!rows[0]) throw new NotFoundException('Payment not found');
    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT payment_id, order_id, payment_method, payment_status, transaction_id, paid_at FROM payments',
    );
    return rows;
  }

  async updatePayment(
    payment_id: number,
    partial: {
      order_id?: number;
      payment_method?: PaymentMethod;
      payment_status?: PaymentStatus;
      transaction_id?: string;
      paid_at?: Date | string;
    },
  ) {
    await this.findById(payment_id);

    const fields: string[] = [];
    const values: any[] = [];

    if (partial.order_id !== undefined) {
      fields.push('order_id = ?');
      values.push(partial.order_id);
    }
    if (partial.payment_method) {
      fields.push('payment_method = ?');
      values.push(partial.payment_method);
    }
    if (partial.payment_status) {
      fields.push('payment_status = ?');
      values.push(partial.payment_status);
    }
    if (partial.transaction_id !== undefined) {
      fields.push('transaction_id = ?');
      values.push(partial.transaction_id);
    }
    if (partial.paid_at !== undefined) {
      fields.push('paid_at = ?');
      values.push(partial.paid_at);
    }

    if (fields.length === 0) return await this.findById(payment_id);

    values.push(payment_id);
    const sql = `UPDATE payments SET ${fields.join(', ')} WHERE payment_id = ?`;
    await this.pool().execute(sql, values);
    return this.findById(payment_id);
  }

  async deletePayment(payment_id: number) {
    const [res] = await this.pool().execute<ResultSetHeader>(
      'DELETE FROM payments WHERE payment_id = ?',
      [payment_id],
    );
    if (res.affectedRows === 0) throw new NotFoundException('Payment not found');
    return res.affectedRows > 0;
  }
}