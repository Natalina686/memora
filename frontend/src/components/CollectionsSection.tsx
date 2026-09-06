import { useState } from "react";

import {
  createKnowledgeCollection,
  deleteKnowledgeCollection,
  updateKnowledgeCollection,
  type KnowledgeCollection,
  type Learner,
} from "../api/api";

interface CollectionsSectionProps {
  learners: Learner[];
  collections: KnowledgeCollection[];
  selectedCollectionId: string;

  onSelectCollection: (
    collectionId: string,
  ) => void;

  onCollectionsChange: (
    collections: KnowledgeCollection[],
  ) => void;
}

export function CollectionsSection({
  learners,
  collections,
  selectedCollectionId,
  onSelectCollection,
  onCollectionsChange,
}: CollectionsSectionProps) {
  const [
    selectedLearnerId,
    setSelectedLearnerId,
  ] = useState("");

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editName, setEditName] =
    useState("");

  const [
    editDescription,
    setEditDescription,
  ] = useState("");

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const effectiveLearnerId =
    selectedLearnerId ||
    learners[0]?.id ||
    "";

  async function handleCreate() {
    const trimmedName = name.trim();

    if (!effectiveLearnerId) {
      setError(
        "Спочатку потрібен профіль Learner.",
      );
      return;
    }

    if (!trimmedName) {
      setError(
        "Введіть назву колекції.",
      );
      return;
    }

    setError(null);
    setCreating(true);

    try {
      const collection =
        await createKnowledgeCollection(
          effectiveLearnerId,
          trimmedName,
          description.trim() ||
            undefined,
        );

      const updatedCollections = [
        collection,
        ...collections,
      ];

      onCollectionsChange(
        updatedCollections,
      );

      onSelectCollection(
        collection.id,
      );

      setName("");
      setDescription("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося створити колекцію.",
      );
    } finally {
      setCreating(false);
    }
  }

  function startEditing(
    collection: KnowledgeCollection,
  ) {
    setEditingId(collection.id);

    setEditName(
      collection.name,
    );

    setEditDescription(
      collection.description ?? "",
    );

    setError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  }

  async function handleSave(
    collectionId: string,
  ) {
    const trimmedName =
      editName.trim();

    if (!trimmedName) {
      setError(
        "Назва колекції не може бути порожньою.",
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated =
        await updateKnowledgeCollection(
          collectionId,
          trimmedName,
          editDescription.trim() ||
            undefined,
        );

      onCollectionsChange(
        collections.map(
          (collection) =>
            collection.id ===
            collectionId
              ? updated
              : collection,
        ),
      );

      cancelEditing();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося оновити колекцію.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    collection: KnowledgeCollection,
  ) {
    const confirmed =
      window.confirm(
        `Видалити колекцію "${collection.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    setError(null);
    setDeletingId(
      collection.id,
    );

    try {
      await deleteKnowledgeCollection(
        collection.id,
      );

      const remaining =
        collections.filter(
          (item) =>
            item.id !==
            collection.id,
        );

      onCollectionsChange(
        remaining,
      );

      if (
        selectedCollectionId ===
        collection.id
      ) {
        onSelectCollection(
          remaining[0]?.id ?? "",
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося видалити колекцію.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="dashboard-section collections-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            KNOWLEDGE COLLECTIONS
          </span>

          <h2>
            Колекції знань
          </h2>

          <p>
            Організовуйте знання за
            темами та обирайте, куди
            зберігати новий матеріал.
          </p>
        </div>
      </div>

      <div className="collection-create-card">
        <h3>
          Нова колекція
        </h3>

        {learners.length > 1 && (
          <label>
            Профіль навчання

            <select
              value={
                effectiveLearnerId
              }
              onChange={(event) =>
                setSelectedLearnerId(
                  event.target.value,
                )
              }
            >
              {learners.map(
                (learner) => (
                  <option
                    key={learner.id}
                    value={learner.id}
                  >
                    {learner.name}
                  </option>
                ),
              )}
            </select>
          </label>
        )}

        <label>
          Назва

          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            placeholder="Наприклад: Англійська мова"
          />
        </label>

        <label>
          Опис

          <input
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            placeholder="Необов'язково"
          />
        </label>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            void handleCreate()
          }
          disabled={
            creating ||
            !effectiveLearnerId ||
            !name.trim()
          }
        >
          {creating
            ? "Створюємо..."
            : "Створити колекцію"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {collections.length === 0 && (
        <div className="status-card">
          Колекцій ще немає.
        </div>
      )}

      <div className="collection-grid">
        {collections.map(
          (collection) => {
            const selected =
              collection.id ===
              selectedCollectionId;

            const editing =
              editingId ===
              collection.id;

            return (
              <article
                className={
                  selected
                    ? "collection-card selected"
                    : "collection-card"
                }
                key={collection.id}
              >
                {editing ? (
                  <>
                    <label>
                      Назва

                      <input
                        value={
                          editName
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditName(
                            event
                              .target
                              .value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Опис

                      <input
                        value={
                          editDescription
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditDescription(
                            event
                              .target
                              .value,
                          )
                        }
                      />
                    </label>

                    <div className="collection-actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          void handleSave(
                            collection.id,
                          )
                        }
                        disabled={
                          saving
                        }
                      >
                        {saving
                          ? "Зберігаємо..."
                          : "Зберегти"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={
                          cancelEditing
                        }
                        disabled={
                          saving
                        }
                      >
                        Скасувати
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="collection-card-header">
                      <div>
                        <span className="learner-label">
                          Колекція
                        </span>

                        <h3>
                          {
                            collection.name
                          }
                        </h3>
                      </div>

                      {selected && (
                        <span className="collection-selected-badge">
                          Обрано
                        </span>
                      )}
                    </div>

                    <p>
                      {collection.description ||
                        "Без опису"}
                    </p>

                    <div className="collection-actions">
                      <button
                        type="button"
                        className={
                          selected
                            ? "secondary-button"
                            : "primary-button"
                        }
                        onClick={() =>
                          onSelectCollection(
                            collection.id,
                          )
                        }
                      >
                        {selected
                          ? "Обрана"
                          : "Обрати"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          startEditing(
                            collection,
                          )
                        }
                      >
                        Перейменувати
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          void handleDelete(
                            collection,
                          )
                        }
                        disabled={
                          deletingId ===
                          collection.id
                        }
                      >
                        {deletingId ===
                        collection.id
                          ? "Видаляємо..."
                          : "Видалити"}
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}