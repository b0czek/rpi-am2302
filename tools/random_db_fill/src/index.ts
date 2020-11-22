import mikroConfig from '../../../src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/core';
const main = async() => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    
};


main().catch(err => {
    console.error(err);
    
});