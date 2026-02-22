---
description: Dodawanie nowej książki do Pamiętnika
---

Ten workflow (skill) pozwala asystentowi (AI) dodawać nową książkę do bazy (pliku `books.json`) na prośbę użytkownika w czacie. Gdy użytkownik prosi o dodanie książki, postępuj według tego wzoru:

1. Przeanalizuj polecenie użytkownika i upewnij się, że masz co najmniej: `tytuł` i `autora`. 
   Jeśli ich brakuje, dopytaj użytkownika o te informacje. Reszta danych jest opcjonalna:
   - Data przeczytania (domyślnie dzisiejsza w formacie RRRR-MM-DD)
   - Gatunek (np. Powieść, Sci-Fi)
   - Ocena (liczba 1-10)
   - Ilość stron (liczba całkowita)
   - Notatki / Recenzja
2. Otwórz plik `books.json` upewniając się co do jego aktualnej zawartości (odczytaj go narzędziem do podglądu, np. `view_file` lub bezpośrednio przy dodawaniu, używając `replace_file_content` na tablicy).
3. Wygeneruj nowy obiekt JSON, który wpisuje się w ten sam schemat co reszta pozycji, dodając mu unikalne `id` (jako nowy maksymalny numer).
4. Zapisz nowe dane do `books.json`.
5. Potwierdź użytkownikowi, że książka została dodana i pokaż jak wygląda w bazie danych JSON.
