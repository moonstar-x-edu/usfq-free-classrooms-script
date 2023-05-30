# usfq-free-classrooms-script

A little script to see what classrooms are available at a given time.

## Installation

Run:

```text
npm install
```

**Make sure to use Node version `16.15.1`**.

## Usage (Old Version)

Before starting the script, you should download the course listing data:

```text
curl https://evaluaciones.usfq.edu.ec/banner/ssb/cursos_lista.php\?orderField\=ssbsect_subj_code\&orderAsc\=ASC\&start_search\=1\&search\=\&colegio\=\&periodo\=202210\&area\=\&campus\=\&sesion\=\&filtro_dias\=\&filtro_horario\=\&filtro_aula\=\&filtro_cursos_ingles\=false\&filtro_cursos_cupo\=false\&perfil\= >> out.html
```

> **Make sure to download the correct listing for the current semester (most likely the `periodo` query param needs to be changed).

Inside `old_script.js`, change the `INTERESTING_DAYS` and `INTERESTING_START_TIME` to your liking.

Then finally, run the script:

```text
npm start
```

The expected output is:

```text
Reading from HTML...
Parsing all courses...
Parsed 2452 courses with 260 different classrooms.
Filtering by schedule...
Courses that happen during our schedule: 181
All the potential classrooms:
Classrooms in Hannah Arendt: HA-106, HA-107
Classrooms in Maxwell: M-110, M-113, M-115, M-213, M-217, M-310, M-327
Classrooms in Da Vinci: D-120, D-124, D-201
Classrooms in Newton: N-201, N-213, N-219
Classrooms in Galileo: G-208, G-304
Classrooms in Einstein: None
```

## Usage (New Version)

Before starting the script, you should visit the course catalog page:

```text
https://catalogodecursos.usfq.edu.ec/dashboard/home
```

And log in with your account.

When visiting the page, select the period you want to check the available rooms for. Periods end with a code at the end that begins with the starting year of the period. In the case of "Verano 2022-2023", the code is `202230`.

Now, check the developer tools in the page, and look for the `TOKEN` value inside the session storage. Get this value and insert it inside `config.json`.  This file is not tracked by git, so you will need to rename `config.sample.json` to `config.json` first.

Then, update the `config.json` file with all the necessary values and you're ready to go.

`interesting_days` in `config.json` should be an array with the names of the days of the week in spanish lowercased, i.e (`["lunes", "miercoles"]`)

`interesting_start_time` in `config.json` is a 24-hour time with no separator between hours and minutes, i.e (10:00 AM is `1000` and 2:30 PM is `1430`)

Then finally, run the script:

```text
npm start
```

The expected output is:

```text
Reading from HTML...
Parsing all courses...
Parsed 2452 courses with 260 different classrooms.
Filtering by schedule...
Courses that happen during our schedule: 181
All the potential classrooms:
Classrooms in Hannah Arendt: HA-106, HA-107
Classrooms in Maxwell: M-110, M-113, M-115, M-213, M-217, M-310, M-327
Classrooms in Da Vinci: D-120, D-124, D-201
Classrooms in Newton: N-201, N-213, N-219
Classrooms in Galileo: G-208, G-304
Classrooms in Einstein: None
```
