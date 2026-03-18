# Character Replacement Guide — Trash Dash

Как устроена система персонажей и как заменить/добавить нового персонажа.

---

## 1. Текущие персонажи

### Играбельные (в Addressables)

| Персонаж | Папка | Модель | Цена |
|----------|-------|--------|------|
| **Trash Cat** | `Assets/Bundles/Characters/Cat/` | `Assets/Models/Cat.fbx` | Бесплатный |
| **Rubbish Raccoon** | `Assets/Bundles/Characters/Raccoon/` | `Assets/Models/Racoon.fbx` | 50000 / 20 premium |

### Неиграбельные (есть модели, но не подключены)

| Персонаж | Модель | Контроллер | Статус |
|----------|--------|-----------|--------|
| Dog | `Assets/Models/` (нет .fbx в репо) | `Dog.controller` | Только анимации: Dog_Idle, Dog_Run, Dog_Death |
| Rat | `Assets/Models/Rat.fbx` | `Rat.controller` | Только анимации: Rat_Run, Rat_Death |

### Файлы каждого персонажа

**Cat (полный набор):**
```
Assets/Models/Cat.fbx                          — модель (430 KB)
Assets/Models/CatBase.fbx                      — базовая модель с ригом (531 KB)
Assets/Textures/CatAlbedo.tif                  — текстура
Assets/Bundles/Characters/Cat/character.prefab  — игровой префаб
Assets/Animation/Animators/CharacterAnimation.controller — аниматор (общий)
Assets/Animation/Cat_*.fbx                     — 19 анимационных файлов
```

**Raccoon:**
```
Assets/Models/Racoon.fbx                       — модель (366 KB, NB: "Racoon" без "c")
Assets/Models/RaccoonBase.fbx                  — базовая модель с ригом (462 KB)
Assets/Textures/RacoonAlbedo.tif               — текстура
Assets/Bundles/Characters/Raccoon/character.prefab — игровой префаб
Assets/Animation/Animators/CharacterAnimation.controller — тот же аниматор
```

### Тип Rig

**Все модели используют Generic rig (animationType: 2)**

| Модель | animationType | importAnimation |
|--------|---------------|-----------------|
| Cat.fbx | 2 (Generic) | 0 (нет) |
| CatBase.fbx | 2 (Generic) | 0 (нет) |
| Racoon.fbx | 2 (Generic) | 0 (нет) |
| RaccoonBase.fbx | 2 (Generic) | 0 (нет) |
| Rat.fbx | 2 (Generic) | 0 (нет) |
| Cat_RunShort.fbx | 2 (Generic) | 1 (да) |
| Cat_Jump.fbx | 2 (Generic) | 1 (да) |

> **Важно:** Generic rig означает что анимации привязаны к конкретной иерархии костей. Humanoid retargeting (автоматическое применение анимаций одного персонажа к другому) **НЕ работает** с Generic rig. Новый персонаж должен иметь **ту же иерархию костей** или свой набор анимаций.

### Анимации Cat (19 файлов)

| Файл | Состояние | Loop | Frames |
|------|-----------|------|--------|
| `Cat_Start.fbx` | runStart | Нет | короткий |
| `Cat_RunShort.fbx` | runLoop (blend) | Да | 0-10 |
| `Cat_RunShort2.fbx` | runLoop (blend) | Да | — |
| `Cat_RunLong.fbx` | runLoop (blend) | Да | — |
| `Cat_Jump.fbx` | Jump | Нет | 0-18 |
| `Cat_Slide.fbx` | Sliding | Нет | — |
| `Cat_HitWall1.fbx` | Hit | Нет | — |
| `Cat_HitHighWall.fbx` | Hit (вариант) | Нет | — |
| `Cat_Death.fbx` | Death_1 | Нет | — |
| `Cat_Death2.fbx` | Death_2 | Нет | — |
| `Cat_Death3.fbx` | Death_3 | Нет | — |
| `Cat_Falling.fbx` | Falling | Нет | — |
| `Cat_Idle1.fbx` | Idle (random) | Да | 0-140 |
| `Cat_Idle2.fbx` | Idle (random) | Да | — |
| `Cat_Idle4.fbx` | Idle (random) | Да | — |
| `Cat_IdleHappy.fbx` | Idle (random) | Да | — |
| `Cat_IdleSad.fbx` | Idle (random) | Да | — |
| `Cat_HappyDance.fbx` | Idle (random) | Да | — |
| `Cat_ForbiddenDance.fbx` | Idle (random) | Да | — |

