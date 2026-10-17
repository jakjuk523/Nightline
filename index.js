// ============================================================
// NIGHTLINE — ОСНОВНОЙ JAVASCRIPT
// ============================================================


// ============================================================
// 1. СЕКЦИИ ИГРЫ
// ============================================================

const startMenu = document.getElementById("startMenu");
const officeRoom = document.getElementById("officeRoom");
const cameraSystem = document.getElementById("cameraSystem");
const defeat = document.getElementById("defeat");
const victory = document.getElementById("victory");
const gameScreen = document.getElementById("gameScreen");


// ============================================================
// 2. КНОПКИ
// ============================================================

const startButton = document.getElementById("startButton");
const openCamera = document.getElementById("openCamera");
const closeCamera = document.getElementById("exitButton");

const cameraScene = document.getElementById("cam_scene");
const cam_01 = document.getElementById("cam_01");
const cam_02 = document.getElementById("cam_02");
const cam_03 = document.getElementById("cam_03");
const cam_04 = document.getElementById("cam_04");
const cam_05 = document.getElementById("cam_05");
const cam_06 = document.getElementById("cam_06");

const lightInDoor = document.getElementById("lightInDoor");
const openDoor = document.getElementById("openDoor");


// ============================================================
// 3. ИЗОБРАЖЕНИЯ И ТЕКСТ
// ============================================================

const cameraImage = document.getElementById("cameraImage");
const officeImage = document.getElementById("officeImage");

const timeInOffice = document.getElementById("timeInOffice");
const timeInCamera = document.getElementById("timeInCamera");

const batteryPowerInOffice = document.getElementById("batteryPower");
const batteryPowerInCamera = document.getElementById("batteryPowerInCamera");


// ============================================================
// 4. ИГРОВЫЕ ПЕРЕМЕННЫЕ
// ============================================================

// Текущий игровой час.

let currentHour = 12;

// Игровые таймеры.

let gameTimer = null;
let powerTimer = null;

// Состояния двери, света и камер.

let doorClosed = false;
let doorLight = false;
let cameraOpen = false;

// Заряд батареи.

let batteryPower = 100;

// Состояние игры.

let gameStarted = false;
let gameEnded = false;

// Таймеры Бонни.

let bonnieTop = null;
let bonnieAttackTimer = null;

// Таймер обновления изображения офиса.

let bonnieDoorTimer = null;

// Текущая выбранная камера.

let currentCamera = 1;


// ============================================================
// 5. МАРШРУТ БОННИ
// ============================================================

// 0 — сцена
// 1 — CAM_01
// 3 — CAM_03
// 5 — CAM_05
// 7 — дверь офиса

// Последняя позиция маршрута — дверь.
// Бонни не перемещается автоматически внутрь офиса.

const bonnieRoute = [0, 1, 3, 5, 7];

let bonnieRoutePosition = 0;
let bonnieRoom = bonnieRoute[bonnieRoutePosition];


// ============================================================
// 6. НАСТРОЙКИ ИИ БОННИ
// ============================================================

// Уровень ИИ для каждого игрового часа.

const bonnieDifficultyByHour = {
    12: 5,
    1: 7,
    2: 10,
    3: 13,
    4: 16,
    5: 18
};

let bonnieAI = bonnieDifficultyByHour[12];

// Параметры поведения Бонни.

let bonnieMoveChance = 0;
let bonnieMoveAhead = 0;
let topTime = 0;


// ============================================================
// 7. НАСТРОЙКИ ИГРЫ
// ============================================================

// Звук шагов аниматроника.

const animatronicsStep = "Звуки/steps.mp3";
const stepSound = new Audio(animatronicsStep);

// Длительность атаки Бонни: 5 секунд.

const BONNIE_ATTACK_DURATION = 5000;

// Частота обновления изображения офиса.

const OFFICE_UPDATE_INTERVAL = 100;

// Длительность одного игрового часа: 60 секунд.

const GAME_HOUR_DURATION = 60000;

// Интервал расхода батареи.

const BATTERY_UPDATE_INTERVAL = 1000;


