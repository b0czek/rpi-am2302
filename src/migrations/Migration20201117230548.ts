import { Migration } from '@mikro-orm/migrations';

export class Migration20201117230548 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "log" ("id" serial primary key, "date" timestamptz(0) not null, "temperature" int4 null, "humidity" int4 null);');
  }

}
