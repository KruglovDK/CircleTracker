import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, CircleDollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
import styles from './Auth.module.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    setIsLoading(true);

    try {
      await register(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
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
            <h1>Создать аккаунт</h1>
            <p>Начните отслеживать свои расходы</p>
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
              placeholder="Минимум 8 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <Input
              label="Подтвердите пароль"
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={18} />}
              required
            />

            <Button type="submit" fullWidth isLoading={isLoading}>
              Зарегистрироваться
            </Button>
          </form>

          <p className={styles.footer}>
            Уже есть аккаунт?{' '}
            <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
