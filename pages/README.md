# pages/

Этот каталог намеренно пуст.

Он занимает слот Pages Router в Next.js, чтобы `src/pages/` (FSD-слой `pages`) не
воспринимался как Pages Router.

Архитектурный контекст: Next.js сканирует `pages/` и `app/` в первую очередь в корне
репозитория. Если корневой `pages/` присутствует, `src/pages/` игнорируется как роутер.
Реальные FSD-страницы (`HomePage`, `MasterPage` и т.д.) живут в `src/pages/<slice>/`.
