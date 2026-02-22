# Pamiętnik Czytelnika - Agenci i Skille

W tym projekcie korzystamy ze wsparcia asystenta AI, który posiada dedykowane skille (strumienie pracy/workflows).

## Dostępne skille

### `/dodaj-ksiazke`
Pozwala na dodanie nowej książki do bazy danych bez konieczności bezpośredniej edycji kodu czy używania interfejsu graficznego.
Skill pobiera informacje podane w treści wiadomości (w tym z wiadomości głosowych), buduje odpowiedni obiekt JSON i zapisuje go jako nową pozycję w plikach `books.json` oraz `books.js`.

Zasada działania:
1. Przeanalizowanie danych (w tym tych z głosu użytkownika).
2. Dodanie nowej pozycji do konfiguracji.
3. Utworzenie wpisów w `books.json` i `books.js`.
4. Automatyczne wypuszczenie zmian (release) na serwer na główny branch (tzw. `git add`, `git commit` i `git push origin main`).

Wystarczy podać:
- Tytuł
- Autora
- Dodatkowe opcjonalne dane (gatunek, ilość stron, ocenę 1-10, notatkę/recenzję)
