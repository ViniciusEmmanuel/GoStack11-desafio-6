import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface ICreateTransaction {
  title: string;

  type: 'income' | 'outcome';

  value: number;

  titleCategory: string;
}

class CreateTransactionService {
  constructor(
    private transactionRepository = getCustomRepository(TransactionRepository),
    private categoryRepository = getRepository(Category),
  ) {}

  public async execute({
    title,
    type,
    value,
    titleCategory,
  }: ICreateTransaction): Promise<Transaction> {
    const { total } = await this.transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Saldo insuficiente.', 400);
    }

    let category = await this.categoryRepository.findOne({
      where: { title: titleCategory },
    });

    if (!category) {
      category = this.categoryRepository.create({
        title: titleCategory,
      });

      await this.categoryRepository.save(category);
    }

    const transaction = this.transactionRepository.create({
      title,
      type,
      value,
      category_id: category.id,
    });

    await this.transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
