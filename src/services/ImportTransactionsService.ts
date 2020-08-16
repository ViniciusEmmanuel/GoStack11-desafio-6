import fs from 'fs';
import csvParse from 'csv-parse';

import AppError from '../errors/AppError';

import { getCustomRepository, getRepository, In } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface ITransaction {
  title: string;

  type: 'income' | 'outcome';

  value: number;

  category: string;
}

class ImportTransactionsService {
  private transactionsToCreate: ITransaction[] = [];
  private titlesCategories: string[] = [];

  constructor(
    private transactionsRepository = getCustomRepository(
      TransactionsRepository,
    ),
    private categoryRepository = getRepository(Category),
  ) {}

  async execute(filePath: string): Promise<Transaction[]> {
    const fileExists = await fs.promises.stat(filePath);

    if (!fileExists) {
      throw new AppError('File not found', 400);
    }

    const fileReadStream = fs.createReadStream(filePath);

    const config = csvParse({
      from_line: 2,
    });

    const parseCSV = fileReadStream.pipe(config);

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value || !category) {
        return;
      }

      this.transactionsToCreate.push({
        title,
        type,
        value,
        category,
      });

      this.filterTitleCategories(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    await fs.promises.unlink(filePath);

    const categories = await this.createCategories();

    const transactions = await this.createTransactions(categories);

    return transactions;
  }

  private async createTransactions(categories: Category[] = []) {
    const transactions = this.transactionsToCreate.map(transaction => {
      return this.transactionsRepository.create({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category_id: categories.filter(
          category => category.title === transaction.category,
        )[0].id,
      });
    });

    await this.transactionsRepository.save(transactions);

    return transactions;
  }

  private async createCategories() {
    const existsCategories = await this.categoryRepository.find({
      select: ['id', 'title'],
      where: { title: In(this.titlesCategories) },
    });

    const existsTitleCategories = existsCategories.map(
      category => category.title,
    );

    const categoriesToCreate = this.titlesCategories.reduce(
      (acc: Category[], title: string) => {
        if (!existsTitleCategories.includes(title)) {
          const category = this.categoryRepository.create({
            title,
          });

          acc.push(category);
        }

        return acc;
      },

      [],
    );

    if (categoriesToCreate.length > 0) {
      await this.categoryRepository.save(categoriesToCreate);
    }

    const totalCategories = [...existsCategories, ...categoriesToCreate];

    return totalCategories;
  }

  private filterTitleCategories(title: string): void {
    const findCategorie = this.titlesCategories.findIndex(
      titleCategory => titleCategory === title,
    );

    if (findCategorie !== -1) {
      return;
    }
    this.titlesCategories.push(title);
  }
}

export default ImportTransactionsService;
