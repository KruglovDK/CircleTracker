import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, Filter, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Header } from '../../components/layout';
import { Card, Button, Modal } from '../../components/ui';
import { transactionsApi, categoriesApi } from '../../api';
import type { Transaction, Category } from '../../types';
import TransactionForm from '../dashboard/TransactionForm';
import styles from './Transactions.module.css';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category_id: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        transactionsApi.getAll(buildFilterParams()),
        categoriesApi.getAll(),
      ]);
      setTransactions(transRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const buildFilterParams = () => {
    const params: Record<string, string | number> = {};
    if (filters.category_id) params.category_id = Number(filters.category_id);
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    return params;
  };

  const applyFilters = async () => {
    setIsLoading(true);
    try {
      const res = await transactionsApi.getAll(buildFilterParams());
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to filter', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ category_id: '', date_from: '', date_to: '' });
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту транзакцию?')) return;
    try {
      await transactionsApi.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const getCategoryName = (id: number | null) => {
    if (!id) return 'Без категории';
    return categories.find(c => c.id === id)?.name || 'Неизвестно';
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const handleTransactionAdded = () => {
    setShowAddModal(false);
    loadData();
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, t) => {
    const date = format(new Date(t.created_at), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(t);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className={styles.page}>
      <Header title="Транзакции" subtitle="История всех операций" />

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Добавить
          </Button>

          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Фильтры
          </Button>
        </div>

        {showFilters && (
          <Card className={styles.filtersCard} padding="md">
            <div className={styles.filtersGrid}>
              <div className={styles.filterField}>
                <label>Категория</label>
                <select
                  value={filters.category_id}
                  onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                >
                  <option value="">Все категории</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterField}>
                <label>Дата от</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                />
              </div>

              <div className={styles.filterField}>
                <label>Дата до</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                />
              </div>

              <div className={styles.filterActions}>
                <Button size="sm" onClick={applyFilters}>Применить</Button>
                <Button size="sm" variant="ghost" onClick={clearFilters}>Сбросить</Button>
              </div>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : transactions.length === 0 ? (
          <Card className={styles.empty} padding="lg">
            <p>Транзакций пока нет</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Добавить первую
            </Button>
          </Card>
        ) : (
          <div className={styles.transactionGroups}>
            {sortedDates.map((date) => (
              <div key={date} className={styles.dateGroup}>
                <div className={styles.dateHeader}>
                  {format(new Date(date), 'd MMMM yyyy', { locale: ru })}
                </div>
                <Card padding="none">
                  {groupedTransactions[date].map((t, index) => (
                    <div 
                      key={t.id} 
                      className={`${styles.transactionItem} ${index === groupedTransactions[date].length - 1 ? styles.last : ''}`}
                    >
                      <div className={styles.transactionIcon}>
                        {t.amount < 0 ? (
                          <ArrowDownRight size={20} color="#ef4444" />
                        ) : (
                          <ArrowUpRight size={20} color="#10b981" />
                        )}
                      </div>

                      <div className={styles.transactionInfo}>
                        <span className={styles.transactionDesc}>
                          {t.description || getCategoryName(t.category_id)}
                        </span>
                        <span className={styles.transactionMeta}>
                          {getCategoryName(t.category_id)}
                          {t.is_essential && <span className={styles.essential}>Обязательный</span>}
                        </span>
                      </div>

                      <div className={`${styles.transactionAmount} ${t.amount < 0 ? styles.negative : styles.positive}`}>
                        {t.amount < 0 ? '' : '+'}{formatMoney(t.amount)}
                      </div>

                      <div className={styles.transactionActions}>
                        <button className={styles.actionBtn} onClick={() => handleDelete(t.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Добавить транзакцию"
      >
        <TransactionForm
          categories={categories}
          onSuccess={handleTransactionAdded}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}
