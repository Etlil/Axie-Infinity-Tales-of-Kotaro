import {act,fireEvent,render,screen} from '@testing-library/react';
import DialogueBox from './DialogueBox';
test('X reveals the current line before advancing, and repeated keys cannot skip it',()=>{
  jest.useFakeTimers();const advance=jest.fn();
  const view=render(<DialogueBox title="A promise" text="Restore Atia with the amulet." onAdvance={advance}/>);
  act(()=>jest.advanceTimersByTime(56));expect(view.container.querySelector('.dialogue-copy')).toHaveTextContent('Rest');
  fireEvent.keyDown(document,{key:'x',repeat:true});expect(advance).not.toHaveBeenCalled();
  fireEvent.keyDown(document,{key:'x'});expect(view.container.querySelector('.dialogue-copy')).toHaveTextContent('Restore Atia with the amulet.');
  expect(advance).not.toHaveBeenCalled();fireEvent.keyDown(document,{key:'x'});expect(advance).toHaveBeenCalledTimes(1);
  view.unmount();jest.useRealTimers();
});
test('touch reveal, highlighted words, and pause work without advancing the story early',()=>{
  const advance=jest.fn(),props={title:'The light',text:'Atia needs the amulet.',onAdvance:advance};
  const view=render(<DialogueBox {...props}/>);fireEvent.click(screen.getByRole('button',{name:'Reveal dialogue'}));
  expect(view.container.querySelector('em')).toHaveTextContent('Atia');expect(advance).not.toHaveBeenCalled();
  view.rerender(<DialogueBox {...props} paused/>);fireEvent.keyDown(document,{key:'Enter'});expect(advance).not.toHaveBeenCalled();
  view.rerender(<DialogueBox {...props}/>);fireEvent.click(screen.getByRole('button',{name:'Continue'}));expect(advance).toHaveBeenCalledTimes(1);
});
