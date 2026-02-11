import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  FolderOpen, 
  Users, 
  Settings,
  LogOut,
  CircleDollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/transactions', icon: ArrowUpDown, label: 'Транзакции' },
  { to: '/categories', icon: FolderOpen, label: 'Категории' },
  { to: '/groups', icon: Users, label: 'Группы' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <CircleDollarSign className={styles.logoIcon} />
        <span className={styles.logoText}>CircleTracker</span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive || (item.to !== '/' && location.pathname.startsWith(item.to)) ? styles.active : ''}`
                }
                end={item.to === '/'}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar}>
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.username}>{user?.username}</span>
            <span className={styles.userRole}>Пользователь</span>
          </div>
        </div>

        <div className={styles.actions}>
          <NavLink to="/settings" className={styles.actionBtn}>
            <Settings size={18} />
          </NavLink>
          <button onClick={logout} className={styles.actionBtn}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
