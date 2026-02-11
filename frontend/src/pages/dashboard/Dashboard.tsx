import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Header } from '../../components/layout';
import { Card, Button, Modal } from '../../components/ui';
import { transactionsApi, categoriesApi } from '../../api';
import type { Transaction, Category } from '../../types';
import TransactionForm from './TransactionForm';
import styles from './Dashboard.module.css';

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        transactionsApi.getAll(),
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

  // Calculations
  const currentMonth = transactions.filter(t => {
    const date = new Date(t.created_at);
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return date >= start && date <= end;
  });

  const totalExpenses = currentMonth
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = currentMonth
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const essentialExpenses = currentMonth
    .filter(t => t.amount < 0 && t.is_essential)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Chart data - last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTransactions = transactions.filter(t => {
      const tDate = new Date(t.created_at);
      return tDate.toDateString() === date.toDateString();
    });
    const expenses = dayTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
      date: format(date, 'dd MMM', { locale: ru }),
      expenses: expenses / 100,
    };
  });

  // Category breakdown
  const categoryData = categories
    .map(cat => {
      const total = currentMonth
        .filter(t => t.category_id === cat.id && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return { name: cat.name, value: total / 100 };
    })
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

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

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header 
        title="Дашборд" 
        subtitle={format(new Date(), 'LLLL yyyy', { locale: ru })}
      />

      <div className={styles.content}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard} variant="gradient">
            <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <Wallet size={24} color="#6366f1" />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Баланс</span>
              <span className={`${styles.statValue} ${balance >= 0 ? styles.positive : styles.negative}`}>
                {formatMoney(balance)}
              </span>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <TrendingUp size={24} color="#10b981" />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Доходы</span>
              <span className={`${styles.statValue} ${styles.positive}`}>
                {formatMoney(totalIncome)}
              </span>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <TrendingDown size={24} color="#ef4444" />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Расходы</span>
              <span className={`${styles.statValue} ${styles.negative}`}>
                {formatMoney(totalExpenses)}
              </span>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <PiggyBank size={24} color="#f59e0b" />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Обязательные</span>
              <span className={styles.statValue}>
                {formatMoney(essentialExpenses)}
              </span>
            </div>
          </Card>
        </div>

        <div className={styles.mainGrid}>
          {/* Chart */}
          <Card className={styles.chartCard} padding="lg">
            <div className={styles.cardHeader}>
              <h2>Расходы за неделю</h2>
            </div>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-tertiary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-tertiary)"
                    fontSize={12}
                    tickFormatter={(value) => `${value}₽`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-md)',
                    }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                    formatter={(value) => [`${value}₽`, 'Расходы']}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="var(--accent-primary)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--accent-primary)', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Pie Chart */}
          <Card className={styles.pieCard} padding="lg">
            <div className={styles.cardHeader}>
              <h2>По категориям</h2>
            </div>
            {categoryData.length > 0 ? (
              <div className={styles.pieWrapper}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-md)',
                      }}
                      formatter={(value) => [`${value}₽`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.legend}>
                  {categoryData.slice(0, 4).map((cat, index) => (
                    <div key={cat.name} className={styles.legendItem}>
                      <span 
                        className={styles.legendDot} 
                        style={{ background: COLORS[index % COLORS.length] }}
                      />
                      <span className={styles.legendLabel}>{cat.name}</span>
                      <span className={styles.legendValue}>{cat.value}₽</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.emptyChart}>
                <p>Нет данных за этот месяц</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className={styles.transactionsCard} padding="lg">
          <div className={styles.cardHeader}>
            <h2>Последние транзакции</h2>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Добавить
            </Button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className={styles.transactionsList}>
              {recentTransactions.map((t) => (
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
                    <span className={styles.transactionCategory}>
                      {getCategoryName(t.category_id)}
                    </span>
                  </div>
                  <div className={styles.transactionMeta}>
                    <span className={`${styles.transactionAmount} ${t.amount < 0 ? styles.negative : styles.positive}`}>
                      {t.amount < 0 ? '-' : '+'}{formatMoney(Math.abs(t.amount))}
                    </span>
                    <span className={styles.transactionDate}>
                      {format(new Date(t.created_at), 'dd MMM', { locale: ru })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyTransactions}>
              <p>Пока нет транзакций</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus size={16} />
                Добавить первую
              </Button>
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
          onSuccess={handleTransactionAdded}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
}
