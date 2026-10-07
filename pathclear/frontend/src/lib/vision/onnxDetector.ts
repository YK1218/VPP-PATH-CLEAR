import { InferenceSession, Tensor } from "onnxruntime-web";

export type VisionExecutionProvider = "wasm" | "webgl" | "webgpu";

export interface OnnxDetectorConfig {
  /** URL or path served by the frontend for an ONNX model. */
  modelPath: string;
  executionProvider?: VisionExecutionProvider;
}

export type OnnxOutputMap = Awaited<ReturnType<InferenceSession["run"]>>;

/** Lazily creates and reuses an ONNX Runtime Web session. */
export class OnnxDetector {
  private session: InferenceSession | null = null;
  private initialization: Promise<InferenceSession> | null = null;
  private disposed = false;

  constructor(private readonly config: OnnxDetectorConfig) {
    if (!config.modelPath.trim()) {
      throw new Error("An ONNX model path is required.");
    }
  }

  isInitialized(): boolean {
    return this.session !== null;
  }

  async initialize(): Promise<void> {
    await this.getSession();
  }

  async run(inputName: string, inputTensor: Tensor): Promise<OnnxOutputMap> {
    if (!inputName.trim()) {
      throw new Error("An ONNX input name is required.");
    }

    const session = await this.getSession();
    try {
      return await session.run({ [inputName]: inputTensor });
    } catch (error) {
      throw new Error(`ONNX inference failed: ${this.errorMessage(error)}`, { cause: error });
    }
  }

  async dispose(): Promise<void> {
    this.disposed = true;
    if (this.initialization) {
      try {
        await this.initialization;
      } catch {
        // Initialization errors are reported by initialize/run; disposal still completes.
      }
    }

    const session = this.session;
    this.session = null;
    if (session) {
      await session.release();
    }
  }

  private getSession(): Promise<InferenceSession> {
    if (this.disposed) {
      return Promise.reject(new Error("This ONNX detector has been disposed."));
    }
    if (this.session) return Promise.resolve(this.session);
    if (this.initialization) return this.initialization;

    this.initialization = InferenceSession.create(this.config.modelPath, {
      executionProviders: [this.config.executionProvider ?? "wasm"],
    })
      .then(async (session) => {
        if (this.disposed) {
          await session.release();
          throw new Error("The ONNX detector was disposed during initialization.");
        }
        this.session = session;
        return session;
      })
      .catch((error: unknown) => {
        throw new Error(
          `Could not initialize ONNX model at "${this.config.modelPath}": ${this.errorMessage(error)}`,
          { cause: error }
        );
      })
      .finally(() => {
        this.initialization = null;
      });

    return this.initialization;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
