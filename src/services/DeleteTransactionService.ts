import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  constructor(
    private transactionRepository = getCustomRepository(TransactionsRepository),
  ) {}

  public async execute(id: string): Promise<void> {
    const findTransaction = await this.transactionRepository.findOne(id);

    if (!findTransaction) {
      throw new AppError('not found', 404);
    }

    await this.transactionRepository.delete({ id });
  }
}

export default DeleteTransactionService;
