// This code is AI written, and has not been fully human-reviewed
// http://pointless.dev/articles/ai-and-pointless/

import process, { stdin, stdout } from "node:process";
import { emitKeypressEvents } from "node:readline";
import { readFile, writeFile } from "node:fs/promises";

// ---------------------------------------------------------------------------
// Public error types thrown by getLine
// ---------------------------------------------------------------------------

export class ReplInterrupt extends Error {
  constructor() {
    super("keyboard interrupt");
    this.name = "ReplInterrupt";
  }
}

export class ReplEOF extends Error {
  constructor() {
    super("EOF");
    this.name = "ReplEOF";
  }
}

// ---------------------------------------------------------------------------
// PromptLayer — handles line editing, history, and rendering for one prompt
// ---------------------------------------------------------------------------

class PromptLayer {
  constructor(promptStr, continuationPrompt, history, highlight, isComplete) {
    this.prompt = promptStr;
    this.continuationPrompt = continuationPrompt;
    this._highlight = highlight ?? null;
    this._isComplete = isComplete ?? null;
    this._checkingComplete = false;
    this.buffer = "";
    this.cursor = 0;
    this.history = history;
    this.historyIndex = -1;
    this.savedBuffer = "";
    this.resolve = null;
    this.reject = null;
    this._lastCursorRow = 0;
    this._searchMode = false;
    this._searchQuery = "";
    this._searchMatchIndex = -1;
    this._searchFailing = false;
    this._preSearchBuffer = "";
    this._preSearchCursor = 0;
  }

  _searchFind(fromIndex) {
    if (!this._searchQuery) {
      this._searchMatchIndex = -1;
      this._searchFailing = false;
      this.buffer = "";
      this.cursor = 0;
      return;
    }
    for (let i = fromIndex; i < this.history.length; i++) {
      if (this.history[i].includes(this._searchQuery)) {
        this._searchMatchIndex = i;
        this._searchFailing = false;
        this.buffer = this.history[i];
        this.cursor = this.buffer.indexOf(this._searchQuery) +
          this._searchQuery.length;
        return;
      }
    }
    this._searchFailing = true;
  }

  _searchCycle() {
    this._searchFind(this._searchMatchIndex + 1);
  }

