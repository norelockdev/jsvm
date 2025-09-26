import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { copyTextToClipboard, getElem, postData } from './utils';

function createEditor(parent: HTMLElement, defaultValue: string = '') {
  return new EditorView({
    state: EditorState.create({
      doc: defaultValue,
      extensions: [
        basicSetup,
        javascript(),
        EditorView.lineWrapping
      ],
    }),
    parent,
  });
}

const codeInput = createEditor(getElem('code-input-parent'), '// your JavaScript code goes here');
const codeOutput = createEditor(getElem('code-output-parent'), '// output base64 encoded bytecode goes here');

function showInput() {
  const btns = document.querySelectorAll('.toggle-editor-button') as any;
  btns.forEach((btn: HTMLElement) => {
    if (btn.classList.contains('active')) {
      btn.classList.remove('active');
    }
  });

  getElem('code-output').classList.add('hidden');
  getElem('code-input').classList.remove('hidden');
  getElem('show-input-btn').classList.add('active');
}

function showOutput() {
  const btns = document.querySelectorAll('.toggle-editor-button') as any;
  btns.forEach((btn: HTMLElement) => {
    if (btn.classList.contains('active')) {
      btn.classList.remove('active');
    }
  });

  getElem('code-output').classList.remove('hidden');
  getElem('code-input').classList.add('hidden');
  getElem('show-output-btn').classList.add('active');
}

getElem('show-input-btn').onclick = showInput;
getElem('show-output-btn').onclick = showOutput;
getElem('compile-btn').onclick = function callback() {

  const code = codeInput.state.doc.toString();
  // @ts-ignore
  const es5Code = code;

  postData('api/compile', { code: es5Code}).then((json) => {
    const { code } = json;
    codeOutput.dispatch({changes: {from: 0, to: codeOutput.state.doc.length, insert: ("" + code)}})
  }).catch(err => {
    throw err;
  })
};

getElem('copy-btn').onclick = function callback() {
  const code = codeOutput.state.doc.toString();
  copyTextToClipboard(code);
};

getElem('download-btn').onclick = function callback() { };