// ============================================================
// 8. РАСЧЁТ СЛОЖНОСТИ БОННИ
// ============================================================

function updateBonnieAI() {

    // Вероятность попытки движения.

    bonnieMoveChance = Math.min(
        (30 + bonnieAI * 4) / 100,
        0.95
    );

    // Вероятность движения вперёд.

    bonnieMoveAhead = Math.min(
        (35 + bonnieAI * 3.3) / 100,
        0.95
    );

    // Интервал между проверками движения.
    // Минимальное значение — 3 секунды.

    topTime = Math.max(
        3,
        9 - bonnieAI * 0.3
    );

    console.log("========== ИИ БОННИ ==========");
    console.log("Уровень ИИ:", bonnieAI);

    console.log(
        "Шанс движения:",
        (bonnieMoveChance * 100).toFixed(0) + "%"
    );

    console.log(
        "Шанс движения вперёд:",
        (bonnieMoveAhead * 100).toFixed(0) + "%"
    );

    console.log(
        "Интервал проверки:",
        topTime.toFixed(1),
        "сек."
    );

    console.log("==============================");
}


// ============================================================
// 9. ОБНОВЛЕНИЕ ИЗОБРАЖЕНИЯ ОФИСА
// ============================================================

function updateOfficeImage() {

    // Закрытая дверь имеет высший приоритет.

    if (doorClosed) {
        officeImage.src = "Офис/closeDoor.png";
        return;
    }

    // При выключенном свете Бонни не видно.

    if (!doorLight) {
        officeImage.src = "Офис/OpenDoor.png";
        return;
    }

    // Бонни находится у двери.

    if (bonnieRoom === 7) {
        officeImage.src = "Офис/bonnieInDoor.png";
        return;
    }

    // Свет включён, Бонни у двери нет.

    officeImage.src = "Офис/LightOn.png";
}


// ============================================================
// 10. АВТОМАТИЧЕСКАЯ ПРОВЕРКА ОФИСА
// ============================================================

function startOfficeUpdate() {

    // Не создаём несколько одинаковых интервалов.

    if (bonnieDoorTimer !== null) {
        return;
    }

    updateOfficeImage();

    bonnieDoorTimer = setInterval(() => {

        if (gameEnded) {
            return;
        }

        // Обновляем изображение, когда игрок в офисе.

        if (!cameraOpen) {
            updateOfficeImage();
        }

    }, OFFICE_UPDATE_INTERVAL);
}


// ============================================================
// 11. ОСТАНОВКА ИГРОВЫХ ТАЙМЕРОВ
// ============================================================

function stopGameTimers() {

    clearInterval(bonnieTop);
    clearInterval(gameTimer);
    clearInterval(powerTimer);
    clearTimeout(bonnieAttackTimer);
    clearInterval(bonnieDoorTimer);

    bonnieTop = null;
    gameTimer = null;
    powerTimer = null;
    bonnieAttackTimer = null;
    bonnieDoorTimer = null;
}


// ============================================================
// 12. ПОРАЖЕНИЕ
// ============================================================

function defeatGame() {

    if (gameEnded) {
        return;
    }

    gameEnded = true;

    console.log("ПОРАЖЕНИЕ!");

    stopGameTimers();

    // Скрываем игровой экран.

    if (gameScreen) {
        gameScreen.style.display = "none";
    }

    officeRoom.style.display = "none";
    cameraSystem.style.display = "none";

    // Показываем экран поражения.

    defeat.style.display = "block";

    // Если на экране поражения есть видео — запускаем его.

    const defeatVideo = defeat.querySelector("video");

    if (defeatVideo) {

        defeatVideo.currentTime = 0;

        const playPromise = defeatVideo.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn(
                    "Не удалось запустить видео поражения:",
                    error
                );
            });
        }
    }
}


// ============================================================
// 13. ПОБЕДА
// ============================================================

