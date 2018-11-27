import { helper as buildHelper } from '@ember/component/helper';

const MESSAGE_TYPES = {
  info: {
    class: 'is-info',
    glyphClass: 'has-text-info',
    glyph: 'information-circled',
    text: 'Info',
  },
  success: {
    class: 'is-success',
    glyphClass: 'has-text-success',
    glyph: 'checkmark-circled',
    text: 'Success',
  },
  danger: {
    class: 'is-danger',
    glyphClass: 'has-text-danger',
    glyph: 'close-circled',
    text: 'Error',
  },
  warning: {
    class: 'is-warning',
    glyphClass: 'has-text-warning',
    glyph: 'alert-circled',
    text: 'Warning',
  },
};

export function messageTypes([type]) {
  return MESSAGE_TYPES[type];
}

export default buildHelper(messageTypes);
