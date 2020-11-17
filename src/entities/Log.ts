import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Log {
    @PrimaryKey()
    id!: number;

    @Property({type: "date" })
    date = new Date();

    @Property({nullable: true})
    temperature: number;

    @Property({nullable:true})
    humidity: number;
}