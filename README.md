# Basic Watch Shop

Basic CRUD using Express and XAMPP MySQL.

1. Start **MySQL** in XAMPP.
2. Run `npm run dev`.
3. Open **http://127.0.0.1:3000**.

Add, view, edit, and delete watches on the website. Changes are saved in `basic_watch_shop.watches`. Your SQL file has already been imported.

- `server.js`: database connection and CRUD routes.
- `js/app.js`: displays watches and sends form data to Express.
- `basic_watch_shop.sql`: database table and sample watches.

The connection defaults to XAMPP's `root` user with no password. If your settings differ, copy `.env.example` to `.env` and edit it.

For Vite, keep Express running and use `npm run dev` in a second terminal.