function victoryGame() {

    if (gameEnded) {
        return;
    }

    gameEnded = true;

    stopGameTimers();

    // Затухание игрового экрана.

    if (gameScreen) {
        gameScreen.classList.add("victoryFade_style");
    }

    // Через 4 секунды показываем экран победы.

    setTimeout(() => {

        if (gameScreen) {
            gameScreen.style.display = "none";
        }

        officeRoom.style.display = "none";
        cameraSystem.style.display = "none";

        victory.style.display = "block";

        // Ищем видео внутри секции победы.

        const victoryVideo = victory.querySelector("video");

        if (victoryVideo) {

            victoryVideo.currentTime = 0;

            const playPromise = victoryVideo.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(
                        "Не удалось запустить видео победы:",
                        error
                    );
                });
            }
        }

    }, 4000);
}


// ============================================================
// 14. АТАКА БОННИ
// ============================================================

function startBonnieAttack() {

    // Атака возможна, только если Бонни у двери,
    // дверь открыта, а игра ещё продолжается.

    if (gameEnded || bonnieRoom !== 7 || doorClosed) {
        return;
    }

    // Не запускаем повторный таймер атаки.

    if (bonnieAttackTimer !== null) {
        return;
    }

    console.log(
        "Бонни атакует! У тебя 5 секунд, чтобы закрыть дверь!"
    );

    bonnieAttackTimer = setTimeout(() => {

        bonnieAttackTimer = null;

        // Если дверь осталась открытой и Бонни всё ещё
        // у двери, игрок проигрывает.

        if (!doorClosed && bonnieRoom === 7) {

            console.log("Бонни проник в офис!");

            defeatGame();
        }

    }, BONNIE_ATTACK_DURATION);
}


// ============================================================
// 15. ОТМЕНА АТАКИ БОННИ
// ============================================================

function cancelBonnieAttack() {

    if (bonnieAttackTimer !== null) {

        clearTimeout(bonnieAttackTimer);

        bonnieAttackTimer = null;

        console.log("Атака Бонни отменена.");
    }
}


// ============================================================
// 16. ДВИЖЕНИЕ БОННИ ВПЕРЁД
// ============================================================

function bonnieMove() {

    if (gameEnded) {
        return;
    }

    // Закрытая дверь останавливает Бонни.

    if (bonnieRoom === 7 && doorClosed) {

        console.log("Бонни остановлен закрытой дверью.");

        return;
    }

    // Если Бонни уже у двери, начинаем атаку.

    if (bonnieRoom === 7) {

        startBonnieAttack();

        return;
    }

    // Двигаемся вперёд по маршруту.

    if (bonnieRoutePosition < bonnieRoute.length - 1) {
        bonnieRoutePosition++;
    }

    bonnieRoom = bonnieRoute[bonnieRoutePosition];

    console.log(
        "Бонни переместился в комнату:",
        bonnieRoom
    );

    // Если Бонни достиг двери, начинаем атаку.

    if (bonnieRoom === 7) {
        startBonnieAttack();
    }

    // Обновляем выбранную камеру и изображение офиса.

    switchCamera(currentCamera);

    updateOfficeImage();
}


// ============================================================
// 17. ДВИЖЕНИЕ БОННИ НАЗАД
// ============================================================

function bonnieMoveBack() {

    if (gameEnded) {
        return;
    }

    // На первой позиции отступать некуда.

    if (bonnieRoutePosition === 0) {

        console.log(
            "Бонни находится на первой позиции маршрута."
        );

        return;
    }

    bonnieRoutePosition--;

    bonnieRoom = bonnieRoute[bonnieRoutePosition];

    console.log(
        "Бонни отступил в комнату:",
        bonnieRoom
    );

    // Если Бонни ушёл от двери, отменяем атаку.

    if (bonnieRoom !== 7) {
        cancelBonnieAttack();
    }

    switchCamera(currentCamera);

    updateOfficeImage();
}


// ============================================================
// 18. ПРОВЕРКА ДВИЖЕНИЯ БОННИ
// ============================================================

function bonnieMoveCheck() {

    if (gameEnded) {
        return;
    }

    // Не выполняем новую попытку движения,
    // пока Бонни атакует у двери.

    if (bonnieRoom === 7 && bonnieAttackTimer !== null) {
        return;
    }

    // Проверяем, попал ли бросок в шанс движения.

    const movementRoll = Math.random();

    if (movementRoll >= bonnieMoveChance) {

        console.log("Бонни остался на месте.");

        return;
    }

    // Определяем направление движения.

    const directionRoll = Math.random();

    if (directionRoll < bonnieMoveAhead) {

        bonnieMove();

    } else {

        bonnieMoveBack();
    }
    stepSound.currentTime = 0;
    stepSound.play();
}


