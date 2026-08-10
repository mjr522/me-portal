// Central Course Catalog Registry

import { me220Course } from './me220';
import { me330Course } from './me330';

export const COURSES = {
  me220: me220Course,
  me330: me330Course,
};

export const getCourseList = () => Object.values(COURSES);
export const getCourseById = (id) => COURSES[id] || null;
