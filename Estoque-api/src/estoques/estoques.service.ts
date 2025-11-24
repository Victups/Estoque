import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Between, MoreThanOrEqual, LessThanOrEqual, Like } from 'typeorm';
import { RegistroMovimentacao } from './entities/registro-movimentacao.entity';
import { CreateEstoqueDto } from './dto/create-estoque.dto';
import { UpdateEstoqueDto } from './dto/update-estoque.dto';
import { FilterEstoqueDto } from './dto/filter-estoque.dto';
import { MovimentacaoEstoque, TipoMovimentacao } from '../movimentacoes/entities/movimentacao-estoque.entity';
import { ProdutoLote } from '../lotes/entities/produto-lote.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class EstoquesService {
	constructor(
		@InjectRepository(RegistroMovimentacao)
		private readonly registroRepo: Repository<RegistroMovimentacao>,
		@InjectRepository(MovimentacaoEstoque)
		private readonly movimentacaoRepo: Repository<MovimentacaoEstoque>,
		@InjectRepository(ProdutoLote)
		private readonly loteRepo: Repository<ProdutoLote>,
		private readonly dataSource: DataSource,
		private readonly auditoriaService: AuditoriaService,
	) {}

	async create(createEstoqueDto: CreateEstoqueDto): Promise<RegistroMovimentacao> {
		return this.dataSource.transaction(async (manager) => {
			const movimentacaoRepository = manager.getRepository(MovimentacaoEstoque);
			const registroRepository = manager.getRepository(RegistroMovimentacao);
			const loteRepository = manager.getRepository(ProdutoLote);

			const lote = await loteRepository.findOne({
				where: { id: createEstoqueDto.id_lote },
				lock: { mode: 'pessimistic_write' },
			});

			if (!lote) {
				throw new NotFoundException(`Lote com id ${createEstoqueDto.id_lote} não encontrado`);
			}

			const quantidade = Number(createEstoqueDto.quantidade);
			const delta = createEstoqueDto.tipo_movimento === TipoMovimentacao.SAIDA ? -quantidade : quantidade;
			const novoSaldo = Number(lote.quantidade) + delta;

			if (novoSaldo < 0) {
				throw new BadRequestException('Saldo insuficiente para a movimentação solicitada');
			}

			lote.quantidade = novoSaldo;
			lote.updatedBy = createEstoqueDto.id_usuario ? ({ id: createEstoqueDto.id_usuario } as any) : lote.updatedBy;
			
			// Atualiza a localização do lote quando for uma entrada
			if (createEstoqueDto.tipo_movimento === TipoMovimentacao.ENTRADA && createEstoqueDto.id_localizacao_destino) {
				lote.localizacao = { id: createEstoqueDto.id_localizacao_destino } as any;
			}
			
			await loteRepository.save(lote);

			const movimentacao = movimentacaoRepository.create({
				produto: { id: createEstoqueDto.id_produto } as any,
				lote: { id: createEstoqueDto.id_lote } as any,
				quantidade,
				tipoMovimento: createEstoqueDto.tipo_movimento,
				dataMov: createEstoqueDto.dataCriacao ?? new Date(),
				createdBy: { id: createEstoqueDto.id_usuario } as any,
			});
			await movimentacaoRepository.save(movimentacao);

			// Determina a localização principal baseada no tipo de movimentação
			const idLocalizacaoPrincipal = createEstoqueDto.tipo_movimento === TipoMovimentacao.ENTRADA
				? createEstoqueDto.id_localizacao_destino
				: createEstoqueDto.id_localizacao_origem || createEstoqueDto.id_localizacao;

			// Calcula valor_total automaticamente se preco_unitario for fornecido
			const precoUnitario = createEstoqueDto.preco_unitario;
			const valorTotalCalculado = precoUnitario !== undefined && precoUnitario !== null
				? Number((precoUnitario * quantidade).toFixed(2))
				: createEstoqueDto.valor_total;

			const registro = registroRepository.create({
				lote: { id: createEstoqueDto.id_lote } as any,
				produto: { id: createEstoqueDto.id_produto } as any,
				usuario: { id: createEstoqueDto.id_usuario } as any,
				quantidade,
				tipoMovimento: createEstoqueDto.tipo_movimento,
				valorTotal: valorTotalCalculado,
				precoUnitario: precoUnitario,
				observacao: createEstoqueDto.observacao,
				localizacao: idLocalizacaoPrincipal ? ({ id: idLocalizacaoPrincipal } as any) : undefined,
				localizacaoOrigem: createEstoqueDto.id_localizacao_origem
					? ({ id: createEstoqueDto.id_localizacao_origem } as any)
					: undefined,
				localizacaoDestino: createEstoqueDto.id_localizacao_destino
					? ({ id: createEstoqueDto.id_localizacao_destino } as any)
					: undefined,
				usuarioLog: createEstoqueDto.usuario_log_id ? ({ id: createEstoqueDto.usuario_log_id } as any) : undefined,
				usuarioLogId: createEstoqueDto.usuario_log_id,
				dataCriacao: createEstoqueDto.dataCriacao ?? new Date(),
				createdBy: { id: createEstoqueDto.id_usuario } as any,
			});
			const registroSalvo = await registroRepository.save(registro);

			const completo = await registroRepository.findOne({
				where: { id: registroSalvo.id },
				relations: this.defaultRelations,
			});

			if (!completo) {
				throw new InternalServerErrorException('Falha ao carregar a movimentação recém-criada');
			}

			// Registra auditoria de criação
			try {
				await this.auditoriaService.registrarInsert(
					'registro_movimentacoes',
					completo.id,
					completo,
					createEstoqueDto.usuario_log_id || createEstoqueDto.id_usuario,
				);
			} catch (error) {
				console.error('Erro ao registrar auditoria de criação de registro de movimentação:', error);
			}

			return completo;
		});
	}

	private readonly defaultRelations = [
		'lote',
		'lote.produto',
		'lote.localizacao',
		'produto',
		'produto.unidadeMedida',
		'produto.marca',
		'produto.categoria',
		'usuario',
		'usuarioLog',
		'localizacao',
		'localizacao.deposito',
		'localizacaoOrigem',
		'localizacaoOrigem.deposito',
		'localizacaoDestino',
		'localizacaoDestino.deposito',
		'createdBy',
		'updatedBy',
	];

	async findAll(filterDto?: FilterEstoqueDto): Promise<RegistroMovimentacao[]> {
		try {
			const queryBuilder = this.registroRepo.createQueryBuilder('registro')
				.leftJoinAndSelect('registro.produto', 'produto')
				.leftJoinAndSelect('registro.lote', 'lote')
				.leftJoinAndSelect('registro.usuario', 'usuario')
				.leftJoinAndSelect('registro.localizacao', 'localizacao')
				.leftJoinAndSelect('registro.localizacaoOrigem', 'localizacaoOrigem')
				.leftJoinAndSelect('registro.localizacaoDestino', 'localizacaoDestino')
				.leftJoinAndSelect('localizacao.deposito', 'deposito')
				.leftJoinAndSelect('localizacaoOrigem.deposito', 'depositoOrigem')
				.leftJoinAndSelect('localizacaoDestino.deposito', 'depositoDestino')
				.leftJoinAndSelect('registro.createdBy', 'createdBy')
				.leftJoinAndSelect('registro.updatedBy', 'updatedBy')
				.where('registro.ativo = :ativo', { ativo: true });

			// Aplica filtros
			if (filterDto?.id_produto) {
				queryBuilder.andWhere('produto.id = :idProduto', { idProduto: filterDto.id_produto });
			}

			if (filterDto?.tipo_movimento) {
				queryBuilder.andWhere('registro.tipoMovimento = :tipoMovimento', { tipoMovimento: filterDto.tipo_movimento });
			}

			if (filterDto?.id_usuario) {
				queryBuilder.andWhere('usuario.id = :idUsuario', { idUsuario: filterDto.id_usuario });
			}

			if (filterDto?.data_inicio || filterDto?.data_fim) {
				if (filterDto.data_inicio && filterDto.data_fim) {
					queryBuilder.andWhere('registro.dataCriacao BETWEEN :dataInicio AND :dataFim', {
						dataInicio: filterDto.data_inicio,
						dataFim: filterDto.data_fim,
					});
				} else if (filterDto.data_inicio) {
					queryBuilder.andWhere('registro.dataCriacao >= :dataInicio', { dataInicio: filterDto.data_inicio });
				} else if (filterDto.data_fim) {
					queryBuilder.andWhere('registro.dataCriacao <= :dataFim', { dataFim: filterDto.data_fim });
				}
			}

			if (filterDto?.quantidade_min !== undefined || filterDto?.quantidade_max !== undefined) {
				if (filterDto.quantidade_min !== undefined && filterDto.quantidade_max !== undefined) {
					queryBuilder.andWhere('registro.quantidade BETWEEN :quantidadeMin AND :quantidadeMax', {
						quantidadeMin: filterDto.quantidade_min,
						quantidadeMax: filterDto.quantidade_max,
					});
				} else if (filterDto.quantidade_min !== undefined) {
					queryBuilder.andWhere('registro.quantidade >= :quantidadeMin', { quantidadeMin: filterDto.quantidade_min });
				} else if (filterDto.quantidade_max !== undefined) {
					queryBuilder.andWhere('registro.quantidade <= :quantidadeMax', { quantidadeMax: filterDto.quantidade_max });
				}
			}

			// Busca por texto (nome de produto ou código de lote)
			if (filterDto?.busca) {
				const buscaLower = filterDto.busca.toLowerCase();
				queryBuilder.andWhere(
					'(LOWER(produto.nome) LIKE :busca OR LOWER(lote.codigoLote) LIKE :busca OR LOWER(registro.observacao) LIKE :busca)',
					{ busca: `%${buscaLower}%` }
				);
			}

			// Aplica paginação se solicitada
			const pagina = filterDto?.pagina;
			const tamanho = filterDto?.tamanho;
			
			let results: RegistroMovimentacao[];
			let total: number;

			if (pagina || tamanho) {
				// Paginação solicitada
				const page = pagina || 1;
				const size = tamanho || 20;
				const skip = (page - 1) * size;

				queryBuilder.skip(skip).take(size).orderBy('registro.dataCriacao', 'DESC');
				
				// Clona o query builder para contar sem paginação
				const countQueryBuilder = this.registroRepo.createQueryBuilder('registro')
					.leftJoin('registro.produto', 'produto')
					.leftJoin('registro.lote', 'lote')
					.where('registro.ativo = :ativo', { ativo: true });

				// Aplica os mesmos filtros no count
				if (filterDto?.id_produto) {
					countQueryBuilder.andWhere('produto.id = :idProduto', { idProduto: filterDto.id_produto });
				}
				if (filterDto?.tipo_movimento) {
					countQueryBuilder.andWhere('registro.tipoMovimento = :tipoMovimento', { tipoMovimento: filterDto.tipo_movimento });
				}
				if (filterDto?.id_usuario) {
					countQueryBuilder.andWhere('usuario.id = :idUsuario', { idUsuario: filterDto.id_usuario });
				}
				if (filterDto?.data_inicio || filterDto?.data_fim) {
					if (filterDto.data_inicio && filterDto.data_fim) {
						countQueryBuilder.andWhere('registro.dataCriacao BETWEEN :dataInicio AND :dataFim', {
							dataInicio: filterDto.data_inicio,
							dataFim: filterDto.data_fim,
						});
					} else if (filterDto.data_inicio) {
						countQueryBuilder.andWhere('registro.dataCriacao >= :dataInicio', { dataInicio: filterDto.data_inicio });
					} else if (filterDto.data_fim) {
						countQueryBuilder.andWhere('registro.dataCriacao <= :dataFim', { dataFim: filterDto.data_fim });
					}
				}
				if (filterDto?.quantidade_min !== undefined || filterDto?.quantidade_max !== undefined) {
					if (filterDto.quantidade_min !== undefined && filterDto.quantidade_max !== undefined) {
						countQueryBuilder.andWhere('registro.quantidade BETWEEN :quantidadeMin AND :quantidadeMax', {
							quantidadeMin: filterDto.quantidade_min,
							quantidadeMax: filterDto.quantidade_max,
						});
					} else if (filterDto.quantidade_min !== undefined) {
						countQueryBuilder.andWhere('registro.quantidade >= :quantidadeMin', { quantidadeMin: filterDto.quantidade_min });
					} else if (filterDto.quantidade_max !== undefined) {
						countQueryBuilder.andWhere('registro.quantidade <= :quantidadeMax', { quantidadeMax: filterDto.quantidade_max });
					}
				}
				if (filterDto?.busca) {
					const buscaLower = filterDto.busca.toLowerCase();
					countQueryBuilder.andWhere(
						'(LOWER(produto.nome) LIKE :busca OR LOWER(lote.codigoLote) LIKE :busca OR LOWER(registro.observacao) LIKE :busca)',
						{ busca: `%${buscaLower}%` }
					);
				}

				[results, total] = await Promise.all([
					queryBuilder.getMany(),
					countQueryBuilder.getCount()
				]);

				const totalPaginas = Math.ceil(total / size);
				return {
					items: results,
					total,
					pagina: page,
					totalPaginas,
				} as any;
			}

			// Sem paginação
			queryBuilder.orderBy('registro.dataCriacao', 'DESC');
			results = await queryBuilder.getMany();
			return results;
		} catch (error) {
			console.error('Erro ao buscar registros de estoque:', error);
			throw error;
		}
	}

	async findOne(id: number): Promise<RegistroMovimentacao> {
		const registro = await this.registroRepo.findOne({
			where: { id },
			relations: this.defaultRelations,
		});

		if (!registro) {
			throw new NotFoundException(`Registro de estoque com id ${id} não encontrado`);
		}

		return registro;
	}

	async update(id: number, updateEstoqueDto: UpdateEstoqueDto): Promise<RegistroMovimentacao> {
		if (
			updateEstoqueDto.quantidade !== undefined ||
			updateEstoqueDto.tipo_movimento !== undefined ||
			updateEstoqueDto.id_lote !== undefined ||
			updateEstoqueDto.id_produto !== undefined
		) {
			throw new BadRequestException(
				'Atualização de quantidade, tipo ou vínculos de produto/lote não é suportada. Estorne e recrie a movimentação.',
			);
		}

		// Busca o registro antes da atualização para auditoria
		const registroAntes = await this.findOne(id);
		const registro = registroAntes;

		// Se preco_unitario for atualizado, recalcula valor_total automaticamente
		if (updateEstoqueDto.preco_unitario !== undefined) {
			registro.precoUnitario = updateEstoqueDto.preco_unitario;
			// Recalcula valor_total baseado no novo preco_unitario
			if (updateEstoqueDto.preco_unitario !== null && updateEstoqueDto.preco_unitario !== undefined) {
				registro.valorTotal = Number((updateEstoqueDto.preco_unitario * registro.quantidade).toFixed(2));
			}
		} else if (updateEstoqueDto.valor_total !== undefined) {
			// Permite atualização manual de valor_total apenas se preco_unitario não foi alterado
			registro.valorTotal = updateEstoqueDto.valor_total;
		}
		if (updateEstoqueDto.observacao !== undefined) {
			registro.observacao = updateEstoqueDto.observacao;
		}
		if (updateEstoqueDto.id_localizacao !== undefined) {
			registro.localizacao = updateEstoqueDto.id_localizacao
				? ({ id: updateEstoqueDto.id_localizacao } as any)
				: undefined;
		}
		if (updateEstoqueDto.id_localizacao_origem !== undefined) {
			registro.localizacaoOrigem = updateEstoqueDto.id_localizacao_origem
				? ({ id: updateEstoqueDto.id_localizacao_origem } as any)
				: undefined;
		}
		if (updateEstoqueDto.id_localizacao_destino !== undefined) {
			registro.localizacaoDestino = updateEstoqueDto.id_localizacao_destino
				? ({ id: updateEstoqueDto.id_localizacao_destino } as any)
				: undefined;
		}
		if (updateEstoqueDto.usuario_log_id !== undefined) {
			registro.usuarioLogId = updateEstoqueDto.usuario_log_id;
			registro.usuarioLog = updateEstoqueDto.usuario_log_id
				? ({ id: updateEstoqueDto.usuario_log_id } as any)
				: undefined;
		}
		if (updateEstoqueDto.id_usuario) {
			registro.updatedBy = { id: updateEstoqueDto.id_usuario } as any;
		}

		const registroAtualizado = await this.registroRepo.save(registro);
		
		// Registra auditoria de atualização
		try {
			await this.auditoriaService.registrarUpdate(
				'registro_movimentacoes',
				registroAtualizado.id,
				registroAntes,
				registroAtualizado,
				updateEstoqueDto.usuario_log_id || updateEstoqueDto.id_usuario || registroAntes.usuarioLogId,
			);
		} catch (error) {
			console.error('Erro ao registrar auditoria de atualização de registro de movimentação:', error);
		}
		
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		const registro = await this.findOne(id);
		registro.ativo = false;
		await this.registroRepo.save(registro);
	}
}
