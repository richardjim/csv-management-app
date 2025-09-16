import '@testing-library/jest-dom';

global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

global.Blob = jest.fn((content, options) => ({
  content,
  options,
  type: options.type,
}));

const originalCreateElement = document.createElement.bind(document);
document.createElement = (tagName, ...args) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: jest.fn(),
    };
  }
  return originalCreateElement(tagName, ...args);
};
