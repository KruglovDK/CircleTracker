import { useState } from 'react';
import { Button, Input } from '../../components/ui';
import { transactionsApi } from '../../api';
import type { Category } from '../../types';
import styles from './TransactionForm.module.css';

interface TransactionFormProps {
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ categories, onSuccess, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [isEssential, setIsEssential] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || isNaN(Number(amount))) {
      setError('Введите корректную сумму');
      return;
    }

    setIsLoading(true);

    try {
      const amountInKopeks = Math.round(Number(amount) * 100);
      await transactionsApi.create({
        amount: type === 'expense' ? -amountInKopeks : amountInKopeks,
        description: description || undefined,
        category_id: categoryId || undefined,
        is_essential: isEssential,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания транзакции');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.typeToggle}>
        <button
          type="button"
          className={`${styles.typeBtn} ${type === 'expense' ? styles.active : ''} ${styles.expense}`}
          onClick={() => setType('expense')}
        >
          Расход
        </button>
        <button
          type="button"
          className={`${styles.typeBtn} ${type === 'income' ? styles.active : ''} ${styles.income}`}
          onClick={() => setType('income')}
        >
          Доход
        </button>
      </div>

      <Input
        label="Сумма (₽)"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <Input
        label="Описание"
        type="text"
        placeholder="Опционально"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className={styles.field}>
        <label className={styles.label}>Категория</label>
        <select
          className={styles.select}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Без категории</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {type === 'expense' && (
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={isEssential}
            onChange={(e) => setIsEssential(e.target.checked)}
          />
          <span className={styles.checkmark} />
          <span>Обязательный расход</span>
        </label>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Добавить
        </Button>
      </div>
    </form>
  );
}
