# UI Guide — Trash Dash

Полное руководство по UI-системе игры: структура, стили, шрифты, кнопки и инструкции по кастомизации.

---

## 1. Структура UI

### Сцена Start.unity — Стартовый экран

**Canvas** (Screen Space - Overlay, 720x1280)

| GameObject | Скрипт | Описание |
|-----------|--------|----------|
| StartButton | `StartButton.cs` | Кнопка старта (click anywhere) |
| └ StartText | — | Текст "START" (LuckiestGuy, 90px) |
| LogoImage | — | Логотип Trash Dash |
| UnityURLBackground | — | Полупрозрачный фон (отключён) |
| UnityURLButton | `OpenURL.cs` (отключён) | Кнопка ссылки (отключена) |

### Сцена Main.unity — Игровые экраны

В Main.unity работают несколько UI-состояний, управляемых через `GameManager` (FSM):

#### Loadout (выбор персонажа)
**Скрипт:** `LoadoutState.cs`

| GameObject | Компонент | Описание |
|-----------|-----------|----------|
| InventoryCanvas | Canvas | Корневой канвас |
| CharNameDisplay | Text | Имя персонажа |
| CharSelect | RectTransform | Стрелки выбора персонажа (← →) |
| ThemeNameDisplay | Text | Название темы (Day/Night) |
| ThemeSelect | RectTransform | Стрелки выбора темы |
| ThemeIcon | Image | Превью темы (DayPreview / NightPreview) |
| PowerupSelect | RectTransform | Выбор powerup |
| PowerupIcon | Image | Иконка текущего powerup |
| PowerupCount | Text | Количество расходников |
| RunButton | Button | Кнопка "Run!" / "Loading..." |
| Leaderboard | `Leaderboard.cs` | Таблица лидеров |
| MissionPopup | `MissionUI.cs` | Попап миссий |
| TutorialBlocker | GameObject | Блокировка до прохождения туториала |
| SkyMeshFilter | MeshFilter | 3D-фон неба |
| UIGroundFilter | MeshFilter | 3D-фон земли |

#### Game (геймплей)
**Скрипт:** `GameState.cs`

| GameObject | Компонент | Описание |
|-----------|-----------|----------|
| GameCanvas | Canvas | HUD во время игры |
| ScoreText | Text | "SCORE: 710" (LuckiestGuy, 36-56px) |
| DistanceText | Text | "654m" |
| MultiplierText | Text | "x1" / "x2" |
| CoinText | Text | Счётчик fishbones |
| PremiumText | Text | Счётчик premium |
| LifeRectTransform | RectTransform | Контейнер сердечек (Image[]) |
| PauseButton | Button | Спрайт: PauseButton (85x84) |
| PauseMenu | RectTransform | Меню паузы |
| PowerupZone | RectTransform | Контейнер активных powerup-иконок |
| GameOverPopup | GameObject | Попап "GET ANOTHER CHANCE?" |
| PremiumForLifeButton | Button | Продолжить за premium |
| CountdownText | Text | Обратный отсчёт 4-3-2-1 |

#### GameOver (экран смерти)
**Скрипт:** `GameOverState.cs`

| GameObject | Компонент | Описание |
|-----------|-----------|----------|
| GameOverCanvas | Canvas | Канвас Game Over |
| MiniLeaderboard | `Leaderboard.cs` | Краткая таблица лидеров |
| └ PlayerEntry | `HighscoreUI.cs` | Строка игрока (имя + счёт) |
| └ InputName | InputField | Ввод имени |
| FullLeaderboard | `Leaderboard.cs` | Полная таблица |
| MissionPopup | `MissionUI.cs` | Попап завершённых миссий |
| AddButton | GameObject | Кнопка рекламы |

### Сцена Shop.unity — Магазин
**Скрипт:** `ShopUI.cs`

| GameObject | Компонент | Описание |
|-----------|-----------|----------|
| ShopCanvas | Canvas | Корневой канвас магазина |
| CoinCounter | Text | Отображение fishbones |
| PremiumCounter | Text | Отображение premium |
| ContentContainer | ScrollRect | Прокручиваемый контент |
| ItemsListButton | Button | Вкладка расходников |
| CharactersButton | Button | Вкладка персонажей |
| ThemesButton | Button | Вкладка тем |
| AccessoriesButton | Button | Вкладка аксессуаров |
| CloseButton | Button | Закрыть магазин (спрайт: CloseButton) |
| CheatButton | Button | Дебаг-кнопка (+1M монет) |

