import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class AddressService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createAddress(
    userId: number,
    data: { street_address: string; city: string; postal_code: string; is_default?: boolean },
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      'INSERT INTO addresses (user_id, street_address, city, postal_code, is_default) VALUES (?, ?, ?, ?, ?)',
      [userId, data.street_address, data.city, data.postal_code, data.is_default ?? false],
    );
    return { address_id: result.insertId, user_id: userId, ...data };
  }

  async findByUserId(userId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT address_id, user_id, street_address, city, postal_code, is_default FROM addresses WHERE user_id = ?',
      [userId],
    );
    return rows;
  }

  async findById(addressId: number, userId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT address_id, user_id, street_address, city, postal_code, is_default FROM addresses WHERE address_id = ? AND user_id = ?',
      [addressId, userId],
    );
    if (!rows[0]) throw new NotFoundException('Address not found');
    return rows[0];
  }

  async updateAddress(
    addressId: number,
    userId: number,
    partial: { street_address?: string; city?: string; postal_code?: string; is_default?: boolean },
  ) {
    // Ensure the address exists and belongs to the user first
    await this.findById(addressId, userId);

    const fields: string[] = [];
    const values: any[] = [];

    if (partial.street_address) {
      fields.push('street_address = ?');
      values.push(partial.street_address);
    }
    if (partial.city) {
      fields.push('city = ?');
      values.push(partial.city);
    }
    if (partial.postal_code) {
      fields.push('postal_code = ?');
      values.push(partial.postal_code);
    }
    if (partial.is_default !== undefined) {
      fields.push('is_default = ?');
      values.push(partial.is_default);
    }

    if (fields.length === 0) return await this.findById(addressId, userId);

    values.push(addressId, userId);
    const sql = `UPDATE addresses SET ${fields.join(', ')} WHERE address_id = ? AND user_id = ?`;
    await this.pool().execute(sql, values);
    return this.findById(addressId, userId);
  }

  async deleteAddress(addressId: number, userId: number) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM addresses WHERE address_id = ? AND user_id = ?',
      [addressId, userId],
    );
    if (res.affectedRows === 0) throw new NotFoundException('Address not found');
    return { ok: true };
  }
}