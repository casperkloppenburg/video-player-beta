import { ElementState } from './renderer/ElementState';
import { Renderer } from './renderer/Renderer';
import './style.css';

const publicToken = 'public-7p7n35m68yzvbgrug2gfamfo';
const templateId = '5dabeb69-47ef-4cf8-9a67-f9478a1c74d6';

let renderer: Renderer | undefined;
let modifications: any = {};

document.addEventListener('DOMContentLoaded', function () {
  // Set up renderer
  renderer = new Renderer(document.querySelector('#video-player'), 'player', publicToken);

  renderer.onReady = async () => {
    // Load template by ID
    await renderer.loadTemplate(templateId);
    await renderer.play();

    // When the renderer is done loading, set up the input controls
    await setUpInputControls();
  };
});

async function setUpInputControls() {
  const htmlElement = document.querySelector('#dynamic-elements');
  htmlElement.innerHTML = '';

  // Create input controls for each dynamic element in the template
  const dynamicElements = renderer.getElements().filter((element) => element.source.dynamic);
  for (const element of dynamicElements) {
    if (element.source.type === 'text') {
      htmlElement.append(setUpTextInputControl(element));
    } else if (element.source.type === 'image') {
      htmlElement.append(setUpImageInputControl(element));
    } else if (element.source.type === 'video') {
      htmlElement.append(setUpVideoInputControl(element));
    }
  }
}

function setUpTextInputControl(element: ElementState): HTMLElement {
  // Create <input> element
  const htmlInputElement = document.createElement('input');
  htmlInputElement.placeholder = element.source.text;
  htmlInputElement.addEventListener('input', () => setModification(element, htmlInputElement.value));

  // Create <label> element
  const htmlLabelElement = document.createElement('label');
  htmlLabelElement.className = 'dynamic-element-label';
  htmlLabelElement.append(element.source.name ?? element.source.type);
  htmlLabelElement.append(htmlInputElement);

  return htmlLabelElement;
}

function setUpImageInputControl(element: ElementState): HTMLElement {
  return setUpMediaInputControl(element, {
    '(default)': '',
    'Example image 1': 'https://creatomate-static.s3.amazonaws.com/demo/image1.jpg',
    'Example image 2': 'https://creatomate-static.s3.amazonaws.com/demo/image2.jpg',
    'Example image 3': 'https://creatomate-static.s3.amazonaws.com/demo/image3.jpg',
  });
}

function setUpVideoInputControl(element: ElementState): HTMLElement {
  return setUpMediaInputControl(element, {
    '(default)': '',
    'Example video 1': 'https://creatomate-static.s3.amazonaws.com/demo/video1.mp4',
    'Example video 2': 'https://creatomate-static.s3.amazonaws.com/demo/video2.mp4',
    'Example video 3': 'https://creatomate-static.s3.amazonaws.com/demo/video3.mp4',
  });
}

function setUpMediaInputControl(element: ElementState, examples: Record<string, string>): HTMLElement {
  // Create <select> element
  const htmlSelectElement = document.createElement('select');
  htmlSelectElement.addEventListener('change', () => setModification(element, htmlSelectElement.value));

  // Create <option> elements
  for (const option of Object.keys(examples)) {
    const htmlOptionElement = document.createElement('option');
    htmlOptionElement.innerText = option;
    htmlOptionElement.value = examples[option];
    htmlSelectElement.append(htmlOptionElement);
  }

  // Create <label> element
  const htmlLabelElement = document.createElement('label');
  htmlLabelElement.className = 'dynamic-element-label';
  htmlLabelElement.append(element.source.name ?? element.source.type);
  htmlLabelElement.append(htmlSelectElement);

  return htmlLabelElement;
}

async function setModification(element: ElementState, value: string) {
  const selector = element.source.name ?? element.source.type;

  if (value) {
    // Set modification
    modifications[selector] = value;
  } else {
    // Clear modification
    delete modifications[selector];
  }

  await renderer?.setModifications(modifications);
}

const createRenderButton = document.querySelector('#create-render-button') as HTMLButtonElement;
createRenderButton?.addEventListener('click', async function () {
  if (renderer) {
    // Create Direct API url: https://creatomate.com/docs/api/direct-api/url-format
    let url =
      'https://api.creatomate.com/v1/direct' + `?template_id=${templateId}` + '&output_format=mp4' + '&max_width=320';

    // Add modifications to URL
    for (const selector of Object.keys(modifications)) {
      url += `&${encodeURIComponent(selector)}=${encodeURIComponent(modifications[selector])}`;
    }

    window.open(url, '_blank');
  }
});

const playButton = document.querySelector('#play-button') as HTMLButtonElement;
playButton?.addEventListener('click', async function () {
  if (renderer) {
    renderer.play();
  }
});

const pauseButton = document.querySelector('#pause-button') as HTMLButtonElement;
pauseButton?.addEventListener('click', async function () {
  if (renderer) {
    renderer.pause();
  }
});