// ============================================================
// 19. ЗАПУСК ПЕРЕМЕЩЕНИЙ БОННИ
// ============================================================

function bonnieWantWalk() {

    if (bonnieTop !== null) {
        return;
    }

    updateBonnieAI();

    bonnieTop = setInterval(() => {

        bonnieMoveCheck();

    }, topTime * 1000);
}


// ============================================================
// 20. ПЕРЕЗАПУСК ИНТЕРВАЛА БОННИ
// ============================================================

function restartBonnieTimer() {

    clearInterval(bonnieTop);

    bonnieTop = null;

    updateBonnieAI();

    bonnieTop = setInterval(() => {

        bonnieMoveCheck();

    }, topTime * 1000);
}


// ============================================================
// 21. РАСХОД БАТАРЕИ
// ============================================================

function battetyDrain() {

    if (powerTimer !== null) {
        return;
    }

    powerTimer = setInterval(() => {

        if (gameEnded) {
            return;
        }

        // Базовый расход энергии.

        batteryPower -= 0.18;

        // Дополнительный расход за закрытую дверь.

        if (doorClosed) {
            batteryPower -= 0.18;
        }

        // Дополнительный расход за включённый свет.

        if (doorLight) {
            batteryPower -= 0.18;
        }

        // Дополнительный расход за открытые камеры.

        if (cameraOpen) {
            batteryPower -= 0.18;
        }

        // Проверяем, закончилась ли энергия.

        if (batteryPower <= 0) {

            batteryPower = 0;

            batteryPowerInOffice.textContent = "Батарея: 0%";
            batteryPowerInCamera.textContent = "Батарея: 0%";

            console.log("Батарея разряжена.");

            defeatGame();

            return;
        }

        // Обновляем отображение заряда.

        const batteryText =
            `Батарея: ${batteryPower.toFixed(0)}%`;

        batteryPowerInOffice.textContent = batteryText;
        batteryPowerInCamera.textContent = batteryText;

    }, BATTERY_UPDATE_INTERVAL);
}


// ============================================================
// 22. ИГРОВОЕ ВРЕМЯ
// ============================================================

function hourNumber() {

    if (gameTimer !== null) {
        return;
    }

    gameTimer = setInterval(() => {

        if (gameEnded) {
            return;
        }

        // Переход от 12 AM к 1 AM.

        if (currentHour === 12) {
            currentHour = 1;
        } else {
            currentHour++;
        }

        // Обновляем время в интерфейсе.

        timeInOffice.textContent = `${currentHour} AM`;
        timeInCamera.textContent = `${currentHour} AM`;

        // Меняем уровень ИИ для нового часа.

        if (bonnieDifficultyByHour[currentHour] !== undefined) {

            bonnieAI = bonnieDifficultyByHour[currentHour];

            console.log(
                "Наступил новый час:",
                currentHour + " AM"
            );

            restartBonnieTimer();
        }

        // Наступило 6 AM — смена завершена.

        if (currentHour >= 6) {
            victoryGame();
        }

    }, GAME_HOUR_DURATION);
}


// ============================================================
// 23. НАЧАЛО ИГРЫ
// ============================================================

function startGame() {

    if (gameStarted || gameEnded) {
        return;
    }

    gameStarted = true;

    // Скрываем меню и показываем офис.

    startMenu.style.display = "none";

    officeRoom.style.display = "block";

    // Устанавливаем начальные значения интерфейса.

    currentHour = 12;

    batteryPower = 100;

    bonnieAI = bonnieDifficultyByHour[12];

    doorClosed = false;
    doorLight = false;
    cameraOpen = false;

    bonnieRoutePosition = 0;
    bonnieRoom = bonnieRoute[bonnieRoutePosition];

    timeInOffice.textContent = "12 AM";
    timeInCamera.textContent = "12 AM";

    batteryPowerInOffice.textContent = "Батарея: 100%";
    batteryPowerInCamera.textContent = "Батарея: 100%";

    // Обновляем офис.

    updateOfficeImage();

    // Запускаем игровые процессы.

    startOfficeUpdate();

    bonnieWantWalk();

    hourNumber();

    battetyDrain();

    console.log("Смена началась.");
}


