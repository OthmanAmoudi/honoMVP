
import { BaseController } from "../../utils/BaseController";
import StepService from "./StepService";

export default class StepController extends BaseController<StepService> {
  constructor(stepService: StepService) {
    super(stepService);
  }
}
