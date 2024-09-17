import { BaseController } from "../../utils/BaseController";
import MangoService from "./MangoService";

export default class MangoController extends BaseController {
  static services = [MangoService];
  constructor(public mangoService: MangoService) {
    super(mangoService);
  }
}