// ============================================================
// 24. ПЕРЕКЛЮЧЕНИЕ ОФИСА И КАМЕР
// ============================================================

// Открываем систему камер.

function showCamera() {

    if (gameEnded || !gameStarted) {
        return;
    }

    officeRoom.style.display = "none";

    cameraSystem.style.display = "block";

    cameraOpen = true;

    switchCamera(currentCamera);
}


// Возвращаемся из камер в офис.

function hideCamera() {

    if (gameEnded || !gameStarted) {
        return;
    }

    cameraSystem.style.display = "none";

    officeRoom.style.display = "block";

    cameraOpen = false;

    updateOfficeImage();
}


// ============================================================
// 25. ПЕРЕКЛЮЧЕНИЕ КАМЕР
// ============================================================

function switchCamera(cameraNumber) {

    currentCamera = cameraNumber;

    // Показываем Бонни, если он находится
    // в выбранной локации камеры.

    if (bonnieRoom === cameraNumber) {

        cameraImage.src =
            `Камеры/bonnieInCam_0${cameraNumber}.png`;

    } else {

        cameraImage.src =
            `Камеры/cam_0${cameraNumber}.png`;
    }

    console.log("Выбрана камера:", cameraNumber);
}


// ============================================================
// 26. СВЕТ У ДВЕРИ
// ============================================================

function DoorLight() {

    // Свет нельзя включить во время закрытой двери.

    if (gameEnded || !gameStarted || doorClosed) {
        return;
    }

    doorLight = !doorLight;

    updateOfficeImage();

    console.log(
        doorLight ? "Свет включён." : "Свет выключен."
    );
}


// ============================================================
// 27. УПРАВЛЕНИЕ ДВЕРЬЮ
// ============================================================

function toggleDoor() {

    if (gameEnded || !gameStarted) {
        return;
    }

    if (doorClosed) {

        // ОТКРЫВАЕМ ДВЕРЬ.

        doorClosed = false;

        lightInDoor.disabled = false;

        updateOfficeImage();

        // Если Бонни у двери, начинается атака.

        startBonnieAttack();

        console.log("Дверь открыта.");

    } else {

        // ЗАКРЫВАЕМ ДВЕРЬ.

        doorClosed = true;

        // При закрытии двери свет выключается.

        doorLight = false;

        lightInDoor.disabled = true;

        updateOfficeImage();

        // Закрытие двери отменяет атаку.

        cancelBonnieAttack();

        console.log("Дверь закрыта.");
    }
}


// ============================================================
// 28. ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================================

// Начало смены.

startButton.addEventListener("click", startGame);

// Открытие и закрытие камер.

openCamera.addEventListener("click", showCamera);

closeCamera.addEventListener("click", hideCamera);


// ============================================================
// 29. КНОПКИ ВЫБОРА КАМЕР
// ============================================================

cameraScene.addEventListener(
    "click",
    () => switchCamera(0)
);

cam_01.addEventListener(
    "click",
    () => switchCamera(1)
);

cam_02.addEventListener(
    "click",
    () => switchCamera(2)
);

cam_03.addEventListener(
    "click",
    () => switchCamera(3)
);

cam_04.addEventListener(
    "click",
    () => switchCamera(4)
);

cam_05.addEventListener(
    "click",
    () => switchCamera(5)
);

cam_06.addEventListener(
    "click",
    () => switchCamera(6)
);


// ============================================================
// 30. КНОПКИ СВЕТА И ДВЕРИ
// ============================================================

// Переключение света у двери.

lightInDoor.addEventListener(
    "click",
    DoorLight
);

// Открытие и закрытие двери.

openDoor.addEventListener(
    "click",
    toggleDoor
);