  handleKey(str, key) {
    if (!key) key = {};
    if (this._checkingComplete) return;

    // -- Ctrl+R: reverse history search -----------------------------------
    if (key.ctrl && key.name === "r") {
      if (!this._searchMode) {
        this._searchMode = true;
        this._searchQuery = "";
        this._searchMatchIndex = -1;
        this._searchFailing = false;
        this._preSearchBuffer = this.buffer;
        this._preSearchCursor = this.cursor;
        this.buffer = "";
        this.cursor = 0;
      } else {
        this._searchCycle();
      }
      this.render();
      return;
    }

    // -- Search mode: intercept most keys ---------------------------------
    if (this._searchMode) {
      if (key.ctrl && key.name === "c") {
        this._searchMode = false;
        this.buffer = this._preSearchBuffer;
        this.cursor = this._preSearchCursor;
        this.render();
        return;
      }
      if (key.name === "escape" || (key.ctrl && key.name === "g")) {
        this._searchMode = false;
        this.buffer = this._preSearchBuffer;
        this.cursor = this._preSearchCursor;
        this.render();
        return;
      }
      if (key.name === "backspace") {
        this._searchQuery = this._searchQuery.slice(0, -1);
        this._searchFind(0);
        this.render();
        return;
      }
      if (str && !key.ctrl && !key.meta && str.charCodeAt(0) >= 32) {
        this._searchQuery += str;
        this._searchFind(0);
        this.render();
        return;
      }
      // Any other key: accept current match and fall through to process it
      this._searchMode = false;
      this.cursor = this.buffer.length;
    }

    // -- Ctrl+C: interrupt ------------------------------------------------
    if (key.ctrl && key.name === "c") {
      stdout.write("^C\n");
      this._lastCursorRow = 0;
      this.reject({ type: "interrupt", empty: this.buffer.length === 0 });
      return;
    }

    // -- Ctrl+D: EOF on empty, delete-char otherwise ----------------------
    if (key.ctrl && key.name === "d") {
      if (this.buffer.length === 0) {
        stdout.write("\n");
        this._lastCursorRow = 0;
        this.reject({ type: "eof" });
        return;
      }
      if (this.cursor < this.buffer.length) {
        this.buffer = this.buffer.slice(0, this.cursor) +
          this.buffer.slice(this.cursor + 1);
        this.render();
      }
      return;
    }

    // -- Alt+Enter: insert newline without submitting ---------------------
    if (key.meta && key.name === "return") {
      this.buffer = this.buffer.slice(0, this.cursor) + "\n" +
        this.buffer.slice(this.cursor);
      this.cursor++;
      this.render();
      return;
    }

    // -- Enter: check completion, then submit or insert newline -----------
    if (key.name === "return") {
      this._checkingComplete = true;
      Promise.resolve(this._isComplete ? this._isComplete(this.buffer) : true)
        .then((complete) => {
          this._checkingComplete = false;
          if (complete) {
            this.cursor = this.buffer.length;
            this.render();
            stdout.write("\n");
            this._lastCursorRow = 0;
            this.resolve(this.buffer);
          } else {
            this.buffer = this.buffer.slice(0, this.cursor) + "\n" +
              this.buffer.slice(this.cursor);
            this.cursor++;
            this.render();
          }
        });
      return;
    }

    // -- Backspace --------------------------------------------------------
    if (key.name === "backspace" && !key.meta) {
      if (this.cursor > 0) {
        this.buffer = this.buffer.slice(0, this.cursor - 1) +
          this.buffer.slice(this.cursor);
        this.cursor--;
        this.render();
      }
      return;
    }

    // -- Delete -----------------------------------------------------------
    if (key.name === "delete") {
      if (this.cursor < this.buffer.length) {
        this.buffer = this.buffer.slice(0, this.cursor) +
          this.buffer.slice(this.cursor + 1);
        this.render();
      }
      return;
    }

    // -- Left / Ctrl+Left / Alt+Left --------------------------------------
    if (key.name === "left") {
      if (key.ctrl || key.meta) {
        this.cursor = this._wordLeft();
      } else if (this.cursor > 0) {
        this.cursor--;
      }
      this.render();
      return;
    }

    // -- Right / Ctrl+Right / Alt+Right -----------------------------------
    if (key.name === "right") {
      if (key.ctrl || key.meta) {
        this.cursor = this._wordRight();
      } else if (this.cursor < this.buffer.length) {
        this.cursor++;
      }
      this.render();
      return;
    }

    // -- Ctrl+Up: history prev (jump whole block) -------------------------
    if (key.ctrl && key.name === "up") {
      if (
        this.history.length > 0 && this.historyIndex < this.history.length - 1
      ) {
        if (this.historyIndex === -1) this.savedBuffer = this.buffer;
        this.historyIndex++;
        this.buffer = this.history[this.historyIndex];
        this.cursor = this.buffer.length;
        this.render();
      }
      return;
    }

    // -- Ctrl+Down: history next (jump whole block) -----------------------
    if (key.ctrl && key.name === "down") {
      if (this.historyIndex > -1) {
        this.historyIndex--;
        this.buffer = this.historyIndex === -1
          ? this.savedBuffer
          : this.history[this.historyIndex];
        this.cursor = this.buffer.length;
        this.render();
      }
      return;
    }

    // -- Up: move up one logical line, or history prev --------------------
    if (key.name === "up") {
      const lastNl = this.buffer.lastIndexOf("\n", this.cursor - 1);
      if (lastNl !== -1) {
        const colInLine = this.cursor - (lastNl + 1);
        const prevLineEnd = lastNl;
        const prevLineStart = this.buffer.lastIndexOf("\n", lastNl - 1) + 1;
        this.cursor = prevLineStart +
          Math.min(colInLine, prevLineEnd - prevLineStart);
        this.render();
      } else if (
        this.history.length > 0 && this.historyIndex < this.history.length - 1
      ) {
        if (this.historyIndex === -1) this.savedBuffer = this.buffer;
        this.historyIndex++;
        this.buffer = this.history[this.historyIndex];
        this.cursor = this.buffer.length;
        this.render();
      }
      return;
    }

    // -- Down: move down one logical line, or history next ----------------
    if (key.name === "down") {
      const nextNl = this.buffer.indexOf("\n", this.cursor);
      if (nextNl !== -1) {
        const lineStart = this.buffer.lastIndexOf("\n", this.cursor - 1) + 1;
        const colInLine = this.cursor - lineStart;
        const nextLineStart = nextNl + 1;
        const nextLineEnd = this.buffer.indexOf("\n", nextLineStart);
        const nextLineLen =
          (nextLineEnd === -1 ? this.buffer.length : nextLineEnd) -
          nextLineStart;
        this.cursor = nextLineStart + Math.min(colInLine, nextLineLen);
        this.render();
      } else if (this.historyIndex > -1) {
        this.historyIndex--;
        this.buffer = this.historyIndex === -1
          ? this.savedBuffer
          : this.history[this.historyIndex];
        this.cursor = this.buffer.length;
        this.render();
      }
      return;
    }

    // -- Home / Ctrl+A: start of line; Ctrl+Home: start of buffer --------
    if (key.name === "home" || (key.ctrl && key.name === "a")) {
      if (key.ctrl && key.name === "home") {
        this.cursor = 0;
      } else {
        this.cursor = this.buffer.lastIndexOf("\n", this.cursor - 1) + 1;
      }
      this.render();
      return;
    }

    // -- End / Ctrl+E: end of line; Ctrl+End: end of buffer --------------
    if (key.name === "end" || (key.ctrl && key.name === "e")) {
      if (key.ctrl && key.name === "end") {
        this.cursor = this.buffer.length;
      } else {
        const nextNl = this.buffer.indexOf("\n", this.cursor);
        this.cursor = nextNl === -1 ? this.buffer.length : nextNl;
      }
      this.render();
      return;
    }

    // -- Ctrl+B: back one char --------------------------------------------
    if (key.ctrl && key.name === "b") {
      if (this.cursor > 0) this.cursor--;
      this.render();
      return;
    }

    // -- Ctrl+F: forward one char -----------------------------------------
    if (key.ctrl && key.name === "f") {
      if (this.cursor < this.buffer.length) this.cursor++;
      this.render();
      return;
    }

    // -- Ctrl+U: kill to start of current line ----------------------------
    if (key.ctrl && key.name === "u") {
      const lineStart = this.buffer.lastIndexOf("\n", this.cursor - 1) + 1;
      this.buffer = this.buffer.slice(0, lineStart) +
        this.buffer.slice(this.cursor);
      this.cursor = lineStart;
      this.render();
      return;
    }

    // -- Ctrl+K: kill to end of current line ------------------------------
    if (key.ctrl && key.name === "k") {
      const nextNl = this.buffer.indexOf("\n", this.cursor);
      this.buffer = this.buffer.slice(0, this.cursor) +
        (nextNl === -1 ? "" : this.buffer.slice(nextNl));
      this.render();
      return;
    }

    // -- Ctrl+W / Alt+Backspace: kill word back ---------------------------
    if (
      (key.ctrl && key.name === "w") || (key.meta && key.name === "backspace")
    ) {
      const target = this._wordLeft();
      this.buffer = this.buffer.slice(0, target) +
        this.buffer.slice(this.cursor);
      this.cursor = target;
      this.render();
      return;
    }

    // -- Alt+D: kill word forward -----------------------------------------
    if (key.meta && key.name === "d") {
      const target = this._wordRight();
      this.buffer = this.buffer.slice(0, this.cursor) +
        this.buffer.slice(target);
      this.render();
      return;
    }

    // -- Ctrl+L: clear screen ---------------------------------------------
    if (key.ctrl && key.name === "l") {
      stdout.write("\x1b[2J\x1b[H");
      this._lastCursorRow = 0;
      this.render();
      return;
    }

    // -- Printable character ----------------------------------------------
    if (str && !key.ctrl && !key.meta) {
      this.buffer = this.buffer.slice(0, this.cursor) +
        str +
        this.buffer.slice(this.cursor);
      this.cursor += str.length;
      this.render();
    }
  }

