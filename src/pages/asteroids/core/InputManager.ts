import P5 from "p5";

export type KeyHandler = (event: KeyboardEvent) => void;
export type MouseHandler = (event: MouseEvent) => void;

export class InputManager {
  private static instance: InputManager;
  private keyState: Map<string, boolean>;
  private keyHandlers: Map<string, KeyHandler[]>;
  private mouseHandlers: Map<string, MouseHandler[]>;

  private constructor() {
    this.keyState = new Map<string, boolean>();
    this.keyHandlers = new Map<string, KeyHandler[]>();
    this.mouseHandlers = new Map<string, MouseHandler[]>();

    // Set up event listeners
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  public isKeyDown(keyCode: string): boolean {
    return this.keyState.get(keyCode) === true;
  }

  public addKeyDownHandler(keyCode: string, handler: KeyHandler): void {
    if (!this.keyHandlers.has("keydown:" + keyCode)) {
      this.keyHandlers.set("keydown:" + keyCode, []);
    }
    this.keyHandlers.get("keydown:" + keyCode)!.push(handler);
  }

  public addKeyUpHandler(keyCode: string, handler: KeyHandler): void {
    if (!this.keyHandlers.has("keyup:" + keyCode)) {
      this.keyHandlers.set("keyup:" + keyCode, []);
    }
    this.keyHandlers.get("keyup:" + keyCode)!.push(handler);
  }

  public addMouseClickHandler(handler: MouseHandler): void {
    if (!this.mouseHandlers.has("click")) {
      this.mouseHandlers.set("click", []);
    }
    this.mouseHandlers.get("click")!.push(handler);
  }

  public removeKeyDownHandler(keyCode: string, handler: KeyHandler): void {
    const key = "keydown:" + keyCode;
    if (!this.keyHandlers.has(key)) return;

    const handlers = this.keyHandlers.get(key)!;
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  public removeKeyUpHandler(keyCode: string, handler: KeyHandler): void {
    const key = "keyup:" + keyCode;
    if (!this.keyHandlers.has(key)) return;

    const handlers = this.keyHandlers.get(key)!;
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  public removeMouseClickHandler(handler: MouseHandler): void {
    if (!this.mouseHandlers.has("click")) return;

    const handlers = this.mouseHandlers.get("click")!;
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const keyCode = event.code;
    this.keyState.set(keyCode, true);

    const handlers = this.keyHandlers.get("keydown:" + keyCode);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const keyCode = event.code;
    this.keyState.set(keyCode, false);

    const handlers = this.keyHandlers.get("keyup:" + keyCode);
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  public handleMouseClick(event: MouseEvent): void {
    const handlers = this.mouseHandlers.get("click");
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  public setupP5Handlers(p5Instance: P5): void {
    p5Instance.keyPressed = (e: KeyboardEvent) => {
      // P5 already triggers our window event listeners,
      // but we might need additional P5-specific logic here
    };

    p5Instance.mouseClicked = (e: MouseEvent) => {
      this.handleMouseClick(e);
    };
  }
}
