# usfq-free-classrooms-script

A little script to see what classrooms are available at a given time.

## Installation

Run:

```text
npm install
```

**Make sure to use Node version `16.15.1`**.

## Usage

Before starting the script, you should download the course listing data:

```text
curl https://evaluaciones.usfq.edu.ec/banner/ssb/cursos_lista.php\?orderField\=ssbsect_subj_code\&orderAsc\=ASC\&start_search\=1\&search\=\&colegio\=\&periodo\=202210\&area\=\&campus\=\&sesion\=\&filtro_dias\=\&filtro_horario\=\&filtro_aula\=\&filtro_cursos_ingles\=false\&filtro_cursos_cupo\=false\&perfil\= >> out.html
```

Inside `index.js`, change the `INTERESTING_DAYS` and `INTERESTING_START_TIME` to your liking.

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