---

## 2. Animator

### Animator Controller

**Файл:** `Assets/Animation/Animators/CharacterAnimation.controller`
**Используется:** обоими играбельными персонажами (Cat и Raccoon)

### Параметры аниматора

| Параметр | Тип | Назначение | Кто устанавливает |
|----------|-----|-----------|-------------------|
| `Dead` | Bool | Персонаж мёртв | `GameState.cs` (строка ~221) |
| `Moving` | Bool | Бежит | `CharacterInputController.StartRunning()` / `StopMoving()` |
| `Jumping` | Bool | В прыжке | `CharacterInputController.Jump()` / `StopJumping()` |
| `JumpSpeed` | Float | Скорость анимации прыжка/слайда | `CharacterInputController.Jump()` / `Slide()` |
| `Sliding` | Bool | Скользит | `CharacterInputController.Slide()` / `StopSliding()` |
| `Hit` | Trigger | Получил удар | `CharacterCollider.OnTriggerEnter()` |
| `RandomIdle` | Int | Выбор случайного idle (0-4) | `RandomAnimation.cs` (StateMachineBehaviour) |
| `RandomDeath` | Int | Выбор случайной смерти (0-1) | `RandomAnimation.cs` |
| `runStart` | — | Начальное состояние (Play) | `CharacterInputController.StartRunning()` |

### Граф состояний

```
                    ┌─────────────┐
                    │  runStart   │ ← точка входа
                    └──────┬──────┘
                           ↓ (анимация кончилась)
                    ┌─────────────┐
              ┌─────│  runLoop    │─────┐
              │     └──────┬──────┘     │
              │            │            │
     Jumping=true    Hit (trigger)  Sliding=true
              │            │            │
              ↓            ↓            ↓
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │   Jump   │ │   Hit    │ │ Sliding  │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │            │            │
        Jumping=false Dead=true? Sliding=false
             │        ↙       ↘       │
             ↓       ↓         ↓      ↓
        → runLoop  Death    → runLoop
                  (конец)

        ┌─────────────┐
        │ Idle (5 шт) │ ← когда Moving=false
        │ RandomIdle  │
        └─────────────┘
```

### Код управления анимациями

**CharacterInputController.cs** — основной контроллер:
```csharp
// Хеши параметров (для производительности)
static int s_DeadHash = Animator.StringToHash("Dead");
static int s_RunStartHash = Animator.StringToHash("runStart");
static int s_MovingHash = Animator.StringToHash("Moving");
static int s_JumpingHash = Animator.StringToHash("Jumping");
static int s_JumpingSpeedHash = Animator.StringToHash("JumpSpeed");
static int s_SlidingHash = Animator.StringToHash("Sliding");
```

**CharacterCollider.cs:**
```csharp
static int s_HitHash = Animator.StringToHash("Hit");
// Вызывается при столкновении с препятствием:
controller.character.animator.SetTrigger(s_HitHash);
```

**GameState.cs:**
```csharp
// При смерти:
chrCtrl.character.animator.SetBool(s_DeadHash, true);
```

---

## 3. Источники бесплатных персонажей

### А. Mixamo (mixamo.com)

**Что это:** Библиотека Adobe с бесплатными 3D-персонажами и анимациями.

