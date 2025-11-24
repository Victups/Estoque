import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MovimentacoesService } from './movimentacoes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('movimentacoes')
export class MovimentacoesController {
	constructor(private readonly movimentacoesService: MovimentacoesService) {}

	@Get()
	findAll() {
		return this.movimentacoesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.movimentacoesService.findOne(+id);
	}
}