---

## 2. Цвета и стиль

### Цветовая палитра

| Цвет | RGBA | Hex | Где используется |
|------|------|-----|-----------------|
| Пурпурно-серый (основной текст) | (0.365, 0.349, 0.404, 1) | `#5D5967` | Все тексты: score, имена, заголовки |
| Тёмно-серый (акцентный текст) | (0.196, 0.196, 0.196, 1) | `#323232` | Названия товаров в магазине |
| Белый | (1, 1, 1, 1) | `#FFFFFF` | Кнопки, заголовки секций |
| Почти белый | (0.978, 0.978, 0.978, 1) | `#FAFAFA` | Счётчик количества товаров |
| Светло-серый (фон) | (0.817, 0.805, 0.824, 1) | `#D0CDD2` | Фон контейнера магазина |
| Полупрозрачный пурпурный | (0.717, 0.690, 0.854, 0.37) | `#B7B0DA5F` | Фон powerup-иконок, слайдеры |
| Зелёный | (0, 1, 0, 1) | `#00FF00` | Заполнение слайдера powerup |
| Полупрозрачный белый | (1, 1, 1, 0.384) | `#FFFFFF62` | Фон ценников |

### Состояния кнопок

| Состояние | RGBA | Описание |
|----------|------|----------|
| Normal | (1, 1, 1, 1) | Обычное |
| Highlighted | (0.961, 0.961, 0.961, 1) | Hover |
| Pressed | (0.784, 0.784, 0.784, 1) | Нажатие |
| Disabled | (0.603, 0.603, 0.603, 0.33) | Неактивна |

### Спрайты и текстуры

**Расположение:** `Assets/UI/`

| Файл | Размер | Описание |
|------|--------|----------|
| `UISpritesheet.png` | 806 KB, 2048x2048 | Основной спрайтшит (54 спрайта) |
| `Logo.png` | 383 KB | Логотип Trash Dash |
| `StoreIcon.png` | 859 KB | Иконка магазина |
| `UIBorderTransparent.png` | 18 KB | Прозрачная рамка |
| `Unity.png` | 33 KB | Логотип Unity |

### Спрайтшит UISpritesheet.png — все 54 спрайта

**Кнопки:**
| Спрайт | ID | Размер | Назначение |
|--------|-----|--------|-----------|
| StartButton | 21300000 | 495x158 | Кнопка старта |
| StartButtonPressed | 21300106 | 496x158 | Старт (нажата) |
| UIButton | 21300098 | 64x63 | Стандартная кнопка (9-slice) |
| UIButtonOrange | 21300092 | 64x64 | Оранжевая кнопка |
| UIButtonNoShadow | 21300094 | 64x59 | Кнопка без тени |
| UIButtonOrangeNoShadow | 21300100 | 64x59 | Оранжевая без тени |
| UIButtonBG | 21300096 | 64x59 | Фон кнопки |
| PauseButton | 21300048 | 85x84 | Пауза |
| PauseMenu | 21300066 | 415x87 | Фон меню паузы |
| PauseResume | 21300068 | 415x87 | Кнопка продолжить |
| CloseButton | 21300024 | 84x85 | Закрыть |
| ArrowButtonDefault | 21300078 | 157x200 | Стрелка (норма) |
| ArrowButtonShadow | 21300080 | 157x200 | Стрелка (тень) |
| ArrowButtonGrey | 21300082 | 157x200 | Стрелка (неактивна) |

**Иконки:**
| Спрайт | ID | Размер | Назначение |
|--------|-----|--------|-----------|
| MissionsIcon | 21300002 | 123x123 | Иконка миссий |
| StoreIcon | 21300004 | 159x136 | Иконка магазина |
| Settings | 21300006 | 123x123 | Настройки |
| LeaderboardIcon | 21300008 | 123x116 | Таблица лидеров |
| SettingIcone | 21300076 | 56x57 | Иконка настроек (малая) |
| Shop | 21300044 | 63x57 | Магазин (вкладка) |
| Missions | 21300046 | 60x56 | Миссии (вкладка) |
| Leaderboard | 21300042 | 63x61 | Лидерборд (вкладка) |
| LifeHeart | 21300050 | 46x42 | Сердечко жизни |
| FishboneIcone | 21300062 | 58x30 | Иконка fishbone |
| PremiumIcone | 21300060 | 66x67 | Иконка premium |
| NoItem | 21300070 | 105x105 | Пустой слот |

