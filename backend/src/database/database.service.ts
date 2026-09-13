import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit {

  private connection!: mysql.Connection;

  async onModuleInit() {
    this.connection = await mysql.createConnection({
      host:     'localhost',
      user:     'root',
      password: '',
      database: 'prestige_db',
    });
    console.log(' MySQL connecté — prestige_db');
  }

  async query(sql: string, params: any[] = []) {
    const [rows] = await this.connection.execute(sql, params);
    return rows;
  }
}