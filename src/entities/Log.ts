import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Log {
    @PrimaryKey()
    id!: number;

    @Property({type: "date" })
    date = new Date();

    @Property({nullable: true, type: "float"})
    temperature: number;

    @Property({nullable:true, type: "float"})
    humidity: number;
}