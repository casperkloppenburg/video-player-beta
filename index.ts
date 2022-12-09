import './style.css';
import { Player } from './Player';

const publicToken = 'public-7p7n35m68yzvbgrug2gfamfo';
const templateId = '65b7e907-6055-4b39-9669-4735544b012b';

let player: Player | undefined;
let modifications: any = {};

document.addEventListener('DOMContentLoaded', function() {

  // Set up player
  player = new Player(document.querySelector('#video-player'), publicToken);

  player.once('ready', () => {
    // Load template by ID
    player.loadTemplate(templateId);
  });

  player.on('load', async () => {
    // When the player is done loading, set up the input controls
    await setUpInputControls();
  });

  player.on('error', (error) => {
    console.error(error);
  });
});

async function setUpInputControls() {

  const htmlElement = document.querySelector('#dynamic-elements');
  htmlElement.innerHTML = '';

  // Create input controls for each dynamic element in the template
  const dynamicElements = await player.getDynamicElements();
  for (const element of dynamicElements) {

    if (element.type === 'text') {
      htmlElement.append(setUpTextInputControl(element));
    } else if (element.type === 'image') {
      htmlElement.append(setUpImageInputControl(element));
    } else if (element.type === 'video') {
      htmlElement.append(setUpVideoInputControl(element));
    }
  }
}

function setUpTextInputControl(element: Record<string, any>): HTMLElement {

  // Create <input> element
  const htmlInputElement = document.createElement('input');
  htmlInputElement.placeholder = element.text;
  htmlInputElement.addEventListener('input', () => applyModification(element, htmlInputElement.value));

  // Create <label> element
  const htmlLabelElement = document.createElement('label');
  htmlLabelElement.className = 'dynamic-element-label';
  htmlLabelElement.append(element.name ?? element.type);
  htmlLabelElement.append(htmlInputElement);

  return htmlLabelElement;
}

function setUpImageInputControl(element: Record<string, any>): HTMLElement {
  return setUpMediaInputControl(element, {
      '(default)': '',
      'Example image 1': 'https://creatomate-static.s3.amazonaws.com/demo/image1.jpg',
      'Example image 2': 'https://creatomate-static.s3.amazonaws.com/demo/image2.jpg',
      'Example image 3': 'https://creatomate-static.s3.amazonaws.com/demo/image3.jpg',
    },
  );
}

function setUpVideoInputControl(element: Record<string, any>): HTMLElement {
  return setUpMediaInputControl(element, {
      '(default)': '',
      'Example video 1': 'https://creatomate-static.s3.amazonaws.com/demo/video1.mp4',
      'Example video 2': 'https://creatomate-static.s3.amazonaws.com/demo/video2.mp4',
      'Example video 3': 'https://creatomate-static.s3.amazonaws.com/demo/video3.mp4',
    },
  );
}

function setUpMediaInputControl(element: Record<string, any>, examples: Record<string, string>): HTMLElement {

  // Create <select> element
  const htmlSelectElement = document.createElement('select');
  htmlSelectElement.addEventListener('change', () => applyModification(element, htmlSelectElement.value));

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
  htmlLabelElement.append(element.name ?? element.type);
  htmlLabelElement.append(htmlSelectElement);

  return htmlLabelElement;
}

function applyModification(element: Record<string, any>, value: string) {

  const selector = element.name ?? element.type;

  if (value) {
    // Set modification
    modifications[selector] = value;
  } else {
    // Clear modification
    delete modifications[selector];
  }

  player?.setModifications(modifications);
}

const createRenderButton = document.querySelector('#create-render-button') as HTMLButtonElement;
createRenderButton?.addEventListener('click', async function() {

  if (player) {

    // Create Direct API url: https://creatomate.com/docs/api/direct-api/url-format
    let url = 'https://api.creatomate.com/v1/direct'
      + `?template_id=${templateId}`
      + '&output_format=mp4'
      + '&max_width=320';

    // Add modifications to URL
    for (const selector of Object.keys(modifications)) {
      url += `&${encodeURIComponent(selector)}=${encodeURIComponent(modifications[selector])}`;
    }

    window.open(url, '_blank');
  }
});

const getImageButton = document.querySelector('#get-image-button') as HTMLButtonElement;
getImageButton?.addEventListener('click', async function() {

  if (player) {

    // Extracts the current frame and opens it in a new window
    const blobUrl = URL.createObjectURL(await player.getImage('image/png'));
    window.open(blobUrl, '_blank');
  }
});
