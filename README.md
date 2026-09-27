# 🖥️ Remote PC Hub

> **Remote PC Hub** — веб-приложение для дистанционного управления файловой системой, навигации и мониторинга удаленной машины в режиме реального времени через браузер.

![Status](https://img.shields.io/badge/Status-MVP%20%2F%20Active%20Development-orange?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)

---

## 🌟 Ключевой функционал

- 📂 **Управление файловой системой:** Навигация по директориям удаленного ПК, просмотр структуры папок, скачивание и загрузка файлов через веб-интерфейс.
- 🔐 **Защищенная авторизация:** Безопасный доступ к удаленному управлению с использованием JWT-токенов и Spring Security.
- ⚡ **Мгновенная реакция UI:** Оптимизированный клиентский стор на Zustand исключает лишние перерендеры и обеспечивает плавно работающий интерфейс.
- 🎭 **Анимированный UI/UX:** Интерактивный дизайн с модальными окнами и плавными переходами на базе Framer Motion.

---

## 👀 Обзор интерфейса

### Главная страница

![Главная страница](frontend/src/assets/readme/main.png)

### Главная страница c древовидными файлами

![Древовидное отображение файлов](frontend/src/assets/readme/maintree.png)

### Список  компьютеров

![Список удаленных компьютеров](frontend/src/assets/readme/list.png)

### Журнал событий

![Журнал событий](frontend/src/assets/readme/logs.png)

### вход

![Страница журнала](frontend/src/assets/readme/logpage.png)

### Регистрация

![Страница регистрации](frontend/src/assets/readme/regpage.png)

### Настройки

![Настройки](frontend/src/assets/readme/settings.png)

### Варианты оформления настроек

![Настройки в розовом оформлении](frontend/src/assets/readme/settingspink.png)

![Настройки в зеленом оформлении](frontend/src/assets/readme/settingsgreen.png)

![Настройки в синем оформлении](frontend/src/assets/readme/settingsblue.png)

---

## 🛠 Технологический стек

### Frontend
- **Core:** React 18, JavaScript (ES6+)
- **State Management:** Zustand
- **Animations & UI:** Framer Motion, CSS Modules
- **Routing:** React Router DOM (v6)

### Backend
- **Core Framework:** Java, Spring Boot
- **Security & Auth:** Spring Security, JWT (JSON Web Tokens)
- **Architecture:** REST API

---

## 🏗 Архитектура проекта


Проект разработан совместно [@R31tr0](https://github.com/R31tr0) (Frontend) и [@SaymonGrapes](https://github.com/SaymonGrapes) (Backend) и состоит из двух независимых сервисов:



```text
remote-pc-hub/
├── frontend/    # Клиентская часть (React 18 + Zustand + Framer Motion)
└── backend/     # Серверная часть (Java Spring Boot + Spring Security + JWT)




