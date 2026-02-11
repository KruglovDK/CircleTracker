import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { User, Calendar, LogOut } from 'lucide-react';
import { Header } from '../../components/layout';
import { Card, Button } from '../../components/ui';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.page}>
      <Header title="Настройки" subtitle="Управление аккаунтом" />

      <div className={styles.content}>
        <Card className={styles.profileCard} padding="lg">
          <div className={styles.avatar}>
            {user?.username.charAt(0).toUpperCase()}
          </div>
          
          <div className={styles.profileInfo}>
            <h2>{user?.username}</h2>
            <p>Пользователь CircleTracker</p>
          </div>

          <div className={styles.details}>
            <div className={styles.detailItem}>
              <User size={18} />
              <span className={styles.detailLabel}>Имя пользователя</span>
              <span className={styles.detailValue}>{user?.username}</span>
            </div>
            
            <div className={styles.detailItem}>
              <Calendar size={18} />
              <span className={styles.detailLabel}>Дата регистрации</span>
              <span className={styles.detailValue}>
                {user?.created_at && format(new Date(user.created_at), 'd MMMM yyyy', { locale: ru })}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="danger" onClick={logout} fullWidth>
              <LogOut size={18} />
              Выйти из аккаунта
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
