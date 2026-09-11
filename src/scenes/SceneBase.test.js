import { EventEmitter } from 'events';
import SceneBase from './SceneBase';

jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {}, Scenes: { Events: { SHUTDOWN: 'shutdown' } } },
}));

function sceneWithKeyboard() {
  const scene = new SceneBase();
  scene.input = { keyboard: new EventEmitter() };
  scene.events = new EventEmitter();
  return scene;
}

test('Enter and Space leave focused HTML activation to the browser', () => {
  const scene = sceneWithKeyboard();
  const navigate = jest.fn();
  scene.bindKey('keydown-ENTER', navigate);
  scene.bindKey('keydown-SPACE', navigate);
  ['button', 'a'].forEach((tag) => {
    const control = document.createElement(tag);
    const icon = document.createElement('span');
    control.appendChild(icon);
    scene.input.keyboard.emit('keydown-ENTER', { target: control });
    scene.input.keyboard.emit('keydown-SPACE', { target: icon });
  });
  expect(navigate).not.toHaveBeenCalled();
  scene.input.keyboard.emit('keydown-ENTER', { target: document.body });
  scene.input.keyboard.emit('keydown-SPACE', { target: document.createElement('canvas') });
  expect(navigate).toHaveBeenCalledTimes(2);
});

test('card and lane shortcuts still work after clicking an HTML button', () => {
  const scene = sceneWithKeyboard();
  const playCard = jest.fn();
  const advance = jest.fn();
  scene.bindKey('keydown-ONE', playCard);
  scene.bindKey('keydown-RIGHT', advance);
  const target = document.createElement('button');
  scene.input.keyboard.emit('keydown-ONE', { target });
  scene.input.keyboard.emit('keydown-RIGHT', { target });
  expect(playCard).toHaveBeenCalledTimes(1);
  expect(advance).toHaveBeenCalledTimes(1);
});

test('typing in editable controls never takes a scene shortcut', () => {
  const scene = sceneWithKeyboard();
  const shortcut = jest.fn();
  scene.bindKey('keydown-ONE', shortcut);
  scene.bindKey('keydown-ENTER', shortcut);
  const editor = document.createElement('div');
  editor.setAttribute('contenteditable', 'true');
  const editorChild = document.createElement('span');
  editor.appendChild(editorChild);
  const targets = ['input', 'textarea', 'select'].map((tag) => document.createElement(tag));
  targets.push(editor, editorChild);
  targets.forEach((target) => {
    scene.input.keyboard.emit('keydown-ONE', { target });
    scene.input.keyboard.emit('keydown-ENTER', { target });
  });
  expect(shortcut).not.toHaveBeenCalled();
});

test('scene shutdown removes the filtered keyboard handler', () => {
  const scene = sceneWithKeyboard();
  const shortcut = jest.fn();
  scene.bindKey('keydown-ENTER', shortcut);
  scene.events.emit('shutdown');
  scene.input.keyboard.emit('keydown-ENTER', { target: document.body });
  expect(shortcut).not.toHaveBeenCalled();
  expect(scene.input.keyboard.listenerCount('keydown-ENTER')).toBe(0);
});
