import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions, runSeeders } from 'typeorm-extension';
import { dataSourceOptions } from './database.module';

async function runSeeds() {
  const dataSource = new DataSource({
    ...dataSourceOptions,
  } as DataSourceOptions & SeederOptions);

  try {
    await dataSource.initialize();
    console.log('Conectado ao banco de dados');
    
    await runSeeders(dataSource, {
      seeds: dataSourceOptions.seeds || [],
    });
    
    console.log('Seeds executados com sucesso!');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error(' Erro ao executar seeds:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeeds();

