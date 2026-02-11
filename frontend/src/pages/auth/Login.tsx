import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, CircleDollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
import styles from './Auth.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gridOverlay} />
      </div>

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <CircleDollarSign className={styles.logoIcon} />
            <span className={styles.logoText}>CircleTracker</span>
          </div>

          <div className={styles.header}>
            <h1>Добро пожаловать</h1>
            <p>Войдите в свой аккаунт для продолжения</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <Input
              label="Имя пользователя"
              type="text"
              placeholder="Введите имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User size={18} />}
              required
            />

            <Input
              label="Пароль"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <Button type="submit" fullWidth isLoading={isLoading}>
              Войти
            </Button>
          </form>

          <p className={styles.footer}>
            Нет аккаунта?{' '}
            <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
