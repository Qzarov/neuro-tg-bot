# neuro-tg-bot

📚 Терминология и принципы

domain = бизнес-структура
application = логика
infrastructure = Mongo + Telegram + GPT

|Элемент|Назначение|
|-|-|
|Entity|Сущность с уникальным ID и поведением (например, User, Message)|
|Value Object|Объекты без ID, с логикой (например, UserRole, MessageType)|
|Domain Service|Если бизнес-логика не помещается в Entity или между ними|
|Application Service|Обрабатывает команды и координирует действия|
|Command|Описание действия (например, ChangeUserRoleCommand)|
|Event|Событие, которое произошло в домене (UserRoleChanged, MessageReceived)|
|Repository|Интерфейс для получения и сохранения сущностей|
|Infrastructure|Реализация доступа к БД, Telegram API, event-bus и т.п.|
