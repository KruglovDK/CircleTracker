import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, Users, UserPlus, Trash2, ChevronRight, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout';
import { Card, Button, Modal, Input } from '../../components/ui';
import { groupsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import type { Group } from '../../types';
import styles from './Groups.module.css';

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await groupsApi.getAll();
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to load groups', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsSaving(true);
    setError('');

    try {
      const res = await groupsApi.create(newGroupName.trim());
      setGroups([res.data, ...groups]);
      setShowCreateModal(false);
      setNewGroupName('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !inviteUsername.trim()) return;

    setIsSaving(true);
    setError('');

    try {
      await groupsApi.createInvite(selectedGroup.id, inviteUsername.trim());
      setShowInviteModal(false);
      setInviteUsername('');
      setSelectedGroup(null);
      alert('Приглашение отправлено!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка отправки приглашения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту группу? Все транзакции группы останутся.')) return;

    try {
      await groupsApi.delete(id);
      setGroups(groups.filter(g => g.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка удаления');
    }
  };

  const openInviteModal = (group: Group) => {
    setSelectedGroup(group);
    setShowInviteModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowInviteModal(false);
    setSelectedGroup(null);
    setNewGroupName('');
    setInviteUsername('');
    setError('');
  };

  return (
    <div className={styles.page}>
      <Header title="Группы" subtitle="Совместный учёт расходов" />

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            Создать группу
          </Button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : groups.length === 0 ? (
          <Card className={styles.empty} padding="lg">
            <Users size={48} strokeWidth={1.5} />
            <h3>У вас пока нет групп</h3>
            <p>Создайте группу для совместного учёта расходов с друзьями или семьёй</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Создать первую группу
            </Button>
          </Card>
        ) : (
          <div className={styles.grid}>
            {groups.map((group) => (
              <Card key={group.id} className={styles.groupCard} hoverable>
                <div 
                  className={styles.groupMain}
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className={styles.groupIcon}>
                    <Users size={24} />
                  </div>
                  <div className={styles.groupInfo}>
                    <div className={styles.groupName}>
                      {group.name}
                      {group.owner_id === user?.id && (
                        <Crown size={14} className={styles.ownerBadge} />
                      )}
                    </div>
                    <div className={styles.groupMeta}>
                      Создана {format(new Date(group.created_at), 'd MMM yyyy', { locale: ru })}
                    </div>
                  </div>
                  <ChevronRight size={20} className={styles.chevron} />
                </div>

                <div className={styles.groupActions}>
                  <button 
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      openInviteModal(group);
                    }}
                  >
                    <UserPlus size={16} />
                    <span>Пригласить</span>
                  </button>
                  
                  {group.owner_id === user?.id && (
                    <button 
                      className={`${styles.actionBtn} ${styles.danger}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(group.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModal}
        title="Новая группа"
        size="sm"
      >
        <form onSubmit={handleCreate} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <Input
            label="Название группы"
            placeholder="Например: Семья, Друзья, Поездка"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            autoFocus
          />
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Создать
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={closeModal}
        title={`Пригласить в "${selectedGroup?.name}"`}
        size="sm"
      >
        <form onSubmit={handleInvite} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <Input
            label="Имя пользователя"
            placeholder="Введите username"
            value={inviteUsername}
            onChange={(e) => setInviteUsername(e.target.value)}
            autoFocus
          />
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Пригласить
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
