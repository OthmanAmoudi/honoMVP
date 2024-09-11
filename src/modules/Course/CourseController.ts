
import { BaseController } from "../../utils/BaseController";
import CourseService from "./CourseService";

export default class CourseController extends BaseController<CourseService> {
  constructor(courseService: CourseService) {
    super(courseService);
  }
}