**Как скачать персонажа:**
1. Зайти на [mixamo.com](https://www.mixamo.com), войти (бесплатно)
2. Вкладка **Characters** → выбрать персонажа
3. Download → Format: **FBX for Unity (.fbx)** → Pose: **T-Pose**

**Как скачать анимации:**
1. Вкладка **Animations** → поиск нужной анимации
2. Настроить параметры (скорость, зеркалирование)
3. Download → Format: **FBX for Unity (.fbx)** → Skin: **Without Skin** (кроме первой — там With Skin)

**Маппинг анимаций Trash Dash → Mixamo:**

| Состояние в игре | Что искать на Mixamo | Настройки |
|-----------------|---------------------|-----------|
| runStart | "Start Running" или "Standing To Sprint" | — |
| runLoop | "Running" или "Sprint" | Loop: On |
| Jump | "Jump" или "Running Jump" | Loop: Off |
| Sliding | "Baseball Slide" или "Slide" | Loop: Off |
| Hit | "Hit Reaction" или "Stumble" | Loop: Off |
| Death | "Dying" или "Death" | Loop: Off |
| Idle | "Idle" или "Breathing Idle" | Loop: On |

> **Проблема:** Mixamo персонажи используют **Humanoid rig**, а Trash Dash использует **Generic rig**. Для совместимости нужно либо:
> - Конвертировать Mixamo-анимации в Generic (через Unity: FBX Import → Rig → Generic)
> - Либо переделать CharacterAnimation.controller под Humanoid

### Б. Unity Asset Store

Искать: "free character animated" в [assetstore.unity.com](https://assetstore.unity.com)

**Популярные бесплатные:**
- "Starter Assets - Third Person Character Controller" (Unity)
- "Low Poly Animated Animals" (различные)
- "Simple Characters" (Synty Studios free packs)

**Совместимость:** Если пакет использует Humanoid rig → нужна конвертация в Generic (или наоборот — перевести проект на Humanoid).

### В. Sketchfab

1. Зайти на [sketchfab.com](https://sketchfab.com)
2. Фильтры: Animated → Downloadable → Free → Category: Characters
3. Скачать в формате FBX или glTF
4. Импортировать в Unity

> **Внимание:** Модели со Sketchfab часто не имеют анимаций или имеют другую иерархию костей. Нужно будет создавать анимации отдельно.

---

## 4. Пошаговая инструкция замены персонажа

### Шаг 1: Подготовка модели

1. Создать папку: `Assets/Models/Characters/NewCharacter/`
2. Положить туда:
   - `NewCharacter.fbx` — модель
   - `NewCharacterAlbedo.tif` (или .png) — текстура
3. В Unity: выбрать `NewCharacter.fbx` → Inspector:
   - **Rig tab:** Animation Type: **Generic** (ОБЯЗАТЕЛЬНО Generic, как у Cat)
   - Avatar Definition: Create From This Model
   - Root node: выбрать корневую кость (hips/pelvis)
   - Apply
4. **Model tab:** Scale Factor — подобрать под размер Cat (~0.01 для Mixamo моделей)

### Шаг 2: Подготовка анимаций

**Вариант A — использовать анимации Cat (если скелет совпадает):**

Это работает ТОЛЬКО если у нового персонажа **идентичная иерархия костей** с Cat. На практике это маловероятно.

**Вариант B — свои анимации (рекомендуется):**

1. Скачать анимации с Mixamo (см. маппинг в разделе 3)
2. Положить все .fbx в `Assets/Animation/NewCharacter/`
3. Для каждого .fbx:
   - Inspector → Rig → Animation Type: **Generic**
   - Avatar Definition: **Copy From Other Avatar** → выбрать avatar от NewCharacter.fbx
   - Apply
4. Inspector → Animation tab:
   - Для looping-анимаций (run, idle): ✅ Loop Time
   - Для одноразовых (jump, death, hit): ❌ Loop Time

**Вариант C — создать новый Animator Controller:**

1. Правый клик в Project → Create → Animator Controller
2. Открыть Animator окно (Window → Animation → Animator)
3. Создать состояния:
   - `runStart` — одноразовая анимация старта
   - `runLoop` — зацикленный бег
   - `Jump` — прыжок
   - `Sliding` — подкат
   - `Hit` — реакция на удар
   - `Death` — смерть (минимум 1 вариант)
   - `Idle` — ожидание (минимум 1 вариант)
4. Создать параметры (ИМЕННО с этими именами):
   - `Dead` (Bool)
   - `Moving` (Bool)
   - `Jumping` (Bool)
   - `JumpSpeed` (Float)
   - `Sliding` (Bool)
   - `Hit` (Trigger)
5. Настроить переходы как в графе из раздела 2

> **Самый простой путь:** Дублировать `CharacterAnimation.controller` (Ctrl+D), заменить в нём анимационные клипы на новые через Animator окно.

### Шаг 3: Создание префаба

Структура префаба персонажа (обязательные компоненты):

```
NewCharacter (GameObject)
├── Animator
│   ├── Controller: CharacterAnimation.controller (или новый)
│   └── Avatar: NewCharacter Avatar
├── Character.cs (скрипт)
│   ├── characterName: "New Character"
│   ├── cost: 0 (или цена)
│   ├── premiumCost: 0
│   ├── animator: → ссылка на Animator выше
│   ├── icon: → спрайт для UI
│   ├── jumpSound: → AudioClip
│   ├── hitSound: → AudioClip
│   └── deathSound: → AudioClip
├── AudioSource (для звуков)
└── [Меш персонажа как дочерний объект]
```

**Как создать:**
1. Перетащить `NewCharacter.fbx` в сцену
2. Добавить компонент `Character` (Add Component → Character)
3. Заполнить все поля (имя, иконку, звуки)
4. Убедиться что Animator настроен (контроллер + аватар)
5. Перетащить из Hierarchy в `Assets/Bundles/Characters/NewCharacter/` → создастся префаб
6. Удалить из сцены

### Шаг 4: Подключение к игре

**4a. Добавить в Addressables:**
1. Window → Asset Management → Addressables → Groups
2. Найти группу "Characters"
3. Перетащить `Assets/Bundles/Characters/NewCharacter/character.prefab` в эту группу
4. Убедиться что Label: **"characters"** установлен

**Или вручную** — отредактировать `Assets/AddressableAssetsData/AssetGroups/Characters.asset`:
- Добавить новый entry с m_GUID нового префаба
- Добавить label "characters"

**4b. Добавить персонажа в PlayerData (чтобы он был доступен):**

В `Assets/Scripts/PlayerData.cs` найти метод `NewSave()` — там создаётся список начальных персонажей:
```csharp
// Добавить имя нового персонажа в список characters
instance.characters.Add("New Character");
```

Или — если персонаж покупается в магазине, он добавится автоматически через `ShopCharacterList.cs`.

**4c. Пересобрать Addressables и WebGL билд.**

---

## 5. Можно ли заменить персонажа БЕЗ Unity Editor?

### Что можно сделать через файлы:

| Действие | Через файлы? | Как |
|----------|-------------|-----|
| Заменить текстуру | ✅ Да | Заменить .tif/.png файл с тем же именем |
| Заменить .fbx модель | ⚠️ Частично | Заменить файл, но .meta нужен корректный |
| Настроить Import Settings | ❌ Нет | .meta файл содержит настройки, но GUID аватара генерируется Unity |
| Создать Animator Controller | ❌ Нет | Бинарный формат, только через Unity Editor |
| Создать префаб | ❌ Нет | YAML-формат, но ссылки (fileID, guid) генерируются Unity |
| Добавить в Addressables | ⚠️ Частично | Можно отредактировать .asset файл, но GUID нужно знать |
| Собрать билд | ❌ Нет | Требуется Unity для компиляции C# и сборки WebGL |

### Шаги которые ОБЯЗАТЕЛЬНО требуют Unity Editor GUI:

1. **Настройка Rig** на импортированной модели (Inspector → Rig → Generic/Humanoid)
2. **Создание/редактирование Animator Controller** (окно Animator)
3. **Настройка анимационных клипов** (Loop Time, Root Motion)
4. **Создание префаба** (перетаскивание из Hierarchy в Project)
5. **Настройка компонента Character** (заполнение полей в Inspector)
6. **Добавление в Addressables Group** (окно Addressables Groups)
7. **Сборка Addressable bundles** (Build → Addressables)
8. **Сборка WebGL** (Build Settings → Build)

### Вывод

**Полная замена персонажа без Unity Editor невозможна.** Минимум нужно один раз открыть проект в Unity для:
- Импорта и настройки модели/анимаций
- Создания префаба
- Настройки Addressables
- Пересборки билда

Однако, если просто заменить **текстуру** (цвет/рисунок персонажа) — это можно сделать заменой файла без Unity.

---

## Справочник файлов

### Скрипты персонажей
```
Assets/Scripts/Characters/Character.cs               — данные персонажа (ScriptableObject-like MonoBehaviour)
Assets/Scripts/Characters/CharacterDatabase.cs        — загрузка из Addressables, словарь по имени
Assets/Scripts/Characters/CharacterInputController.cs — управление, анимации, прыжки, слайды
Assets/Scripts/Characters/CharacterCollider.cs        — столкновения, монеты, урон, смерть
Assets/Scripts/Characters/CharacterAccessories.cs     — данные аксессуаров
Assets/Scripts/Characters/RandomAnimation.cs          — случайный выбор idle/death анимации
Assets/Scripts/Characters/RestartRunning.cs            — перезапуск бега после hit-анимации
```

### Модели
```
Assets/Models/Cat.fbx          — рендер-модель кота
Assets/Models/CatBase.fbx      — базовый скелет кота
Assets/Models/Racoon.fbx       — рендер-модель енота (NB: "Racoon" в файле)
Assets/Models/RaccoonBase.fbx  — базовый скелет енота
Assets/Models/Rat.fbx          — модель крысы (не играбелен)
```

### Анимации
```
Assets/Animation/Cat_Start.fbx          Assets/Animation/Cat_RunShort.fbx
Assets/Animation/Cat_RunShort2.fbx      Assets/Animation/Cat_RunLong.fbx
Assets/Animation/Cat_Jump.fbx           Assets/Animation/Cat_Slide.fbx
Assets/Animation/Cat_HitWall1.fbx       Assets/Animation/Cat_HitHighWall.fbx
Assets/Animation/Cat_Death.fbx          Assets/Animation/Cat_Death2.fbx
Assets/Animation/Cat_Death3.fbx         Assets/Animation/Cat_Falling.fbx
Assets/Animation/Cat_Idle1.fbx          Assets/Animation/Cat_Idle2.fbx
Assets/Animation/Cat_Idle4.fbx          Assets/Animation/Cat_IdleHappy.fbx
Assets/Animation/Cat_IdleSad.fbx        Assets/Animation/Cat_HappyDance.fbx
Assets/Animation/Cat_ForbiddenDance.fbx
```

### Аниматоры
```
Assets/Animation/Animators/CharacterAnimation.controller  — основной (Cat + Raccoon)
Assets/Animation/Animators/Dog.controller                  — собака (неиспользуемый)
Assets/Animation/Animators/Rat.controller                  — крыса (неиспользуемый)
```

### Префабы
```
Assets/Bundles/Characters/Cat/character.prefab      — играбельный кот
Assets/Bundles/Characters/Raccoon/character.prefab  — играбельный енот
```
