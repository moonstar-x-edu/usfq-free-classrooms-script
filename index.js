const axios = require('axios');
const { difference } = require('set-operations');
const config = require('./config.json');

// More buildings exist...
const buildingDictionary = {
  'M': 'Maxwell',
  'D': 'Da Vinci',
  'H': 'Hayek',
  'N': 'Newton',
  'G': 'Galileo',
  'E': 'Einstein',
  'HA': 'Hannah Arendt',
  'HS': 'Hayek (Subsuelo)',
  'DW': 'Darwin',
  'EE': 'Eugenio Espejo'
};

// The buildings I care for...
const relevantBuildings = [
  'Hannah Arendt',
  'Maxwell',
  'Da Vinci',
  'Newton',
  'Galileo',
  'Einstein'
];

const resolveBuildingName = (building) => {
  return buildingDictionary[building] ?? 'Other';
};

const getCourses = async (token, period) => {
  const BASE_URL = 'https://wsexternal.usfq.edu.ec/WSApisUSFQ/api';

  const response = await axios.post(`${BASE_URL}/Cursos`, {
    area: '',
    campus: '',
    colegio: '',
    mallas: '',
    search: '',
    semana: [],
    sesion: '',
    cursos_con_cupo: false,
    cursos_ingles: false,
    filtro_lunes: false,
    filtro_martes: false,
    filtro_miercoles: false,
    filtro_jueves: false,
    filtro_viernes: false,
    filtro_sabado: false,
    filtro_domingo: false
  }, {
    params: {
      periodo: period
    },
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  return response.data;
};

const getClassroomFromCourse = (course) => {
  if (!course.info_reunion.edificio || !course.info_reunion.aula) {
    return null;
  }

  return `${course.info_reunion.edificio}::${course.info_reunion.aula}`;
};

const main = async () => {
  const courses = await getCourses(config.token, config.period);
  console.log(`Fetched ${courses.length} courses from API.`);

  if (!courses.length) {
    console.log('No courses have been found, exiting...');
    return;
  }

  const classrooms = new Set(courses.map((course) => getClassroomFromCourse(course)).filter(Boolean));

  console.log(`Retrieved ${classrooms.size} different classrooms.`);
  console.log('Filtering by schedule...');

  const simultaneousCourses = courses.filter((course) => {
    return config.interesting_days.some((day) => !!course.info_reunion[day]) &&
      course.info_reunion.hora_inicio === config.interesting_start_time;
  });

  console.log(`Courses that happen during our schedule: ${simultaneousCourses.length}`);

  const nonInterestingClassrooms = new Set(simultaneousCourses.map((course) => getClassroomFromCourse(course)).filter(Boolean));
  const interestingClassrooms = difference(classrooms, nonInterestingClassrooms);

  const cleanInterestingClassrooms = Array.from(interestingClassrooms)
    .sort((a, b) => {
      return a.localeCompare(b);
    })
    .reduce((acc, cur) => {
      const [building] = cur.split('::');
      const buildingName = resolveBuildingName(building);

      const prettyClassroomName = cur.replace('::', '-');

      if (acc[buildingName]) {
        acc[buildingName].push(prettyClassroomName);
      } else {
        acc[buildingName] = [prettyClassroomName];
      }

      return acc;
    }, {});

  console.log('All the potential classrooms:');
  relevantBuildings.forEach((building) => {
    console.log(`Classrooms in ${building}: ${cleanInterestingClassrooms[building]?.join(', ') ?? 'None'}`);
  });
};

main();
