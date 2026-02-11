import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { Header } from '../../components/layout';
import { Card, Button, Modal } from '../../components/ui';
import { groupsApi, categoriesApi } from '../../api';
import type { Group, Transaction, Category } from '../../types';
import TransactionForm from '../dashboard/TransactionForm';
import styles from './GroupDetail.module.css';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [groupRes, transRes, catRes] = await Promise.all([
        groupsApi.getById(Number(id)),
        groupsApi.getTransactions(Number(id)),
        categoriesApi.getAll(),
      ]);
      setGroup(groupRes.data);
      setTransactions(transRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load group', err);
      navigate('/groups');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (catId: number | null) => {
    if (!catId) return 'Без категории';
    return categories.find(c => c.id === catId)?.name || 'Неизвестно';
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className={styles.page}>
      <Header 
        title={group.name} 
        subtitle={`Создана ${format(new Date(group.created_at), 'd MMMM yyyy', { locale: ru })}`}
      />

      <div className={styles.content}>
        <Button variant="ghost" onClick={() => navigate('/groups')} className={styles.backBtn}>
          <ArrowLeft size={18} />
          Назад к группам
        </Button>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <span className={styles.statLabel}>Всего доходов</span>
            <span className={`${styles.statValue} ${styles.positive}`}>
              {formatMoney(totalIncome)}
            </span>
          </Card>
          <Card className={styles.statCard}>
            <span className={styles.statLabel}>Всего расходов</span>
            <span className={`${styles.statValue} ${styles.negative}`}>
              {formatMoney(totalExpenses)}
            </span>
          </Card>
          <Card className={styles.statCard}>
            <span className={styles.statLabel}>Баланс</span>
            <span className={`${styles.statValue} ${totalIncome - totalExpenses >= 0 ? styles.positive : styles.negative}`}>
              {formatMoney(totalIncome - totalExpenses)}
            </span>
          </Card>
        </div>

        <Card padding="lg">
          <div className={styles.cardHeader}>
            <h2>Транзакции группы</h2>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Добавить
            </Button>
          </div>

          {transactions.length === 0 ? (
            <div className={styles.empty}>
              <p>Пока нет транзакций в этой группе</p>
            </div>
          ) : (
            <div className={styles.transactionsList}>
              {transactions.map((t) => (
                <div key={t.id} className={styles.transactionItem}>
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
                      {getCategoryName(t.category_id)} • {format(new Date(t.created_at), 'd MMM', { locale: ru })}
                    </span>
                  </div>
                  <span className={`${styles.transactionAmount} ${t.amount < 0 ? styles.negative : styles.positive}`}>
                    {t.amount < 0 ? '' : '+'}{formatMoney(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Добавить транзакцию"
      >
        <TransactionForm
          categories={categories}
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}