**Powerup-иконки:**
| Спрайт | ID | Назначение |
|--------|-----|-----------|
| PowerUpStar | 21300016 | Звезда |
| PowerUpHeart | 21300018 | Доп. жизнь |
| PowerUpMagnet | 21300020 | Магнит |
| PowerUpScoreMult | 21300022 | Множитель очков |
| MagnetPowerup | 21300028 | Магнит (альт) |
| MultiplierPowerup | 21300030 | Множитель (альт) |
| InvicibilityPowerup | 21300032 | Неуязвимость |
| LifePowerup | 21300034 | Жизнь (альт) |

**Фоны и рамки (9-slice):**
| Спрайт | ID | Размер | Border (L,B,R,T) |
|--------|-----|--------|-------------------|
| Background | 21300040 | 85x84 | 17,17,17,17 |
| GameUIBackground | 21300064 | 181x70 | 17,17,17,17 |
| ActivePowerUpBackground | 21300058 | 85x110 | 18,18,16,18 |
| UIBorderFilled01 | 21300084 | 64x64 | 10,15,10,10 |
| UIBorderFilledRed | 21300086 | 64x64 | 10,14,10,10 |
| UIBorderFilledOrange | 21300102 | 64x64 | 9,14,9,9 |
| UIBorderLightGrey | 21300104 | 64x64 | 9,14,9,9 |

**Прочее:**
| Спрайт | ID | Назначение |
|--------|-----|-----------|
| DayPreview | 21300036 | Превью дневной темы |
| NightPreview | 21300038 | Превью ночной темы |
| CatIcone | 21300054 | Иконка кота |
| RacoonIcone | 21300056 | Иконка енота |
| WorkHat/FancyHat/PartyHat/WorkerHat | — | Иконки аксессуаров |
| HandleSlider | 21300072 | Ползунок слайдера |
| SliderBG | 21300074 | Фон слайдера |
| UISliderBG | 21300088 | Фон слайдера (альт) |
| UISliderFill | 21300090 | Заполнение слайдера |
| TimeBar | 21300052 | Полоска таймера |

---

## 3. Шрифты

### Используемый шрифт

| Свойство | Значение |
|----------|----------|
| Файл | `Assets/Font/LuckiestGuy.ttf` |
| GUID | `ab2cfde409d710b47b0b502877abb479` |
| Тип | TrueType, обычный `UnityEngine.UI.Text` (НЕ TextMeshPro) |
| Лицензия | `Assets/Font/FontLicense.txt` |

### Размеры шрифта по элементам

| Элемент | Размер | Best Fit |
|---------|--------|----------|
| Заголовки секций (Header) | 42px | Нет |
| Названия товаров | 48px | Нет |
| Score / Leaderboard | 36px | Да (min 22, max 56) |
| Ценники | 28px | Нет |
| Счётчики валют | 30px | Нет |
| Текст кнопки "BUY" | 48px | Нет |
| Счётчик количества "x1" | 60px | Нет |
| Текст "START" | 90px | Нет |

### Как заменить шрифт

Проект использует обычный `UnityEngine.UI.Text`, НЕ TextMeshPro:

