import { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { invitesApi, groupsApi } from '../../api';
import type { Invite, Group } from '../../types';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [groups, setGroups] = useState<Map<number, Group>>(new Map());
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      const [invitesRes, groupsRes] = await Promise.all([
        invitesApi.getAll(),
        groupsApi.getAll(),
      ]);
      setInvites(invitesRes.data);
      const groupMap = new Map<number, Group>();
      groupsRes.data.forEach(g => groupMap.set(g.id, g));
      setGroups(groupMap);
    } catch (err) {
      console.error('Failed to load invites', err);
    }
  };

  const handleAccept = async (id: number) => {
    setIsLoading(true);
    try {
      await invitesApi.accept(id);
      setInvites(invites.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to accept invite', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async (id: number) => {
    setIsLoading(true);
    try {
      await invitesApi.decline(id);
      setInvites(invites.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to decline invite', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.actions}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.notificationWrapper}>
          <button
            className={`${styles.notificationBtn} ${invites.length > 0 ? styles.hasNotifications : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {invites.length > 0 && (
              <span className={styles.badge}>{invites.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h3>Уведомления</h3>
                <span className={styles.count}>{invites.length}</span>
              </div>

              <div className={styles.dropdownContent}>
                {invites.length === 0 ? (
                  <div className={styles.empty}>
                    <p>Нет новых уведомлений</p>
                  </div>
                ) : (
                  invites.map((invite) => (
                    <div key={invite.id} className={styles.inviteItem}>
                      <div className={styles.inviteInfo}>
                        <p className={styles.inviteText}>
                          Приглашение в группу{' '}
                          <strong>{groups.get(invite.group_id)?.name || `#${invite.group_id}`}</strong>
                        </p>
                        <span className={styles.inviteDate}>
                          {new Date(invite.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <div className={styles.inviteActions}>
                        <button
                          className={styles.acceptBtn}
                          onClick={() => handleAccept(invite.id)}
                          disabled={isLoading}
                        >
                          Принять
                        </button>
                        <button
                          className={styles.declineBtn}
                          onClick={() => handleDecline(invite.id)}
                          disabled={isLoading}
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
