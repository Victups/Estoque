import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimentacaoEstoque } from './entities/movimentacao-estoque.entity';

@Injectable()
export class MovimentacoesService {
	constructor(
		@InjectRepository(MovimentacaoEstoque)
		private readonly repo: Repository<MovimentacaoEstoque>,
	) {}

	async findAll(): Promise<MovimentacaoEstoque[]> {
		try {
			return await this.repo.find({
				relations: [
					'produto',
					'produto.unidadeMedida',
					'produto.marca',
					'produto.categoria',
					'lote',
					'lote.produto',
					'createdBy',
					'updatedBy',
				],
			});
		} catch (error) {
			console.error('Erro ao buscar movimentações:', error);
			throw error;
		}
	}

	async findOne(id: number): Promise<MovimentacaoEstoque> {
		const movimentacao = await this.repo.findOne({
			where: { id },
			relations: [
				'produto',
				'produto.unidadeMedida',
				'produto.marca',
				'produto.categoria',
				'lote',
				'lote.produto',
				'createdBy',
				'updatedBy',
		],
		});

		if (!movimentacao) {
			throw new NotFoundException(`Movimentação com id ${id} não encontrada`);
		}

		return movimentacao;
	}

}