  render() {
    const cols = stdout.columns || 80;

    // Strip ANSI codes for cursor math — escape bytes have no visual width.
    // In search mode, swap in the search indicator as the prompt.
    let promptPlain, displayPrompt, contPlain, displayCont;
    if (this._searchMode) {
      const label = this._searchFailing
        ? `(failing search: "${this._searchQuery}"):\n`
        : `(search: "${this._searchQuery}"):\n`;
      promptPlain = displayPrompt = label;
      contPlain = displayCont = "";
    } else {
      promptPlain = stripAnsi(this.prompt);
      displayPrompt = this.prompt;
      contPlain = stripAnsi(this.continuationPrompt);
      displayCont = this.continuationPrompt;
    }

    // Build the visual string by inserting the continuation prompt after each
    // \n. This is what gets written to the terminal and used for all cursor
    // position math. Buffer cursor coordinates are mapped to visual coordinates
    // by accounting for the extra continuation prompt characters.
    const contLen = contPlain.length;
    const nlsBefore =
      (this.buffer.slice(0, this.cursor).match(/\n/g) ?? []).length;
    const plainContent = promptPlain +
      this.buffer.split("\n").join("\n" + contPlain);
    const visualCursorPos = promptPlain.length + this.cursor +
      nlsBefore * contLen;

    // Optionally apply syntax highlighting for display only. Cursor math always
    // uses plainContent since color codes have non-zero byte length but zero
    // display width.
    const displayBuffer = (!this._searchMode && this._highlight)
      ? (this._highlight(this.buffer) ?? this.buffer)
      : this.buffer;

    // Build displayContent inserting the continuation prompt between lines.
    // After each insertion, re-inject the last open ANSI code so tokens that
    // span a newline (e.g. multi-line strings) keep their color on the next
    // line even if the continuation prompt contains a reset sequence.
    const displayParts = displayBuffer.split("\n");
    let displayContent = displayPrompt;
    let openCode = "";
    for (let i = 0; i < displayParts.length; i++) {
      if (i > 0) displayContent += "\n" + displayCont + openCode;
      displayContent += displayParts[i];
      for (const [m] of displayParts[i].matchAll(/\u001b\[[^m]*m/g)) {
        openCode = m === "\x1b[0m" ? "" : m;
      }
    }

    if (this._lastCursorRow > 0) {
      stdout.write(`\x1b[${this._lastCursorRow}A`);
    }
    stdout.write("\r\x1b[J");
    stdout.write(displayContent); // CRLF patch converts \n → \r\n

    const { row: targetRow, col: targetCol } = visualPos(
      plainContent,
      visualCursorPos,
      cols,
    );
    const { row: endRow } = visualPos(plainContent, plainContent.length, cols);

    const rowDiff = endRow - targetRow;
    if (rowDiff > 0) {
      stdout.write(`\x1b[${rowDiff}A`);
    }
    stdout.write(`\x1b[${targetCol + 1}G`);

    this._lastCursorRow = targetRow;
  }

  insertText(text) {
    this.buffer = this.buffer.slice(0, this.cursor) + text +
      this.buffer.slice(this.cursor);
    this.cursor += text.length;
    this.render();
  }

  _wordLeft() {
    let i = this.cursor - 1;
    while (i >= 0 && !/\w/.test(this.buffer[i])) i--;
    while (i >= 0 && /\w/.test(this.buffer[i])) i--;
    return i + 1;
  }

  _wordRight() {
    let i = this.cursor;
    while (i < this.buffer.length && !/\w/.test(this.buffer[i])) i++;
    while (i < this.buffer.length && /\w/.test(this.buffer[i])) i++;
    return i;
  }
}

function stripAnsi(str) {
  return str.replace(/\u001b\[[^m]*m/g, "");
}

// Returns the visual { row, col } of the cursor after printing `text.slice(0,
// charIndex)` to a terminal with `cols` columns. Handles embedded \n characters
// (the stdout CRLF patch means each \n produces a real line break).
function visualPos(text, charIndex, cols) {
  const prefix = text.slice(0, charIndex);
  const lines = prefix.split("\n");
  let row = 0;
  for (let i = 0; i < lines.length - 1; i++) {
    row += Math.floor(lines[i].length / cols) + 1; // wrapping rows + newline row
  }
  const last = lines.at(-1);
  row += Math.floor(last.length / cols);
  return { row, col: last.length % cols };
}

// ---------------------------------------------------------------------------
// AsyncRepl — main REPL class
// ---------------------------------------------------------------------------
//
// Constructor options:
//   prompt             Main prompt string (default ">> ")
//   continuationPrompt Continuation prompt for multi-line input (default ".. ")
//   historyPath        Path to persist history (optional)
//   historyLimit       Max history entries (default 500)
//   isComplete(buf)    Return true/false (or Promise) whether buf is a complete
//                      command. Default: always true (single-line mode).
//   handler(input)     Async function to evaluate complete input. Required.
//
// Public methods:
//   start()            Begin the REPL loop. Returns promise that resolves on exit.
//   stop()             Programmatic exit.
//   getLine(prompt)    Push an inner prompt layer, returns Promise<string>.
//                      Throws ReplInterrupt on Ctrl+C, ReplEOF on Ctrl+D.
//   getKey()           Wait for a single keypress, returns Promise<{str, key}>.
//                      Throws ReplInterrupt on Ctrl+C, ReplEOF on Ctrl+D.

export class AsyncRepl {
  constructor(opts) {
    this._prompt = opts.prompt ?? ">> ";
    this._continuationPrompt = opts.continuationPrompt ?? ".. ";
    this._isComplete = opts.isComplete ?? (() => true);
    this._handler = opts.handler;
    this._highlight = opts.highlight ?? null;
    this._historyPath = opts.historyPath ?? null;
    this._historyLimit = opts.historyLimit ?? 500;

    this._history = [];
    this._innerHistories = new Map();
    this._stack = [];
    this._inputBuffer = [];
    this._cancelEval = null;
    this._keyWaiter = null;
    this._stopped = false;
    this._inputActive = false;
    this._refManaged = false;
    this._keypressHandler = null;
    this._origStdoutWrite = null;
    this._pasting = false;
    this._pasteBuffer = "";
    this._pendingPaste = null;
  }

  async start() {
    await this._loadHistory();

    if (!this._inputActive) {
      this._setupInput();
      this._inputActive = true;
    }

    let lastInterruptTime = 0;

    try {
      while (!this._stopped) {
        let input;

        try {
          input = await this._readInput();
        } catch (err) {
          if (err?.type === "eof") break;

          if (err?.type === "interrupt") {
            if (err.empty && Date.now() - lastInterruptTime < 2000) break;

            if (err.empty) {
              lastInterruptTime = Date.now();
              stdout.write("(To exit, press Ctrl+C again or Ctrl+D)\n");
            }

            continue;
          }

          throw err;
        }

        lastInterruptTime = 0;
        if (!input.trim()) continue;

        if (input.trim() && input !== this._history[0]) {
          this._history.unshift(input);
        }

        if (this._history.length > this._historyLimit) {
          this._history.length = this._historyLimit;
        }

        await this._saveHistory();

        // Eval with Ctrl+C cancel support via Promise.race
        const controller = new AbortController();
        let cancelEval;
        const cancelPromise = new Promise((resolve) => {
          cancelEval = () => {
            controller.abort();
            resolve({ cancelled: true });
          };
        });
        this._cancelEval = cancelEval;

        await Promise.race([
          this._handler(input, controller.signal),
          cancelPromise,
        ]);

        this._cancelEval = null;
      }
    } finally {
      this._teardownInput();
      this._inputActive = false;
      await this._saveHistory();
    }
  }

  stop() {
    this._stopped = true;

    if (this._stack.length > 0) {
      stdout.write("\n");
      this._stack.at(-1).reject({ type: "eof" });
    }
  }

  async getLine(promptStr) {
    if (!this._inputActive) {
      this._setupInput();
      this._inputActive = true;
      this._refManaged = true;
      stdin.unref();
    }

    if (!this._innerHistories.has(promptStr)) {
      this._innerHistories.set(promptStr, []);
    }
    const history = this._innerHistories.get(promptStr);

    if (this._refManaged) stdin.ref();

    try {
      const value = await this._pushLayer(promptStr, history);

      if (value.trim() && value !== history[0]) {
        history.unshift(value);
        if (history.length > this._historyLimit) {
          history.length = this._historyLimit;
        }
      }

      return value;
    } catch (err) {
      if (err?.type === "interrupt") throw new ReplInterrupt();
      if (err?.type === "eof") throw new ReplEOF();
      throw err;
    } finally {
      if (this._refManaged) stdin.unref();
    }
  }

  async getKey() {
    if (!this._inputActive) {
      this._setupInput();
      this._inputActive = true;
      this._refManaged = true;
      stdin.unref();
    }

    if (this._refManaged) stdin.ref();

    try {
      return await new Promise((resolve, reject) => {
        this._keyWaiter = (str, key) => {
          if (key.ctrl && key.name === "c") {
            stdout.write("\n");
            reject(new ReplInterrupt());
            return;
          }
          if (key.ctrl && key.name === "d") {
            stdout.write("\n");
            reject(new ReplEOF());
            return;
          }
          resolve({ str, key });
        };
      });
    } finally {
      this._keyWaiter = null;
      if (this._refManaged) stdin.unref();
    }
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  _readInput() {
    return this._pushLayer(
      this._prompt,
      this._history,
      this._highlight,
      this._isComplete,
    );
  }

  _pushLayer(
    promptStr,
    history,
    highlight = this._highlight,
    isComplete = null,
  ) {
    return new Promise((resolve, reject) => {
      const layer = new PromptLayer(
        promptStr,
        this._continuationPrompt,
        history || [],
        highlight,
        isComplete,
      );

      layer.resolve = (value) => {
        this._stack.pop();
        resolve(value);
      };

      layer.reject = (err) => {
        this._stack.pop();
        reject(err);
      };

      this._stack.push(layer);
      layer.render();

      // Insert any paste that arrived while no layer was active
      if (this._pendingPaste) {
        layer.insertText(this._pendingPaste);
        this._pendingPaste = null;
      }

      // Replay any keystrokes that were buffered while no layer was active
      const buffered = this._inputBuffer;
      this._inputBuffer = [];

      for (let i = 0; i < buffered.length; i++) {
        if (this._stack.at(-1) !== layer) {
          // Layer was settled during replay — re-buffer remaining keys
          this._inputBuffer = buffered.slice(i).concat(this._inputBuffer);
          break;
        }

        layer.handleKey(buffered[i].str, buffered[i].key);
      }
    });
  }

  _onKeypress(str, key) {
    if (!key) key = {};

    // -- Bracketed paste --------------------------------------------------
    if (key.sequence === "\x1b[200~") {
      this._pasting = true;
      this._pasteBuffer = "";
      return;
    }

    if (key.sequence === "\x1b[201~") {
      this._pasting = false;
      const paste = this._pasteBuffer;
      this._pasteBuffer = "";
      if (paste) {
        if (this._stack.length > 0) {
          this._stack.at(-1).insertText(paste);
        } else {
          this._pendingPaste = (this._pendingPaste ?? "") + paste;
        }
      }
      return;
    }

    if (this._pasting) {
      // Accumulate paste content; convert CR to LF
      if (str) this._pasteBuffer += str === "\r" ? "\n" : str;
      return;
    }

    // -- Ctrl+Z: suspend (SIGTSTP) -----------------------------------------
    if (key.ctrl && key.name === "z") {
      // Soft-suspend: restore terminal to cooked mode so the shell works,
      // but keep stdin resumed so the event loop stays alive (pausing stdin
      // would let the process exit when SIGCONT arrives).
      stdout.write("\n");
      stdout.write("\x1b[?2004l");
      stdin.off("keypress", this._keypressHandler);
      if (stdin.isTTY) stdin.setRawMode(false);
      if (this._origStdoutWrite) {
        stdout.write = this._origStdoutWrite;
        this._origStdoutWrite = null;
      }

      process.once("SIGCONT", () => {
        if (stdin.isTTY) stdin.setRawMode(true);
        this._origStdoutWrite = stdout.write;
        const origWrite = stdout.write.bind(stdout);
        stdout.write = function (data, ...args) {
          if (typeof data === "string") {
            data = data.replace(/(?<!\r)\n/g, "\r\n");
          }
          return origWrite(data, ...args);
        };
        stdout.write("\x1b[?2004h");
        stdin.on("keypress", this._keypressHandler);
        if (this._stack.length > 0) {
          this._stack.at(-1)._lastCursorRow = 0;
          this._stack.at(-1).render();
        }
      });

      process.kill(process.pid, "SIGTSTP");
      return;
    }

    // Route to the active prompt layer
    if (this._stack.length > 0) {
      this._stack.at(-1).handleKey(str, key);
      return;
    }

    // No active layer — either evaluating or between prompts

    // Single-key waiter (Console.rawKey)
    if (this._keyWaiter) {
      const waiter = this._keyWaiter;
      this._keyWaiter = null;
      waiter(str, key);
      return;
    }

    // Ctrl+C during eval: detach
    if (key.ctrl && key.name === "c" && this._cancelEval) {
      stdout.write("^C\n");
      this._cancelEval();
      this._cancelEval = null;
      return;
    }

    // Buffer everything else for the next prompt layer
    this._inputBuffer.push({ str, key });
  }

  _setupInput() {
    emitKeypressEvents(stdin);
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();

    // In raw mode the terminal doesn't translate LF to CRLF. Patch
    // stdout.write so that console.log and other output still renders
    // correctly (each \n becomes \r\n).
    this._origStdoutWrite = stdout.write;
    const origWrite = stdout.write.bind(stdout);

    stdout.write = function (data, ...args) {
      if (typeof data === "string") {
        data = data.replace(/(?<!\r)\n/g, "\r\n");
      }

      return origWrite(data, ...args);
    };

    stdout.write("\x1b[?2004h"); // enable bracketed paste mode

    this._keypressHandler = (str, key) => this._onKeypress(str, key);
    stdin.on("keypress", this._keypressHandler);
  }

  _teardownInput() {
    stdout.write("\x1b[?2004l"); // disable bracketed paste mode

    stdin.off("keypress", this._keypressHandler);

    if (stdin.isTTY) stdin.setRawMode(false);
    stdin.pause();

    if (this._origStdoutWrite) {
      stdout.write = this._origStdoutWrite;
      this._origStdoutWrite = null;
    }
  }

  async _loadHistory() {
    if (!this._historyPath) return;

    try {
      const text = await readFile(this._historyPath, "utf8");
      this._history = JSON.parse(text);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
  }

  async _saveHistory() {
    if (!this._historyPath) return;

    await writeFile(
      this._historyPath,
      JSON.stringify(this._history.slice(0, this._historyLimit), null, 2),
    );
  }
}
