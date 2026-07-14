import { suppressNextClick } from '../suppressSyntheticClick';

function click(el: HTMLElement) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

describe('suppressNextClick', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
    jest.useRealTimers();
  });

  it('swallows exactly the next click on the target', () => {
    const onClick = jest.fn();
    el.addEventListener('click', onClick);

    suppressNextClick(el);
    click(el);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not swallow a click that arrives after the suppressed one', () => {
    const onClick = jest.fn();
    el.addEventListener('click', onClick);

    suppressNextClick(el);
    click(el);
    click(el);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('re-arming before a click resolves replaces (not stacks) the listener', () => {
    const onClick = jest.fn();
    el.addEventListener('click', onClick);

    suppressNextClick(el);
    suppressNextClick(el);
    click(el);

    expect(onClick).not.toHaveBeenCalled();

    // Only one suppressor should have been armed, so the next click fires.
    click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not leave a dangling listener if click never fires', () => {
    jest.useFakeTimers();

    const onClick = jest.fn();
    el.addEventListener('click', onClick);

    suppressNextClick(el);
    jest.advanceTimersByTime(0);

    // Fallback should have removed the armed listener; a later click fires normally.
    click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('only suppresses clicks on the target it was armed for', () => {
    const other = document.createElement('div');
    document.body.appendChild(other);
    const onOtherClick = jest.fn();
    other.addEventListener('click', onOtherClick);

    suppressNextClick(el);
    click(other);

    expect(onOtherClick).toHaveBeenCalledTimes(1);
    other.remove();
  });
});
