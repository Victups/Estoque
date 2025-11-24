import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || error;
      }
    } else if (exception instanceof QueryFailedError) {
      // Erro do TypeORM/banco de dados
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = 'Database Error';
      message = this.getDatabaseErrorMessage(exception);
      this.logger.error(`Database error: ${exception.message}`, exception.stack);
    } else if (exception instanceof Error) {
      // Outros erros
      message = exception.message || 'Internal server error';
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    } else {
      this.logger.error('Unknown error occurred', exception);
    }

    // Log detalhado do erro
    this.logger.error(
      `Error ${status}: ${message} - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getDatabaseErrorMessage(error: QueryFailedError): string {
    const message = error.message || '';

    // PostgreSQL errors
    if (message.includes('violates foreign key constraint')) {
      return 'Erro de integridade: referência inválida a um registro relacionado.';
    }
    if (message.includes('violates unique constraint')) {
      return 'Erro de unicidade: já existe um registro com este valor único.';
    }
    if (message.includes('violates not-null constraint')) {
      return 'Erro de validação: campo obrigatório não foi informado.';
    }
    if (message.includes('relation') && message.includes('does not exist')) {
      return 'Erro de banco de dados: tabela ou relação não encontrada.';
    }
    if (message.includes('column') && message.includes('does not exist')) {
      return 'Erro de banco de dados: coluna não encontrada.';
    }
    if (message.includes('connection')) {
      return 'Erro de conexão com o banco de dados. Verifique se o banco está rodando.';
    }

    // Mensagem genérica para erros de banco de dados
    return 'Erro ao acessar o banco de dados. Verifique os logs do servidor para mais detalhes.';
  }
}
