import { EMPTY_WALKER_FORM, toWalkerDraft } from './walkerForm';

const filled = {
  ...EMPTY_WALKER_FORM,
  fullName: ' Andrés Gómez ',
  documentNumber: '1.020.304.050',
  phone: '300 123 4567',
};

describe('toWalkerDraft (RF-002)', () => {
  it('cleans what the walker typed: spaces, dots in the document and spaces in the phone', () => {
    expect(toWalkerDraft(filled)).toEqual({
      draft: { fullName: 'Andrés Gómez', documentType: 'CC', documentNumber: '1020304050', phone: '3001234567' },
    });
  });

  it('sends the experience only when there is one', () => {
    const result = toWalkerDraft({ ...filled, experience: ' 3 años ' });

    expect(result).toEqual({ draft: expect.objectContaining({ experience: '3 años' }) });
  });

  it('asks for the required fields', () => {
    expect(toWalkerDraft(EMPTY_WALKER_FORM)).toEqual({
      errors: {
        fullName: 'Escribe tu nombre completo.',
        documentNumber: 'Escribe tu número de documento.',
        phone: 'Escribe tu celular de 10 dígitos.',
      },
    });
  });

  it('rejects a phone that is not 10 digits before sending', () => {
    expect(toWalkerDraft({ ...filled, phone: '30012' })).toEqual({
      errors: { phone: 'Escribe tu celular de 10 dígitos.' },
    });
  });
});
