declare module "kursor" {
  type KursorOptions = {
    type?: number;
    color?: string;
  };

  export default class Kursor {
    constructor(options?: KursorOptions);
    destroy?(): void;
  }
}
