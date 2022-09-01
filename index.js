const fs = require('fs');
const cheerio = require('cheerio');
const { difference } = require('set-operations');

// CHANGE THIS
const INTERESTING_DAYS = ['M', 'J']; // Can be: L, M, I, J, V
const INTERESTING_START_TIME = '14:30'; // 24h format

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

const main = async () => {
  console.log('Reading from HTML...');
  const html = await fs.promises.readFile('./out.html'); // File should already be downloaded.
  const $ = cheerio.load(html);

  console.log('Parsing all courses...');
  const tableRows = $('table.texto tr[style="border-bottom: solid 1px #ccc;"]');
  const courses = tableRows
    .filter((_, row) => {
      const cols = row.children.filter((e) => e.name === 'td');
      const infoRows = cols[4].children[1].children[1].children.filter((e) => e.name === 'tr');

      const campus = infoRows[1].children[0].children[7].children[0].data.trim();
      const classroom = infoRows[2]?.children[3].children[0].children[2]?.data.trim();

      return campus === 'Cumbaya' && !!classroom; // I only care about the courses in the main campus with a classroom assigned.
    })  
    .map((_, row) => {
      const cols = row.children.filter((e) => e.name === 'td');

      const code = cols[2].children[0].data.trim();
      const nrc = cols[3].children[0].data.trim();
      const instructor = cols[6].children[2]?.data.trim();

      const infoRows = cols[4].children[1].children[1].children.filter((e) => e.name === 'tr');

      const name = infoRows[0].children[0].children[1].children[0].data.trim();
      let classroom = infoRows[2]?.children[3].children[0].children[2].data.trim(); // This should be the classroom.
      let rawSchedule = infoRows[2].children[3].children[0].children[0].data.trim(); // This should be the schedule.

      // There's a chance that there's multiple schedules. (I don't care about the second one.)
      if (!classroom.startsWith('(')) {
        classroom = infoRows[2]?.children[3].children[0].children[4].data.trim();
        rawSchedule = infoRows[2]?.children[3].children[0].children[2].data.trim();
      }

      const rawScheduleSplit = rawSchedule.split(' ');

      // Nullish schedules show up as 00:00.
      const schedule = rawScheduleSplit[0].startsWith('00:00') ?
        null :
        {
          day: rawScheduleSplit[0],
          time: [rawScheduleSplit[1], rawScheduleSplit[3]]
        };

      return {
        code,
        nrc,
        instructor,
        name,
        classroom,
        schedule
      };
    });
  const classrooms = new Set(courses.filter((_, c) => !!c.classroom).map((_, c) => c.classroom));

  console.log(`Parsed ${courses.length} courses with ${classrooms.size} different classrooms.`);
  console.log('Filtering by schedule...');

  const simultaneousCourses = courses.filter((_, course) => {
    return course.schedule &&
      INTERESTING_DAYS.some((d) => course.schedule.day.includes(d)) &&
      course.schedule.time[0] === INTERESTING_START_TIME;
  });

  console.log(`Courses that happen during our schedule: ${simultaneousCourses.length}`);

  const nonInterestingClassrooms = new Set(simultaneousCourses.filter((_, c) => !!c.classroom).map((_, c) => c.classroom));
  const interestingClassrooms = difference(classrooms, nonInterestingClassrooms);

  const cleanInterestingClassrooms = Array.from(interestingClassrooms)
    .map((classroom) => {
      return classroom.replace(/\(|Aula |\)/gi, ''); // Cleanup the classroom name.
    })
    .sort((a, b) => {
      return a.localeCompare(b);
    })
    .reduce((acc, cur) => {
      const [building, number] = cur.split('-');
      const buildingName = resolveBuildingName(building);

      // Classroom numbers should all have 3 digits. Classrooms that start with a 0 are generally labs.
      if (!number || number.startsWith('0') || number.length > 3) {
        return acc;
      }

      if (acc[buildingName]) {
        acc[buildingName].push(cur);
      } else {
        acc[buildingName] = [cur];
      }

      return acc;
    }, {});

  console.log('All the potential classrooms:');
  relevantBuildings.forEach((building) => {
    console.log(`Classrooms in ${building}: ${cleanInterestingClassrooms[building]?.join(', ') ?? 'None'}`);
  });
}

main();
