import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Transactions1597421538657 implements MigrationInterface {
  private Table = new Table({
    name: 'transactions',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      {
        name: 'title',
        type: 'varchar',
        isNullable: false,
      },
      {
        name: 'type',
        type: 'varchar',
        isNullable: false,
      },
      {
        name: 'value',
        type: 'decimal',
        isNullable: false,
        precision: 10,
        scale: 2,
      },
      {
        name: 'category_id',
        type: 'uuid',
        isNullable: true,
      },
      {
        name: 'created_at',
        type: 'timestamp',
        default: 'now()',
      },
      {
        name: 'updated_at',
        type: 'timestamp',
        default: 'now()',
      },
    ],
    foreignKeys: [
      {
        name: 'transaction_category_id',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    } finally {
      await queryRunner.createTable(this.Table);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.Table);
  }
}
