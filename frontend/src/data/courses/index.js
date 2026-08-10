// Central Course Catalog Registry

import { me220Course } from './me220';

export const COURSES = {
  me220: me220Course,
  // Additional future courses can be added here easily:
  // me300: me300Course,
  // me310: me310Course,
};

export const getCourseList = () => Object.values(COURSES);
export const getCourseById = (id) => COURSES[id] || COURSES.me220;
