import { Migration } from '@mikro-orm/migrations';

export class Migration20201118123539 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "log" ("id" serial primary key, "date" timestamptz(0) not null, "temperature" float null, "humidity" float null);');
  }

}
