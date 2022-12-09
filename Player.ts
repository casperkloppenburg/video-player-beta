import EventEmitter from 'eventemitter3';

export class Player extends EventEmitter {
  private readonly _iframe: HTMLIFrameElement;

  private _pendingPromises: Record<number, (data: any) => void> = {};

  private _lastCommandId = 0;

  constructor(public element: Element, publicToken: string) {
    super();

    const iframe = document.createElement('iframe');
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '100%');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('src', `https://creatomate.com/player?token=${publicToken}`);
    iframe.style.border = 'none';
    iframe.style.display = 'none';

    element.innerHTML = '';
    element.appendChild(iframe);

    window.addEventListener('message', this._handleMessage);

    this._iframe = iframe;
  }

  dispose() {
    window.removeEventListener('message', this._handleMessage);

    this._iframe.parentNode?.removeChild(this._iframe);
    this._iframe.setAttribute('src', '');
  }

  loadTemplate(templateId: string) {
    this._sendCommand({ message: 'setTemplate', templateId });
  }

  setModifications(modifications: Record<string, any>) {
    this._sendCommand({ message: 'setModifications', modifications });
  }

  async getSource(): Promise<Record<string, any>> {
    const { source } = await this._requestValue({ message: 'getSource' });
    return source;
  }

  async getDynamicElements(): Promise<Record<string, any>[]> {
    const dynamicElements: Record<string, any>[] = [];

    const recurse = (elements: Record<string, any>[]) => {
      if (Array.isArray(elements)) {
        for (const element of elements) {
          if (element.dynamic === true) {
            dynamicElements.push(element);
          }

          recurse(element.elements);
        }
      }
    };

    const source = await this.getSource();
    recurse(source.elements);

    return dynamicElements;
  }

  async getImage(type: 'image/jpeg' | 'image/png'): Promise<Blob> {
    const { blob } = await this._requestValue({ message: 'getImage', type });
    return blob;
  }

  async getImageAsDataURL(type: 'image/jpeg' | 'image/png'): Promise<string> {
    const blob = await this.getImage(type);

    return await new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = function(e) {
        resolve(e.target.result as string);
      };

      fileReader.readAsDataURL(blob);
    });
  }

  private _sendCommand(message: any) {
    this._iframe.contentWindow.postMessage(message, '*');
  }

  private _requestValue(message: Record<string, any>): Promise<any> {
    const id = ++this._lastCommandId;
    this._iframe.contentWindow.postMessage({ id, ...message }, '*');

    // Create pending promise
    return new Promise((resolve) => (this._pendingPromises[id] = resolve));
  }

  // Defined as arrow function to make it bound to this instance when used with window.addEventListener above.
  private _handleMessage = (e: MessageEvent<any>) => {

    if (!e.origin.startsWith('https://creatomate.com')) {
      return;
    }

    if (!e.data || typeof e.data !== 'object') {
      return;
    }

    const { id, message, ...data } = e.data;

    if (message === 'load') {
      // Show iframe
      this._iframe.style.display = '';
    }

    if (id) {
      // Resolve pending promise
      const pendingPromise = this._pendingPromises[id];
      if (pendingPromise) {
        pendingPromise(data);

        // Clean up
        delete this._pendingPromises[id];
      }
    } else if (message) {
      // Emit message as event
      this.emit(message, data);
    }
  };
}
