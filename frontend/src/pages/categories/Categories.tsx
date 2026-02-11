import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, FolderOpen, Globe, User } from 'lucide-react';
import { Header } from '../../components/layout';
import { Card, Button, Modal, Input } from '../../components/ui';
import { categoriesApi } from '../../api';
import type { Category } from '../../types';
import styles from './Categories.module.css';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSaving(true);
    setError('');

    try {
      const res = await categoriesApi.create(newName.trim());
      setCategories([...categories, res.data]);
      setShowAddModal(false);
      setNewName('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory || !newName.trim()) return;

    setIsSaving(true);
    setError('');

    try {
      const res = await categoriesApi.update(editCategory.id, newName.trim());
      setCategories(categories.map(c => c.id === editCategory.id ? res.data : c));
      setEditCategory(null);
      setNewName('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка обновления');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту категорию?')) return;

    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка удаления');
    }
  };

  const openEdit = (category: Category) => {
    setEditCategory(category);
    setNewName(category.name);
    setError('');
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditCategory(null);
    setNewName('');
    setError('');
  };

  const globalCategories = categories.filter(c => c.user_id === null);
  const userCategories = categories.filter(c => c.user_id !== null);

  return (
    <div className={styles.page}>
      <Header title="Категории" subtitle="Управление категориями расходов" />

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Создать категорию
          </Button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : (
          <div className={styles.sections}>
            {/* User Categories */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <User size={20} />
                <h2>Мои категории</h2>
                <span className={styles.count}>{userCategories.length}</span>
              </div>

              {userCategories.length === 0 ? (
                <Card className={styles.empty} padding="lg">
                  <FolderOpen size={40} strokeWidth={1.5} />
                  <p>У вас пока нет своих категорий</p>
                  <Button size="sm" onClick={() => setShowAddModal(true)}>
                    Создать первую
                  </Button>
                </Card>
              ) : (
                <div className={styles.grid}>
                  {userCategories.map((cat) => (
                    <Card key={cat.id} className={styles.categoryCard} hoverable>
                      <div className={styles.categoryIcon}>
                        <FolderOpen size={24} />
                      </div>
                      <div className={styles.categoryInfo}>
                        <span className={styles.categoryName}>{cat.name}</span>
                        <span className={styles.categoryType}>Личная</span>
                      </div>
                      <div className={styles.categoryActions}>
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => openEdit(cat)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className={`${styles.actionBtn} ${styles.danger}`}
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Global Categories */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Globe size={20} />
                <h2>Глобальные категории</h2>
                <span className={styles.count}>{globalCategories.length}</span>
              </div>

              <div className={styles.grid}>
                {globalCategories.map((cat) => (
                  <Card key={cat.id} className={styles.categoryCard}>
                    <div className={styles.categoryIcon}>
                      <FolderOpen size={24} />
                    </div>
                    <div className={styles.categoryInfo}>
                      <span className={styles.categoryName}>{cat.name}</span>
                      <span className={styles.categoryType}>Глобальная</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModal}
        title="Новая категория"
        size="sm"
      >
        <form onSubmit={handleCreate} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <Input
            label="Название"
            placeholder="Введите название категории"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
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

      {/* Edit Modal */}
      <Modal
        isOpen={!!editCategory}
        onClose={closeModal}
        title="Редактировать категорию"
        size="sm"
      >
        <form onSubmit={handleUpdate} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <Input
            label="Название"
            placeholder="Введите название категории"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Сохранить
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
