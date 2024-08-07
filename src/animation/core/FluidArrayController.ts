import { FluidController } from './FluidController';

import type { AssignValue, UseFluidValueConfig } from './FluidController';

export class FluidArrayController {
  private fluidControllers: FluidController[];

  constructor(values: number[], config?: UseFluidValueConfig) {
    this.fluidControllers = values.map((v) => new FluidController(v, config));
  }

  public setFluid(updateValue: AssignValue[], callback?: () => void) {
    this.fluidControllers.map((fc, i) => {
      fc.setFluid(updateValue[i], callback);
    });
  }

  public getFluid() {
    return this.fluidControllers.map((fc) => fc.getFluid());
  }
}