1. Скачать .ttf (например с [fonts.google.com](https://fonts.google.com))
2. Положить файл в `Assets/Font/`
3. В каждом UI-объекте с Text компонентом:
   - Inspector → Text → Font → перетащить новый .ttf
4. Или глобально: найти все ссылки на LuckiestGuy через Edit → Find References

> **Внимание:** проект НЕ использует TextMeshPro для UI. Если хотите перейти на TMP — нужно заменить все `Text` компоненты на `TextMeshProUGUI` и обновить скрипты (все переменные типа `Text` → `TMP_Text`).

---

## 4. Кнопки

### Start.unity

| Кнопка | Текст | OnClick | Спрайт normal | Спрайт pressed |
|--------|-------|---------|---------------|----------------|
| StartButton | "START" | `StartButton.StartGame()` + `AudioSource.Play()` | StartButton (495x158) | StartButtonPressed (496x158) |

### Main.unity — Loadout

| Кнопка | Текст | OnClick | Спрайт |
|--------|-------|---------|--------|
| RunButton | "Run!" / "Loading..." | `LoadoutState.StartGame()` | UIButton |
| CharSelect ← | — | `LoadoutState.ChangeCharacter(-1)` | ArrowButtonDefault |
| CharSelect → | — | `LoadoutState.ChangeCharacter(1)` | ArrowButtonDefault |
| ThemeSelect ← | — | `LoadoutState.ChangeTheme(-1)` | ArrowButtonDefault |
| ThemeSelect → | — | `LoadoutState.ChangeTheme(1)` | ArrowButtonDefault |
| StoreButton | — | `LoadoutState.GoToStore()` | StoreIcon |
| LeaderboardButton | — | `Leaderboard.Open()` | LeaderboardIcon |
| MissionsButton | — | `MissionUI.CallOpen()` | MissionsIcon |
| SettingsButton | — | `SettingPopup.Open()` | Settings |

### Main.unity — Game HUD

| Кнопка | OnClick | Спрайт |
|--------|---------|--------|
| PauseButton | `GameState.Pause()` | PauseButton (85x84) |
| ResumeButton | `GameState.Resume()` | PauseResume (415x87) |
| PremiumForLifeButton | `GameState.PremiumForLife()` | UIButton |
| GameOverButton | `GameState.GameOver()` | UIButton |

### Main.unity — GameOver

| Кнопка | Текст | OnClick |
|--------|-------|---------|
| GoToLoadout | — | `GameOverState.GoToLoadout()` |
| RunAgain | — | `GameOverState.RunAgain()` |
| OpenLeaderboard | — | `GameOverState.OpenLeaderboard()` |
| GoToStore | — | `GameOverState.GoToStore()` |

### Shop.unity

| Кнопка | OnClick | Спрайт |
|--------|---------|--------|
| ItemsListButton | `ShopUI.OpenItemList()` | — |
| CharactersButton | `ShopUI.OpenCharacterList()` | — |
| ThemesButton | `ShopUI.OpenThemeList()` | — |
| AccessoriesButton | `ShopUI.OpenAccessoriesList()` | — |
| CloseButton | `ShopUI.CloseScene()` | CloseButton (84x85) |
| BuyButton (в ItemEntry) | динамический | UIButton (normal), ActivePowerUpBackground (disabled) |

---

## 5. Фоны

| Файл | Размер файла | Разрешение | Где используется |
|------|-------------|------------|-----------------|
| `Assets/UI/Logo.png` | 383 KB | ~720x720 | Start.unity — логотип |
| `Assets/UI/StoreIcon.png` | 859 KB | ~512x512 | Иконка магазина |
| `Assets/UI/UISpritesheet.png` | 806 KB | 2048x2048 | Все UI-элементы |
| `Assets/UI/UIBorderTransparent.png` | 18 KB | ~128x128 | Прозрачная рамка |
| `Assets/Models/Daytime/Sky.fbx` | — | — | 3D-фон неба (не UI) |

**3D-фоны** (не текстуры — это 3D-модели):
- Небо: `ThemeData.skyMesh` — MeshFilter в сцене
- Земля: `ThemeData.UIGroundMesh` — MeshFilter в Loadout

---

## 6. Пошаговые инструкции для новичка

### А. Смена цветовой схемы

**Способ 1 — Через Inspector:**
1. Открыть сцену (Main.unity / Start.unity / Shop.unity)
2. В Hierarchy найти нужный UI-объект (например `ScoreText`)
3. В Inspector найти компонент `Image` или `Text`
4. Кликнуть на поле `Color` → выбрать новый цвет в Color Picker
5. Сохранить сцену (Ctrl+S)

**Способ 2 — Замена спрайта:**
1. Подготовить новую картинку (PNG, прозрачный фон)
2. Перетащить в `Assets/UI/`
3. В Inspector картинки: Texture Type → `Sprite (2D and UI)`
4. Apply
5. На UI-объекте: Image → Source Image → перетащить новый спрайт

**Что можно сломать:**
- Не меняйте 9-slice border у спрайтов с рамками — кнопки растянутся криво
- Если меняете цвет текста на светлый — убедитесь что фон тёмный (и наоборот)
- Sprite Mode должен быть `Single` для отдельных картинок, `Multiple` для спрайтшита

### Б. Смена шрифта

1. Скачать .ttf шрифт (например с [fonts.google.com](https://fonts.google.com))
2. Перетащить .ttf файл в `Assets/Font/`
3. Для **каждого** Text компонента в сценах:
   - Кликнуть на объект в Hierarchy
   - Inspector → Text (Script) → Font → перетащить новый .ttf
4. Проверить что текст не обрезается (может понадобиться уменьшить Font Size)
5. Сохранить все сцены

**Что можно сломать:**
- Разные шрифты имеют разную ширину букв — текст может не влезать в кнопки
- Включите `Best Fit` (Min/Max Size) если текст обрезается
- Не забудьте поменять шрифт и в **префабах** (`Assets/Prefabs/UI/`), не только в сценах

### В. Перемещение и изменение размера кнопок

1. Кликнуть на кнопку в Hierarchy
2. **Способ 1 — мышкой:** Переключить на Rect Tool (T), перетащить в Scene View
3. **Способ 2 — точные числа:** Inspector → Rect Transform:
   - `Pos X`, `Pos Y` — позиция
   - `Width`, `Height` — размер
   - `Anchors` — привязка к краям экрана

**Anchor Presets (важно для адаптивности):**
- Кликнуть на квадрат anchor в Inspector
- Выбрать пресет:
  - Top-Center — кнопка привязана к верху
  - Bottom-Stretch — растянута по низу
  - Center-Center — по центру экрана

**Что можно сломать:**
- Не меняйте Anchors у элементов в Layout Group (Horizontal/Vertical) — они управляются автоматически
- Если кнопка в Scroll View — перемещение не поможет, нужно менять порядок в Hierarchy

### Г. Смена фона / логотипа

1. Подготовить картинку:
   - Логотип: PNG с прозрачным фоном, ~720x720 px
   - Фон: PNG/JPG, разрешение под целевой экран
2. Перетащить в `Assets/UI/`
3. В Inspector картинки:
   - Texture Type: `Sprite (2D and UI)`
   - Sprite Mode: `Single`
   - Apply
4. В сцене найти Image-объект (например LogoImage)
5. Inspector → Image → Source Image → перетащить новый спрайт
6. При необходимости: ✅ Preserve Aspect чтобы не растягивалось
7. Сохранить сцену

**Что можно сломать:**
- Слишком большие текстуры (>2048px) замедлят загрузку WebGL
- Не забудьте про Alpha Is Transparency в настройках импорта
- Если заменяете спрайт в спрайтшите — нужно пересоздать весь UISpritesheet.png в графическом редакторе и обновить Sprite Editor

### Д. Замена спрайтов в спрайтшите

UISpritesheet.png содержит 54 спрайта. Чтобы заменить один из них:

1. Открыть `Assets/UI/UISpritesheet.png` в графическом редакторе (Photoshop, GIMP)
2. Найти нужный спрайт по координатам из Sprite Editor
3. Заменить пиксели, сохранить PNG
4. В Unity: Inspector → Sprite Editor → проверить что границы спрайтов не сдвинулись
5. Apply

**Проще:** вместо редактирования спрайтшита — создать отдельный PNG и подставить его напрямую в Image → Source Image. Unity умеет смешивать спрайты из разных источников.

---

## 7. Чего НЕ делать

| Действие | Последствие | Как избежать |
|----------|-------------|-------------|
| Удалить Canvas компонент | Весь UI пропадёт | Не трогайте Canvas, только его дочерние элементы |
| Удалить EventSystem | Кнопки перестанут реагировать | EventSystem должен быть ровно один в сцене |
| Менять имена GameObject, на которые ссылаются скрипты | NullReferenceException | Не переименовывайте, если скрипт ищет по имени |
| Удалить CanvasScaler | UI не масштабируется под разные экраны | Оставьте Scale with Screen Size, 720x1280 |
| Менять Sorting Order канвасов | UI-элементы перекроют друг друга | Оставьте 0 для основных канвасов |
| Заменить Text на TextMeshPro | Скрипты ожидают `UnityEngine.UI.Text` | Если хотите TMP — нужно обновить все C# скрипты |
| Удалить Layout Group | Элементы списков (магазин, миссии) развалятся | Layout Group управляет позициями дочерних элементов |
| Поставить огромную текстуру (>4096px) | WebGL будет тормозить и жрать память | Max 2048px для UI-спрайтов |

---

## Файлы для справки

| Файл | Описание |
|------|----------|
| `Assets/UI/UISpritesheet.png` | Основной спрайтшит |
| `Assets/UI/Logo.png` | Логотип |
| `Assets/Font/LuckiestGuy.ttf` | Шрифт |
| `Assets/Prefabs/UI/*.prefab` | UI-префабы (Score, ItemEntry, MissionEntry и др.) |
| `Assets/Scripts/UI/*.cs` | Все UI-скрипты |
| `Assets/Scripts/GameManager/*.cs` | FSM-состояния (Loadout, Game, GameOver) |
