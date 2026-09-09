ADR-006: Адаптивне навчання та інтервальне повторення

Статус: Прийнято

Контекст

У Memora для одного Knowledge може бути створено декілька Question. Вони є різними способами перевірки одного й того самого навчального матеріалу, тому не повинні створювати окремі історії інтервального повторення.

Основний навчальний стан належить Knowledge, а не окремому Question.

Система також повинна визначати, коли Knowledge має знову стати доступним для повторення.

Рішення

Адаптивне навчання реалізовано як детерміновану бізнес-логіку backend і відокремлено від генеративного AI.

Основний процес:

Questions → Answers → завершення QuizSession → результат Knowledge → LearningProgress → SM-2 → ReviewSchedule

Кожна Answer перевіряється та зберігається окремо під час QuizSession.

Створення Answer саме по собі не запускає SM-2.

Після завершення QuizSession усі Answers групуються за knowledgeId.

Для кожного Knowledge система визначає:

кількість правильних Answer;
кількість неправильних Answer.

Повторення Knowledge вважається успішним, якщо:

correctAnswers > incorrectAnswers

У поточному MVP агрегований результат перетворюється на значення якості SM-2 таким чином:

успішне повторення Knowledge → q = 4;
неуспішне повторення Knowledge → q = 2.

Таким чином, SM-2 виконується один раз для кожного Knowledge після завершення QuizSession, незалежно від кількості Question, які перевіряли це Knowledge.

Причина агрегації Answers

Одне Knowledge може мати декілька згенерованих Question.

Наприклад:

Knowledge
├── OPEN_TEXT
├── SINGLE_CHOICE
├── MULTIPLE_CHOICE
└── TRUE_FALSE

Якщо кожна Answer окремо оновлювала б SM-2, чотири Question в одній QuizSession могли б помилково збільшити repetition чотири рази.

Тому Memora розглядає їх як одну подію повторення Knowledge:

Question 1 ─┐
Question 2 ─┤
Question 3 ─┼→ результат Knowledge → одне оновлення SM-2
Question 4 ─┘

Це відповідає предметній моделі системи, де Knowledge є основною одиницею навчання.

Параметри SM-2

Початкове значення E-Factor:

2.5

Мінімальне значення E-Factor:

1.3

Для успішних повторень:

перше повторення → 1 день;
друге повторення → 6 днів;
наступні повторення → попередній interval × E-Factor.

Для неуспішного повторення:

repetition скидається до 0;
interval встановлюється на 1 день.

Після розрахунку система створює або оновлює ReviewSchedule.nextReviewAt.

Вибір Knowledge для Quiz

Question можуть потрапити до Quiz у двох випадках.

Нове Knowledge

Knowledge, яке ще не має ReviewSchedule, може бути включене до Quiz для першої перевірки.

Knowledge, для якого настав час повторення

Якщо ReviewSchedule уже існує, Knowledge доступне для Quiz за умови:

status = SCHEDULED
AND
nextReviewAt <= поточний час

Knowledge, дата наступного повторення якого ще не настала, не включається до Quiz.

Повний процес:

Нове Knowledge
      ↓
Quiz
      ↓
перевірка Knowledge
      ↓
SM-2
      ↓
ReviewSchedule
      ↓
очікування до nextReviewAt
      ↓
Knowledge знову стає доступним
LearningProgress

LearningProgress зберігає:

repetition;
easinessFactor;
interval;
correctAnswers;
incorrectAnswers;
accuracy.

correctAnswers, incorrectAnswers та accuracy відображають фактичну статистику відповідей користувача.

SM-2 repetition при цьому оновлюється один раз за агрегований результат перевірки Knowledge.

Notifications

ReviewSchedule і Notification у поточній версії є окремими компонентами.

Notification-модуль може надсилати через Telegram Bot API уже створені повідомлення зі статусом PENDING.

Автоматичне створення Notification після зміни ReviewSchedule у поточному MVP ще не реалізовано.

Поточні обмеження

У реалізації залишаються такі обмеження:

створення Answer, оновлення LearningProgress та ReviewSchedule ще не виконуються в межах однієї Prisma transaction;
для MULTIPLE_CHOICE потрібна type-specific normalization перед перевіркою відповіді;
автоматичний зв'язок ReviewSchedule → Notification ще не реалізований;
агрегований результат Knowledge у поточному MVP використовує бінарну оцінку успішності, а не повну шкалу SM-2 від 0 до 5.
Наслідки

Переваги:

декілька Question можуть перевіряти одне Knowledge без штучного збільшення repetition;
ReviewSchedule реально визначає момент, коли Knowledge знову доступне для повторення;
логіка інтервального повторення залишається детермінованою та незалежною від AI;
зміна формулювання Question не призводить до втрати навчальної історії Knowledge.

У майбутньому можливо перейти до детальнішої оцінки якості повторення або порівняти SM-2 з FSRS після накопичення достатнього обсягу реальних навчальних даних.